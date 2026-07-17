// 接收对话轮次，计算嵌入向量并存储
// 如果嵌入模型加载失败，仍保存记录（embedding 为空数组），搜索时降级为文本匹配
// 注意：embedding 计算通过 offscreen document 进行（因为 transformers.js 需要 DOM API）

import { saveTurn, getAllTurns, updateTurnEmbedding, type ConversationTurn } from '../../utils/historyStore';

// 词嵌入函数
let requestEmbedding: ((text: string) => Promise<number[]>) | null = null;

/** 设置词嵌入函数 */
export function setRequestEmbedding(fn: (text: string) => Promise<number[]>) {
    requestEmbedding = fn;
}

export async function handleVectorizeAndSave(request: any) {
    const { url, platform, userMessage, timestamp, turnIndex, messageId } = request.data;
    const normalizedPlatform = String(platform).toLowerCase();
    const textToVectorize: string = userMessage;

    console.log('[CoBridge] VectorizeAndSave: processing turn for', normalizedPlatform);

    /* 快速精确去重 */
    const turns: ConversationTurn[] = await getAllTurns(normalizedPlatform);
    // find() 查找并返回数组中第一个满足特定条件的元素
    const existing: ConversationTurn | undefined = turns.find(t => t.userMessage === userMessage);
    if (existing) {
        // 已有 embedding
        if (existing.embedding && existing.embedding.length > 0) {
            console.log('[CoBridge] Turn already exists with embedding, skipping');
            return { hasEmbedding: true, backfilled: false };
        }
        // 已有记录但没有 embedding，补算
        if (requestEmbedding) {
            console.log('[CoBridge] Turn exists without embedding, backfilling...');
            const embedding: number[] = await requestEmbedding(textToVectorize); // 算出 embedding
            updateTurnEmbedding(normalizedPlatform, existing.id, embedding);
            console.log('[CoBridge] Embedding backfilled, dim:', embedding.length);
            return { hasEmbedding: true, backfilled: true };
        } else {
            console.log('[CoBridge] Turn exists without embedding, no requestEmbedding available');
            return { hasEmbedding: false, backfilled: false };
        }
    }

    // 没有 requestEmbedding 无法计算 embedding
    if (!requestEmbedding) {
        console.error('[CoBridge] requestEmbedding not set');
        // 保存无 embedding 记录
        return saveTurnRecord(url, normalizedPlatform, userMessage, timestamp, turnIndex ?? 0, messageId ?? '');
    }

    // 通过 offscreen document 计算 embedding
    const embedding: number[] = await requestEmbedding(textToVectorize);
    console.log('[CoBridge] Embedding computed, dim:', embedding.length);
    return saveTurnRecord(url, normalizedPlatform, userMessage, timestamp, turnIndex ?? 0, messageId ?? '', embedding);
}

async function saveTurnRecord(
    url: string,
    platform: string,
    userMessage: string,
    timestamp: number,
    turnIndex: number,
    messageId: string,
    embedding: number[] | null = null
) {
    // 封装一个对象
    const turn: ConversationTurn = {
        id: `${platform}_${timestamp}_${Math.random().toString(36).slice(2, 6)}`,
        url,
        platform,
        userMessage,
        timestamp,
        embedding,
        turnIndex,
        messageId,
    };

    // 保存到数据库
    await saveTurn(turn);
    console.log('[CoBridge] Turn saved, embedding dim:', embedding?.length);
    return { hasEmbedding: !!embedding };
}
