// 批量扫描：从当前平台侧边栏读取对话列表，逐个在后台标签页中扫描并存储

const DEFAULT_LIMIT = 50;
const TAB_LOAD_TIMEOUT = 15000; // 15 秒超时
const SCAN_SETTLE_DELAY = 3000; // 等页面渲染完成（对话页比首页重）

interface SidebarConversation {
    url: string;
    title: string;
}

/**
 * 向当前 tab 的 content script 请求侧边栏对话列表
 */
async function getSidebarConversations(tabId: number): Promise<SidebarConversation[]> {
    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tabId, { action: 'cobridge.getSidebarConversations' }, (response) => {
            if (chrome.runtime.lastError || !response?.ok) {
                resolve([]);
                return;
            }
            resolve(response.conversations || []);
        });
    });
}

/**
 * 在后台标签页中打开 URL，等待加载完成
 */
function openBackgroundTab(url: string): Promise<chrome.tabs.Tab> {
    return new Promise((resolve, reject) => {
        chrome.tabs.create({ url, active: false }, (tab) => {
            if (!tab.id) {
                reject(new Error('Failed to create tab'));
                return;
            }

            const timeout = setTimeout(() => {
                chrome.tabs.onUpdated.removeListener(listener);
                reject(new Error('Tab load timeout'));
            }, TAB_LOAD_TIMEOUT);

            const listener = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
                if (tabId === tab.id && changeInfo.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(listener);
                    clearTimeout(timeout);
                    resolve(tab);
                }
            };

            chrome.tabs.onUpdated.addListener(listener);
        });
    });
}

/**
 * 向标签页的 content script 发送扫描消息
 * @param expectedUrl 侧边栏已知的对话 URL（Gemini SPA 可能不会更新 window.location）
 */
function scanTab(tabId: number, expectedUrl?: string): Promise<{ pairs: any[]; count: number }> {
    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tabId, { action: 'cobridge.scanCurrentPage', expectedUrl }, (response) => {
            if (chrome.runtime.lastError || !response?.ok) {
                resolve({ pairs: [], count: 0 });
                return;
            }
            resolve({ pairs: response.pairs || [], count: response.count || 0 });
        });
    });
}

/**
 * 将扫描到的对话对发送去向量化并存储
 */
async function vectorizeAndSavePairs(pairs: any[]): Promise<number> {
    let saved = 0;
    const now = Date.now();

    for (const pair of pairs) {
        try {
            await new Promise<void>((resolve) => {
                chrome.runtime.sendMessage(
                    {
                        type: 'cobridge.vectorizeAndSave',
                        data: {
                            url: pair.url,
                            platform: pair.platform,
                            userMessage: pair.user,
                            timestamp: now,
                            turnIndex: pair.turnIndex,
                            messageId: pair.messageId,
                        },
                    },
                    () => resolve(),
                );
            });
            saved++;
        } catch {
            // 忽略单条失败
        }
    }

    return saved;
}

/**
 * 处理批量扫描请求
 * 流程：从侧边栏获取对话列表 → 逐个后台标签页打开 → 扫描 → 向量化 → 关闭
 * 通过 port 连接持续向 popup 报告进度
 */
export function handleBatchScan(port: chrome.runtime.Port) {
    const limit = DEFAULT_LIMIT;

    (async () => {
        try {
            // 查询当前活动标签页
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!activeTab?.id) {
                port.postMessage({ status: 'error', message: 'No active tab found.' });
                return;
            }

            // 1. 从侧边栏获取对话列表
            port.postMessage({ status: 'searching', message: 'Reading sidebar...' });
            const conversations = await getSidebarConversations(activeTab.id);

            if (conversations.length === 0) {
                port.postMessage({ status: 'done', message: 'No conversations found in sidebar.', total: 0, processed: 0, turns: 0 });
                return;
            }

            // 取前 N 个
            const toScan = conversations.slice(0, limit);
            port.postMessage({ status: 'scanning', total: toScan.length, processed: 0, turns: 0 });

            let processed = 0;
            let totalTurns = 0;

            // 2. 逐个处理
            for (const conv of toScan) {
                try {
                    // 打开后台标签页
                    const tab = await openBackgroundTab(conv.url);

                    // 等待页面渲染
                    await new Promise((r) => setTimeout(r, SCAN_SETTLE_DELAY));

                    // 扫描
                    if (tab.id) {
                        const { pairs } = await scanTab(tab.id, conv.url);

                        if (pairs.length > 0) {
                            const saved = await vectorizeAndSavePairs(pairs);
                            totalTurns += saved;
                        }

                        // 关闭标签页
                        chrome.tabs.remove(tab.id).catch(() => {});
                    }
                } catch (err) {
                    console.warn(`[CoBridge] Batch scan failed for ${conv.title}:`, err);
                }

                processed++;
                port.postMessage({
                    status: 'scanning',
                    total: toScan.length,
                    processed,
                    turns: totalTurns,
                    current: conv.title,
                });
            }

            port.postMessage({
                status: 'done',
                message: `Done! Scanned ${processed} conversations, saved ${totalTurns} turns.`,
                total: toScan.length,
                processed,
                turns: totalTurns,
            });
        } catch (err: any) {
            port.postMessage({ status: 'error', message: err.message || 'Batch scan failed' });
        }
    })();
}
