// 嵌入向量服务
// 在 Service Worker 中：通过 offscreen document 计算 embedding（因为 transformers.js 需要 DOM API）
// 在 offscreen document 中：直接使用 transformers.js 计算 embedding
// 注意：使用动态导入避免在 Service Worker 中加载 transformers.js

const MODEL_NAME = 'Xenova/bge-base-zh-v1.5';
const LOAD_TIMEOUT = 120000; // 120 秒超时（大模型下载需要更长时间）
const MAX_LOAD_RETRIES = 3;

// HuggingFace 主站和镜像站
const REMOTE_HOSTS = [
    'https://hf-mirror.com',      // 镜像站
    'https://huggingface.co',     // 主站
];

let extractor: any = null;
let loadingPromise: Promise<any> | null = null;

// 动态导入 transformers.js
let transformersModule: any = null;
async function loadTransformers() {
    if (!transformersModule) { // 只加载一次
        transformersModule = await import('@xenova/transformers');
        // Cache API 不支持 chrome-extension:// 协议，必须禁用浏览器缓存
        transformersModule.env.useBrowserCache = true;
        // Chrome 扩展环境中禁用本地模型加载（扩展中没有 /models/ 目录）
        transformersModule.env.allowLocalModels = false;
        // 正确配置 ONNX Runtime Web 的 WASM 参数
        // 注意：transformers.js 的 env 没有 wasm 属性，正确路径是 env.backends.onnx.wasm
        const onnxWasm = transformersModule.env.backends?.onnx?.wasm;
        if (onnxWasm) {
            onnxWasm.numThreads = 1;      // 禁用多线程 worker
            onnxWasm.proxy = false;       // 禁用 proxy worker
            onnxWasm.wasmPaths = chrome.runtime.getURL('wasm/');
        }
    }
    return transformersModule;
}

/**
 * 用指定的远程服务器尝试加载模型
 */
async function tryLoadWithHost(host: string): Promise<any> {
    // 提取 pipeline 函数和 env 配置对象
    const { pipeline, env } = await loadTransformers();
    env.remoteHost = host;
    // 竞速模式
    return Promise.race([
        pipeline('feature-extraction', MODEL_NAME, { quantized: true }),
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Model load timeout (host: ${host})`)), LOAD_TIMEOUT)
        ),
    ]);
}

/**
 * 尝试从所有远程服务器加载模型
 */
async function loadExtractorWithRetry(): Promise<any> {
    let lastError: Error | null = null;

    for (const host of REMOTE_HOSTS) {
        for (let attempt = 1; attempt <= MAX_LOAD_RETRIES; attempt++) {
            try {
                const pipe = await tryLoadWithHost(host);
                console.log(`[CoBridge] Embedding model loaded successfully from ${host} (attempt ${attempt})`);
                return pipe;
            } catch (err: any) {
                lastError = err;
                console.warn(
                    `[CoBridge] Model load failed from ${host} (attempt ${attempt}/${MAX_LOAD_RETRIES}):`,
                    err.message
                );

                if (attempt < MAX_LOAD_RETRIES) {
                    const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s
                    console.log(`[CoBridge] Retrying in ${delay}ms...`);
                    // 等待
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        console.warn(`[CoBridge] All attempts failed for host: ${host}, trying next...`);
    }

    console.error('[CoBridge] Embedding model load failed on all hosts');
    throw lastError || new Error('All model loading attempts failed');
}

/**
 *
 */
export async function getExtractor(): Promise<any> {
    // 只有当 loadingPromise 为 null 的时候才会执行这里，也就是说一旦 loadExtractorWithRetry() 执行成功，以后就再也不会执行这里
    if (!loadingPromise) {
        console.log('[CoBridge] Loading embedding model:', MODEL_NAME);
        loadingPromise = (async () => {
            try {
                const extractor = await loadExtractorWithRetry();
                return extractor;
            } catch (err) {
                loadingPromise = null;
                throw err;
            }
        })();
    }
    return loadingPromise;
}

/**
 * 计算文本的嵌入向量
 * 注意：此函数只能在 offscreen document 中调用
 * 在 Service Worker 中，请使用 requestEmbeddingFromOffscreen 函数
 */
export async function getEmbedding(text: string): Promise<number[]> {
    console.log('[CoBridge] Computing embedding');
    //
    const pipe = await getExtractor();
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data as Float32Array);
}

/**
 * 计算两个向量的余弦相似度
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dot: number = 0, normA: number = 0, normB: number = 0; // dot 是点积结果，normA normB 是a,b平方
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    // 归一化
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return dot / denom;
}
