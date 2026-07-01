// Background Service Worker 入口
// 职责：接收消息，分发到对应的 handler

import { handleSyncToAgent, handleCheckSyncStatus } from './syncHandler';
import { handleFetchImage } from './fetchImageHandler';
import { handleVectorizeAndSave, setRequestEmbedding } from './vectorizeHandler';
import { handleSearchConversations, setSearchRequestEmbedding } from './searchHandler';
import { handleBatchScan } from './batchScanHandler';

// 初始化时设置 requestEmbedding 函数
setRequestEmbedding(requestEmbeddingFromOffscreen);
setSearchRequestEmbedding(requestEmbeddingFromOffscreen);

// Offscreen document 状态
let offscreenCreated = false;

/**
 * 确保 offscreen document 已创建
 */
async function ensureOffscreen(): Promise<void> {
    if (offscreenCreated) return;

    try {
        await chrome.offscreen.createDocument({
            url: 'offscreen.html',
            reasons: [chrome.offscreen.Reason.WORKERS],
            justification: 'Run transformers.js for embedding computation',
        });
        offscreenCreated = true;
        console.log('[CoBridge] Offscreen document created');
    } catch (err: any) {
        // 如果已经存在，忽略错误
        if (err.message?.includes('already exists') || err.message?.includes('Only a single offscreen document')) {
            offscreenCreated = true;
            console.log('[CoBridge] Offscreen document already exists');
        } else {
            console.error('[CoBridge] Failed to create offscreen document:', err);
            throw err;
        }
    }
}

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 同步到 Agent
    if (request.type === "cobridge.syncToAgent") {
        handleSyncToAgent(request, sendResponse);
        return true;
    }

    // 检查同步状态
    if (request.type === "cobridge.checkSyncStatus") {
        handleCheckSyncStatus(request, sendResponse);
        return true;
    }

    // 抓取图片
    if (request.action === "cobridge.fetchImage") {
        handleFetchImage(request, sendResponse);
        return true;
    }

    // 向量化并存储对话轮次
    if (request.type === "cobridge.vectorizeAndSave") {
        handleVectorizeAndSave(request, sendResponse);
        return true;
    }

    // 语义搜索
    if (request.type === "cobridge.searchConversations") {
        handleSearchConversations(request, sendResponse);
        return true;
    }

    // 跳转到对话并滚动定位
    if (request.type === "cobridge.navigateToTurn") {
        handleNavigateToTurn(request, sendResponse);
        return true;
    }

    // Ping 消息（用于检查 offscreen document 是否准备好）
    // 注意：这个消息会被 background 自己接收到，需要忽略
    if (request.type === "offscreen.ping") {
        // 不处理，让 offscreen document 处理
        return false;
    }
});

// 监听长连接（用于批量扫描等需要持续进度报告的场景）
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'cobridge.batchScan') {
        handleBatchScan(port);
    }
});

/**
 * 等待 offscreen document 准备好（通过 ping 消息确认）
 */
async function waitForOffscreenReady(maxRetries = 10, delay = 500): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await new Promise<any>((resolve, reject) => {
                chrome.runtime.sendMessage(
                    { type: 'offscreen.ping' },
                    (response) => {
                        if (chrome.runtime.lastError) {
                            reject(new Error(chrome.runtime.lastError.message));
                        } else {
                            resolve(response);
                        }
                    }
                );
            });

            if (response?.ready) {
                console.log('[CoBridge] Offscreen document is ready');
                return true;
            }
        } catch (err) {
            console.log('[CoBridge] Waiting for offscreen document... attempt', i + 1);
        }

        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    return false;
}

/**
 * 处理 embedding 请求：确保 offscreen document 存在，然后转发请求
 */
async function handleEmbeddingRequest(
    request: { text: string },
    sendResponse: (response: any) => void,
) {
    console.log('[CoBridge] Handling embedding request, text length:', request.text?.length);

    try {
        const embedding = await requestEmbeddingFromOffscreen(request.text);
        sendResponse({ ok: true, embedding });
    } catch (err: any) {
        console.error('[CoBridge] handleEmbeddingRequest failed:', err.message);
        sendResponse({ ok: false, error: err.message });
    }
}

/**
 * 通过 offscreen document 计算 embedding（供 vectorizeHandler 调用）
 */
async function requestEmbeddingFromOffscreen(text: string): Promise<number[]> {
    console.log('[CoBridge] requestEmbeddingFromOffscreen: text length:', text.length);

    await ensureOffscreen();

    // 等待 offscreen document 准备好
    const ready = await waitForOffscreenReady();
    if (!ready) {
        throw new Error('Offscreen document not ready after retries');
    }

    console.log('[CoBridge] Offscreen document ready, sending embedding request...');

    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { type: 'offscreen.getEmbedding', text },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error('[CoBridge] Failed to send to offscreen:', chrome.runtime.lastError.message);
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }
                console.log('[CoBridge] Offscreen response:', response);
                if (response?.ok) {
                    resolve(response.embedding);
                } else {
                    reject(new Error(response?.error || 'Embedding failed'));
                }
            }
        );
    });
}

/**
 * 跳转到对话并滚动定位（在 background 中重试，不受 popup 生命周期影响）
 */
function handleNavigateToTurn(request: any, sendResponse: (response: any) => void) {
    const { url, userMessage, turnIndex, messageId } = request;
    const MAX_RETRIES = 15;
    const RETRY_DELAY = 1000;

    function tryScroll(tabId: number, attempt = 1) {
        chrome.tabs.sendMessage(tabId, {
            action: 'gv.scrollToTurn',
            userMessage,
            turnIndex,
            messageId,
        }, (response) => {
            if (chrome.runtime.lastError) {
                // content script 还没加载，重试
                if (attempt < MAX_RETRIES) {
                    setTimeout(() => tryScroll(tabId, attempt + 1), RETRY_DELAY);
                }
                return;
            }
            // 跨会话跳转时 messageId 不在当前 DOM 中，found=false 是正常的，无需重试
            if (response?.found) {
                console.log('[CoBridge] scrollToTurn: found and highlighted');
            }
        });
    }

    // 按 pathname 匹配已有 tab（忽略 query 参数和 hash）
    let targetPathname: string;
    try {
        targetPathname = new URL(url).pathname;
    } catch {
        targetPathname = '';
    }

    const findAndActivateTab = (tabs: chrome.tabs.Tab[]) => {
        // 优先找 pathname 完全匹配的 tab
        const matched = targetPathname
            ? tabs.find(t => {
                try { return new URL(t.url || '').pathname === targetPathname; }
                catch { return false; }
            })
            : tabs[0];

        if (matched?.id) {
            chrome.tabs.update(matched.id, { active: true });
            if (matched.windowId) {
                chrome.windows.update(matched.windowId, { focused: true });
            }
            tryScroll(matched.id);
            sendResponse({ ok: true, existing: true });
            return true;
        }
        return false;
    };

    // 查询同域名的所有 tab
    let originPattern: string;
    try {
        originPattern = new URL(url).origin + '/*';
    } catch {
        originPattern = url;
    }

    chrome.tabs.query({ url: originPattern }, (tabs) => {
        if (findAndActivateTab(tabs)) return;

        chrome.tabs.create({ url }, (tab) => {
            if (!tab.id) { sendResponse({ ok: false }); return; }
            const listener = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
                if (tabId === tab.id && changeInfo.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(listener);
                    setTimeout(() => tryScroll(tabId), 2000);
                }
            };
            chrome.tabs.onUpdated.addListener(listener);
            sendResponse({ ok: true, newTab: true });
        });
    });
}
