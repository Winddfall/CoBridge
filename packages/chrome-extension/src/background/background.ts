// Background Service Worker 入口
// 职责：接收消息，分发到对应的 handler

import {handleCheckSyncStatus, handleSyncToAgent} from './context-sync/syncHandler';
import {handleFetchImage} from './context-sync/fetchImageHandler';
import {handleVectorizeAndSave, setRequestEmbedding} from './semantic-search/vectorizeHandler';
import {handleSearchConversations, setSearchRequestEmbedding} from './semantic-search/searchHandler';
import {handleNavigateToTurn} from './semantic-search/navigateHandler';

// 初始化时设置 requestEmbedding 函数
setRequestEmbedding(requestEmbeddingFromOffscreen); // 存入
setSearchRequestEmbedding(requestEmbeddingFromOffscreen); // 检索

// Offscreen document 状态
let offscreenCreated = false;
let warmupPromise: Promise<void> | null = null;
let warmupCompleted = false;

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        // 同步到 Agent
        case "cobridge.syncToAgent":
            handleSyncToAgent(request, sendResponse);
            return true;
        // 检查同步状态
        case "cobridge.checkSyncStatus":
            handleCheckSyncStatus(request, sendResponse);
            return true;
        // 抓取照片
        case "cobridge.fetchImage":
            handleFetchImage(request, sendResponse);
            return true;
        // 向量化并存储
        case "cobridge.vectorizeAndSave":
            (async () => {
                try {
                    const result = await handleVectorizeAndSave(request);
                    sendResponse({ ok: true, data: result });
                } catch (err: any) {
                    sendResponse({ ok: false, error: err.message });
                }
            })();
            return true;
        // 语义搜索
        case "cobridge.searchConversations":
            (async () => {
                try {
                    const result = await handleSearchConversations(request);
                    // 保持与 popup 约定：data 为数组，mode 为搜索模式
                    sendResponse({ ok: true, data: result.data, mode: result.mode });
                } catch (err: any) {
                    // 统一错误处理，不会遗漏
                    sendResponse({ ok: false, error: err.message });
                }
            })();
            return true;
        // 滚动到对话位置
        case "cobridge.navigateToTurn":
            (async () => {
                try {
                    const result = await handleNavigateToTurn(request);
                    // 统一在这里回复，成功路径唯一
                    sendResponse({ ok: true, data: result });
                } catch (err: any) {
                    // 统一错误处理，不会遗漏
                    sendResponse({ ok: false, error: err.message });
                }
            })();
            return true;
    }
});

/**
 * 非阻塞预热 embedding 模型（失败不影响主流程）
 */
async function warmupEmbeddingModel(reason: string): Promise<void> {
    if (warmupCompleted) return;
    if (warmupPromise) return warmupPromise;

    warmupPromise = (async () => {
        try {
            await ensureOffscreen();
            const ready = await waitForOffscreenReady(20, 300);
            if (!ready) {
                console.warn(`[CoBridge] Warmup skipped: offscreen not ready (${reason})`);
                return;
            }

            const response = await chrome.runtime.sendMessage({ type: 'offscreen.warmup' });
            if (response?.ok) {
                warmupCompleted = true;
                console.log(`[CoBridge] Embedding model warmup completed (${reason})`);
            } else {
                console.warn(`[CoBridge] Embedding model warmup failed (${reason}):`, response?.error || 'unknown');
            }
        } catch (err: any) {
            console.warn(`[CoBridge] Embedding model warmup error (${reason}):`, err?.message || err);
        } finally {
            warmupPromise = null;
        }
    })();

    return warmupPromise;
}

/**
 * 确保 offscreen document 已创建
 */
async function ensureOffscreen(): Promise<void> {
    if (offscreenCreated) return;

    try {
        await chrome.offscreen.createDocument({
            url: 'src/offscreen/offscreen.html',
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

// 启动后异步预热模型（不阻塞正常消息处理）
void warmupEmbeddingModel('startup');

/**
 * 等待 offscreen document 准备好
 */
async function waitForOffscreenReady(maxRetries = 10, delay = 500): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await chrome.runtime.sendMessage({ type: 'offscreen.ping' });
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
 * requestEmbedding
 * 通过 offscreen document 计算 embedding
 */
async function requestEmbeddingFromOffscreen(text: string): Promise<number[]> {
    console.log('[CoBridge] requestEmbeddingFromOffscreen: text length:', text.length);

    await ensureOffscreen();

    // 兜底：若启动预热未完成，这里等待一次；失败不阻塞主流程
    if (!warmupCompleted) {
        await warmupEmbeddingModel('on-demand');
    }

    // 等待 offscreen document 准备好
    const ready = await waitForOffscreenReady();
    if (!ready) {
        throw new Error('Offscreen document not ready after retries');
    }

    console.log('[CoBridge] Offscreen document ready, sending embedding request...');

    // 给 offscreen 发请求，计算 embedding
    const response = await chrome.runtime.sendMessage({ type: 'offscreen.getEmbedding', text });
    if (!response?.ok) {
        // 失败后异步触发下一轮预热，提升后续请求成功率
        void warmupEmbeddingModel('retry-after-failure');
        throw new Error(response?.error || 'Embedding failed');
    }

    console.log('[CoBridge] Offscreen response:', response);
    return response.embedding;
}