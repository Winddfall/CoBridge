// Offscreen Document：在有完整 DOM API 的环境中运行 embedding 逻辑

console.log('[CoBridge] Offscreen document script starting...');
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

    let pathName = '';
    try {
        pathName = new URL(url).pathname.toLowerCase();
    } catch {
        pathName = url.toLowerCase();
    }

    const isJsonPath = pathName.endsWith('.json');
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= FETCH_MAX_RETRIES; attempt++) {
        try {
            const response = await _originalFetch(input, init);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }

            // 对 JSON 响应做完整性校验（防止截断）
            const contentType = response.headers.get('content-type')?.toLowerCase() || '';
            const shouldValidateJson = isJsonPath || contentType.includes('application/json');
            if (shouldValidateJson) {
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 响应 ping 消息，表示 offscreen document 已准备好
    if (request.type === 'offscreen.ping') {
        console.log('[CoBridge] Offscreen: responding to ping');
        sendResponse({ ok: true, ready: true });
        return false;
    }
    // 其他消息需要异步处理
    if (request.type === 'offscreen.getEmbedding') {
        console.log('[CoBridge] Offscreen: computing embedding for text length:', request.text?.length);
        (async () => {
            try {
                const { getEmbedding } = await import('../utils/embeddingService');
                const embedding = await getEmbedding(request.text);
                console.log('[CoBridge] Offscreen: embedding computed, dimension:', embedding.length);
                sendResponse({ ok: true, embedding });
            } catch (err: any) {
                console.error('[CoBridge] Offscreen: embedding failed:', err.message);
                sendResponse({ ok: false, error: err.message });
            }
        })();
        return true;
    }
    if (request.type === 'offscreen.warmup') {
        console.log('[CoBridge] Offscreen: warming up model...');
        (async () => {
            try {
                const { getExtractor } = await import('../utils/embeddingService');
                await getExtractor();
                console.log('[CoBridge] Offscreen: model warmed up');
                sendResponse({ ok: true });
            } catch (err: any) {
                console.error('[CoBridge] Offscreen: warmup failed:', err.message);
                sendResponse({ ok: false, error: err.message });
            }
        })();
        return true;
    }

    // 忽略其他消息
    return false;
});

console.log('[CoBridge] Offscreen document message listener registered');
