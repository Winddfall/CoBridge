// 语义搜索：计算查询嵌入，与存储的对话向量比对相似度

import { cosineSimilarity } from '../utils/embeddingService';
import { getAllTurns, type ConversationTurn } from '../utils/historyStore';

// 这个函数会在 background.ts 中被调用，传入 requestEmbedding 函数
let requestEmbedding: ((text: string) => Promise<number[]>) | null = null;

export function setSearchRequestEmbedding(fn: (text: string) => Promise<number[]>) {
    requestEmbedding = fn;
}

export function handleSearchConversations(request: any, sendResponse: (response: any) => void) {
    const { query, limit, platform } = request;

    if (!platform) {
        sendResponse({ ok: false, error: 'platform is required' });
        return;
    }

    getAllTurns(platform)
        .then((turns) => {
            console.log('[CoBridge] Search: found', turns.length, 'records for platform:', platform);

            if (turns.length === 0) {
                sendResponse({ ok: true, data: [], mode: 'empty' });
                return;
            }

            // 检查是否有嵌入向量可用
            const withEmbeddings = turns.filter((t) => t.embedding && t.embedding.length > 0);
            const hasEmbeddings = withEmbeddings.length > 0;

            console.log('[CoBridge] Search:', withEmbeddings.length, '/', turns.length, 'records have embeddings');

            if (!hasEmbeddings) {
                // 无 embedding 时，用精确文本匹配兜底
                console.log('[CoBridge] No embeddings available, using exact text match');
                const results = exactTextSearch(query, turns, limit || 20);
                sendResponse({ ok: true, data: results, mode: 'text-fallback' });
                return;
            }

            // 语义搜索路径
            console.log('[CoBridge] Using semantic search for query:', query);
            semanticSearch(query, turns, limit || 20, sendResponse);
        })
        .catch((err: Error) => {
            console.error('[CoBridge] Search failed:', err);
            sendResponse({ ok: false, error: err.message });
        });
}

/** 语义搜索：嵌入向量余弦相似度 */
function semanticSearch(
    query: string,
    turns: ConversationTurn[],
    limit: number,
    sendResponse: (response: any) => void,
) {
    if (!requestEmbedding) {
        console.error('[CoBridge] requestEmbedding not set for search');
        sendResponse({ ok: true, data: [], mode: 'no-embeddings' });
        return;
    }

    requestEmbedding(query)
        .then((queryEmbedding) => {
            const SCORE_THRESHOLD = 0.5;

            const results = turns
                .map((turn) => {
                    const semanticScore = turn.embedding?.length > 0
                        ? cosineSimilarity(queryEmbedding, turn.embedding)
                        : 0;

                    return {
                        ...turn,
                        score: semanticScore,
                    };
                })
                .filter((item) => item.score >= SCORE_THRESHOLD)
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);

            sendResponse({ ok: true, data: results, mode: 'semantic' });
        })
        .catch((err: Error) => {
            console.error('[CoBridge] Semantic search failed:', err.message);
            sendResponse({ ok: true, data: [], mode: 'error' });
        });
}

/** 模糊文本匹配：无 embedding 时的兜底搜索（支持子串 + 字符级模糊匹配） */
function exactTextSearch(
    query: string,
    turns: ConversationTurn[],
    limit: number,
): (ConversationTurn & { score: number })[] {
    const queryNorm = query.toLowerCase().trim();
    if (!queryNorm) return [];

    // 将查询拆分为字符和词（支持中英文混合）
    const queryChars = [...queryNorm];
    // 英文按空格分词，中文逐字
    const queryTokens = queryNorm.match(/[\u4e00-\u9fff]|[a-z0-9]+/gi) || [];

    return turns
        .map((turn) => {
            const text = turn.userMessage.toLowerCase().trim();

            // 1. 完全匹配
            if (text === queryNorm) return { ...turn, score: 1.0 };

            // 2. 记录包含查询（子串匹配）
            if (text.includes(queryNorm)) {
                const ratio = queryNorm.length / text.length;
                return { ...turn, score: 0.6 + 0.35 * ratio }; // 0.6~0.95
            }

            // 3. 查询包含记录
            if (queryNorm.includes(text)) {
                const ratio = text.length / queryNorm.length;
                return { ...turn, score: 0.5 + 0.3 * ratio }; // 0.5~0.8
            }

            // 4. Token 级模糊匹配（支持部分关键词命中）
            if (queryTokens.length > 0) {
                const matchedTokens = queryTokens.filter(t => text.includes(t));
                const tokenRatio = matchedTokens.length / queryTokens.length;
                if (tokenRatio > 0) {
                    // token 命中的字符在查询中占的比例
                    const matchedLength = matchedTokens.reduce((sum, t) => sum + t.length, 0);
                    const lengthRatio = matchedLength / queryNorm.length;
                    const score = 0.2 + 0.4 * tokenRatio * lengthRatio;
                    if (score > 0.2) return { ...turn, score };
                }
            }

            return { ...turn, score: 0 };
        })
        .filter((t) => t.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

