// Offscreen Document：在有完整 DOM API 的环境中运行 embedding 逻辑
// 解决 Service Worker 中无法使用 URL.createObjectURL 的问题

console.log('[CoBridge] Offscreen document script starting...');

// ── 拦截 fetch：对模型 JSON 文件下载增加重试 + 校验 ─────────────
// transformers.js 内部通过 fetch 下载 config.json / tokenizer.json 等文件，
// 网络不稳定时 response body 会被截断，导致 JSON.parse 失败。
// 在 transformers.js 加载之前拦截 fetch，对 JSON 响应做完整性校验并自动重试。

const FETCH_MAX_RETRIES = 3;
const MODEL_HOSTS = ['huggingface.co', 'hf-mirror.com'];

const _originalFetch = globalThis.fetch.bind(globalThis);

globalThis.fetch = async function (
    input: RequestInfo | URL,
    init?: RequestInit,
): Promise<Response> {
    const url =
        typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url;

    // 只对模型下载请求做重试
    const isModelRequest = MODEL_HOSTS.some((h) => url.includes(h));
    if (!isModelRequest) {
        return _originalFetch(input, init);
    }

    const isJsonFile = url.endsWith('.json');
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= FETCH_MAX_RETRIES; attempt++) {
        try {
            const response = await _originalFetch(input, init);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }

            // 对 JSON 文件做完整性校验（防止截断）
            if (isJsonFile) {
                const text = await response.text();
                try {
                    JSON.parse(text); // 验证 JSON 完整性
                } catch {
                    throw new Error(
                        `Truncated JSON response (${text.length} bytes) from ${url}`,
                    );
                }
                // 返回一个新的 Response（因为 body 已被消费）
                return new Response(text, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                });
            }

            return response;
        } catch (err: any) {
            lastError = err;
            console.warn(
                `[CoBridge] Fetch attempt ${attempt}/${FETCH_MAX_RETRIES} failed for ${url}: ${err.message}`,
            );
            if (attempt < FETCH_MAX_RETRIES) {
                const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s
                await new Promise((r) => setTimeout(r, delay));
            }
        }
    }

    throw lastError || new Error(`Fetch failed after ${FETCH_MAX_RETRIES} retries: ${url}`);
};

console.log('[CoBridge] Fetch interceptor installed for model downloads');

// ── 消息监听 ──────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[CoBridge] Offscreen: received message:', request.type);

    // 响应 ping 消息，表示 offscreen document 已准备好
    if (request.type === 'offscreen.ping') {
        console.log('[CoBridge] Offscreen: responding to ping');
        sendResponse({ ok: true, ready: true });
        return false;
    }

    // 其他消息需要异步处理
    if (request.type === 'offscreen.getEmbedding') {
        console.log('[CoBridge] Offscreen: computing embedding for text length:', request.text?.length);

        // 动态导入 embedding 模块
        import('../utils/embeddingService')
            .then(({ getEmbedding }) => getEmbedding(request.text))
            .then((embedding) => {
                console.log('[CoBridge] Offscreen: embedding computed, dimension:', embedding.length);
                sendResponse({ ok: true, embedding });
            })
            .catch((err: Error) => {
                console.error('[CoBridge] Offscreen: embedding failed:', err.message);
                sendResponse({ ok: false, error: err.message });
            });

        return true; // keep channel open for async
    }

    if (request.type === 'offscreen.warmup') {
        console.log('[CoBridge] Offscreen: warming up model...');

        import('../utils/embeddingService')
            .then(({ getExtractor }) => getExtractor())
            .then(() => {
                console.log('[CoBridge] Offscreen: model warmed up');
                sendResponse({ ok: true });
            })
            .catch((err: Error) => {
                console.error('[CoBridge] Offscreen: warmup failed:', err.message);
                sendResponse({ ok: false, error: err.message });
            });

        return true;
    }

    // 忽略其他消息
    return false;
});

console.log('[CoBridge] Offscreen document message listener registered');
