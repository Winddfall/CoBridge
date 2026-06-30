// 嵌入向量服务
// 在 Service Worker 中：通过 offscreen document 计算 embedding（因为 transformers.js 需要 DOM API）
// 在 offscreen document 中：直接使用 transformers.js 计算 embedding
// 注意：使用动态导入避免在 Service Worker 中加载 transformers.js

const MODEL_NAME = 'Xenova/bge-base-zh-v1.5';
const LOAD_TIMEOUT = 120000; // 120 秒超时（大模型下载需要更长时间）
const MAX_LOAD_RETRIES = 3;

// HuggingFace 主站和镜像站
const REMOTE_HOSTS = [
    'https://hf-mirror.com',      // 镜像站（国内更稳定）
    'https://huggingface.co',     // 主站
];

let extractor: any = null;
let loadingPromise: Promise<any> | null = null;

// 检测当前环境是否是 offscreen document
const isOffscreen = typeof window !== 'undefined' && window.location?.pathname?.includes('offscreen');

// 动态导入 transformers.js（仅在 offscreen document 中使用）
let transformersModule: any = null;
async function loadTransformers() {
    if (!transformersModule) {
        transformersModule = await import('@xenova/transformers');
        // Cache API 不支持 chrome-extension:// 协议，必须禁用浏览器缓存
        transformersModule.env.useBrowserCache = false;
    }
    return transformersModule;
}

/**
 * 用指定的远程主机尝试加载模型
 */
async function tryLoadWithHost(host: string): Promise<any> {
    const { pipeline, env } = await loadTransformers();
    env.remoteHost = host;
    console.log(`[CoBridge] Trying to load model from: ${host}`);

    return Promise.race([
        pipeline('feature-extraction', MODEL_NAME, { quantized: true }),
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Model load timeout (host: ${host})`)), LOAD_TIMEOUT)
        ),
    ]);
}

/**
 * 初始化并获取嵌入模型（仅在 offscreen document 中使用）
 * 带有多主机回退和重试逻辑
 */
export async function getExtractor(): Promise<any> {
    if (!isOffscreen) {
        throw new Error('getExtractor() can only be called in offscreen document');
    }

    if (extractor) return extractor;
    if (loadingPromise) return loadingPromise;

    console.log('[CoBridge] Loading embedding model:', MODEL_NAME);

    loadingPromise = (async () => {
        let lastError: Error | null = null;

        // 对每个主机重试
        for (const host of REMOTE_HOSTS) {
            for (let attempt = 1; attempt <= MAX_LOAD_RETRIES; attempt++) {
                try {
                    const pipe = await tryLoadWithHost(host);
                    extractor = pipe;
                    console.log(`[CoBridge] Embedding model loaded successfully from ${host} (attempt ${attempt})`);
                    return pipe;
                } catch (err: any) {
                    lastError = err;
                    console.warn(
                        `[CoBridge] Model load failed from ${host} (attempt ${attempt}/${MAX_LOAD_RETRIES}):`,
                        err.message
                    );

                    // 如果不是最后一次尝试，等待后重试（指数退避）
                    if (attempt < MAX_LOAD_RETRIES) {
                        const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s
                        console.log(`[CoBridge] Retrying in ${delay}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }
            console.warn(`[CoBridge] All attempts failed for host: ${host}, trying next...`);
        }

        // 所有主机和重试都失败
        console.error('[CoBridge] Embedding model load failed on all hosts');
        throw lastError || new Error('All model loading attempts failed');
    })();

    loadingPromise.catch(() => {
        // 失败后重置 promise，允许下次重试
        loadingPromise = null;
    });

    return loadingPromise;
}

/**
 * 计算文本的嵌入向量（384 维）
 * 注意：此函数只能在 offscreen document 中调用
 * 在 Service Worker 中，请使用 requestEmbeddingFromOffscreen 函数
 */
export async function getEmbedding(text: string): Promise<number[]> {
    if (!isOffscreen) {
        throw new Error('getEmbedding() can only be called in offscreen document. Use requestEmbeddingFromOffscreen() in Service Worker.');
    }

    console.log('[CoBridge] Computing embedding in offscreen document');
    const pipe = await getExtractor();
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data as Float32Array);
}

/**
 * 计算两个向量的余弦相似度（纯计算，无模型依赖）
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
}
