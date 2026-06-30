// 对话历史存储：管理 chrome.storage.local 中的对话轮次记录

export interface ConversationTurn {
    id: string;           // 唯一ID: `${platform}_${timestamp}_${index}`
    url: string;          // 对话页面 URL
    platform: string;     // 'chatgpt' | 'claude' | 'gemini' | 'doubao'
    userMessage: string;  // 用户消息文本（截取前500字符用于摘要）
    timestamp: number;    // Date.now()
    embedding: number[];  // 384维嵌入向量
    turnIndex: number;    // 对话在页面中的序号（0-based）
    messageId: string;    // DOM 消息容器 ID（如有）
}

function getStorageKey(platform: string): string {
    return `cobridge_history_${platform}`;
}
const MAX_RECORDS = 200;
const EMBEDDING_DEDUP_THRESHOLD = 0.95;

/** 余弦相似度 */
function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
}

/**
 * 获取指定平台的所有历史记录
 */
export async function getAllTurns(platform: string): Promise<ConversationTurn[]> {
    return new Promise((resolve) => {
        chrome.storage.local.get([getStorageKey(platform)], (result) => {
            resolve(result[getStorageKey(platform)] || []);
        });
    });
}

/**
 * 保存一条对话轮次记录（带向量去重）
 * 1. 精确匹配：platform + userMessage
 * 2. 向量去重：余弦相似度 > 阈值则视为重复
 */
export async function saveTurn(turn: ConversationTurn): Promise<void> {
    const turns = await getAllTurns(turn.platform);
    const storageKey = getStorageKey(turn.platform);

    // 精确匹配去重
    const exactDup = turns.some(t => t.userMessage === turn.userMessage);
    if (exactDup) {
        console.log('[CoBridge] Turn already exists (exact match), skipping');
        return;
    }

    // 向量相似度去重
    if (turn.embedding && turn.embedding.length > 0) {
        const vectorDup = turns.some(t => {
            if (!t.embedding || t.embedding.length === 0) return false;
            const sim = cosineSimilarity(turn.embedding, t.embedding);
            return sim > EMBEDDING_DEDUP_THRESHOLD;
        });
        if (vectorDup) {
            console.log('[CoBridge] Turn already exists (vector similarity), skipping');
            return;
        }
    }

    turns.push(turn);

    // 超出上限时删除最早的记录
    if (turns.length > MAX_RECORDS) {
        turns.splice(0, turns.length - MAX_RECORDS);
    }

    return new Promise((resolve) => {
        chrome.storage.local.set({ [storageKey]: turns }, resolve);
    });
}

/**
 * 更新指定记录的 embedding（补算场景）
 */
export async function updateTurnEmbedding(platform: string, id: string, embedding: number[]): Promise<void> {
    const turns = await getAllTurns(platform);
    const turn = turns.find(t => t.id === id);
    if (turn) {
        turn.embedding = embedding;
        return new Promise((resolve) => {
            chrome.storage.local.set({ [getStorageKey(platform)]: turns }, resolve);
        });
    }
}

/**
 * 删除指定平台的一条记录
 */
export async function deleteTurn(platform: string, id: string): Promise<void> {
    const turns = await getAllTurns(platform);
    const filtered = turns.filter((t) => t.id !== id);
    return new Promise((resolve) => {
        chrome.storage.local.set({ [getStorageKey(platform)]: filtered }, resolve);
    });
}

/**
 * 清空指定平台的所有历史记录
 */
export async function clearAllTurns(platform: string): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [getStorageKey(platform)]: [] }, resolve);
    });
}

/**
 * 根据平台和 URL 获取对话轮次
 */
export async function getTurnsByUrl(platform: string, url: string): Promise<ConversationTurn[]> {
    const turns = await getAllTurns(platform);
    return turns.filter((t) => t.url === url);
}
