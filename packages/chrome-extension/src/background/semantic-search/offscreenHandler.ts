// Offscreen document 状态
let offscreenCreated: boolean = false;
let warmupPromise: Promise<void> | null = null;
let warmupCompleted: boolean = false;

/**
 * 非阻塞预热 embedding 模型（失败不影响主流程）
 */
export async function warmupEmbeddingModel(reason: string): Promise<void | null> {
    if (warmupCompleted) return;
    if (warmupPromise) return warmupPromise;
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
 *
 * 通过 offscreen document 计算 embedding
 */
export async function requestEmbedding(text: string): Promise<number[]> {
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