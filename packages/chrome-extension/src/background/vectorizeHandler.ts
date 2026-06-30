// 接收对话轮次，计算嵌入向量并存储
// 如果嵌入模型加载失败，仍保存记录（embedding 为空数组），搜索时降级为文本匹配
// 注意：embedding 计算通过 offscreen document 进行（因为 transformers.js 需要 DOM API）

import { saveTurn, getAllTurns, updateTurnEmbedding, type ConversationTurn } from '../utils/historyStore';

// 这个函数会在 background.ts 中被调用，传入 requestEmbedding 函数
let requestEmbedding: ((text: string) => Promise<number[]>) | null = null;

export function setRequestEmbedding(fn: (text: string) => Promise<number[]>) {
    requestEmbedding = fn;
}

export function handleVectorizeAndSave(request: any, sendResponse: (response: any) => void) {
    const { url, platform, userMessage, timestamp, turnIndex, messageId } = request.data;
    const textToVectorize = userMessage;

    console.log('[CoBridge] VectorizeAndSave: processing turn for', platform);

    // 快速精确去重：如果已有记录但缺少 embedding，补算
    getAllTurns(platform).then(turns => {
        const existing = turns.find(t => t.userMessage === userMessage);
        if (existing) {
            if (existing.embedding && existing.embedding.length > 0) {
                console.log('[CoBridge] Turn already exists with embedding, skipping');
                sendResponse({ ok: true, hasEmbedding: true, skipped: true });
                return;
            }
            // 已有记录但没有 embedding，补算
            if (requestEmbedding) {
                console.log('[CoBridge] Turn exists without embedding, backfilling...');
                requestEmbedding(textToVectorize)
                    .then((embedding) => {
                        updateTurnEmbedding(platform, existing.id, embedding);
                        console.log('[CoBridge] Embedding backfilled, dim:', embedding.length);
                        sendResponse({ ok: true, hasEmbedding: true, backfilled: true });
                    })
                    .catch((err: Error) => {
                        console.error('[CoBridge] Backfill failed:', err.message);
                        sendResponse({ ok: true, hasEmbedding: false, skipped: true });
                    });
            } else {
                console.log('[CoBridge] Turn exists without embedding, no requestEmbedding available');
                sendResponse({ ok: true, hasEmbedding: false, skipped: true });
            }
            return;
        }

        if (!requestEmbedding) {
            console.error('[CoBridge] requestEmbedding not set');
            saveTurnRecord(url, platform, userMessage, timestamp, turnIndex ?? 0, messageId ?? '', [], sendResponse);
            return;
        }

        // 通过 offscreen document 计算 embedding
        requestEmbedding(textToVectorize)
            .then((embedding) => {
                console.log('[CoBridge] Embedding computed, dim:', embedding.length);
                saveTurnRecord(url, platform, userMessage, timestamp, turnIndex ?? 0, messageId ?? '', embedding, sendResponse);
            })
            .catch((err: Error) => {
                console.error('[CoBridge] Embedding failed, saving without vector:', err.message);
                saveTurnRecord(url, platform, userMessage, timestamp, turnIndex ?? 0, messageId ?? '', [], sendResponse);
            });
    });
}

function saveTurnRecord(
    url: string,
    platform: string,
    userMessage: string,
    timestamp: number,
    turnIndex: number,
    messageId: string,
    embedding: number[],
    sendResponse: (response: any) => void,
) {
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

    saveTurn(turn)
        .then(() => {
            console.log('[CoBridge] Turn saved, embedding dim:', embedding.length);
            sendResponse({ ok: true, hasEmbedding: embedding.length > 0 });
        })
        .catch((saveErr: Error) => {
            console.error('[CoBridge] Save failed:', saveErr);
            sendResponse({ ok: false, error: saveErr.message });
        });
}
