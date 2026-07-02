// 语义搜索：计算查询嵌入，与存储的对话向量比对相似度

import { cosineSimilarity } from '../utils/embeddingService';
import { getAllTurns, type ConversationTurn } from '../utils/historyStore';

interface searchResult {
    data: [];
    mode: 'empty' | 'semantic' | 'no-embeddings' | 'error';
}

const empty: searchResult = { data: [], mode: 'empty' };
const noEmbeddings: searchResult = { data: [], mode: 'no-embeddings' };
const error: searchResult = { data: [], mode: 'error' };

// 词嵌入函数
let requestEmbedding: ((text: string) => Promise<number[]>) | null = null;

/** 设置词嵌入函数 */
export function setSearchRequestEmbedding(fn: (text: string) => Promise<number[]>) {
    requestEmbedding = fn;
}

export async function handleSearchConversations(request: any) {
    // 按照键值来解构
    const { query, limit, platform } = request;

    if (!platform) {
        throw new Error('platform is required');
    }

    // 获取指定平台的所有历史记录
    const turns: ConversationTurn[] = await getAllTurns(platform);
    console.log('[CoBridge] Search: found', turns.length, 'records for platform:', platform);
    // 校验空数组
    if (turns.length === 0) return empty;
    // 校验空 embedding
    const withEmbeddings = turns.filter((t: ConversationTurn) => t.embedding && t.embedding.length > 0);
    console.log('[CoBridge] Search:', withEmbeddings.length, '/', turns.length, 'records have embeddings');
    if (withEmbeddings.length === 0) return noEmbeddings;
    console.log('[CoBridge] Using semantic search for query:', query);
    // 语义搜索
    return semanticSearch(query, turns, limit);
}

/** 语义搜索 */
async function semanticSearch(
    query: string,
    turns: ConversationTurn[],
    limit: number,
) {
    // 看不懂，先跳过
    if (!requestEmbedding) {
        console.error('[CoBridge] requestEmbedding not set for search');
        // todo
        return ({ data: [], mode: 'no-embeddings' });
    }

    try {
        // 计算查询语句的 embedding
        const queryEmbedding: number[] = await requestEmbedding(query);
        const SCORE_THRESHOLD = 0.5;

        // 搜索结果
        const results = turns
            .map(turn=> {
                // 计算当前轮次的语义相似度
                const semanticScore = turn.embedding?.length > 0
                    ? cosineSimilarity(queryEmbedding, turn.embedding)
                    : 0;
                return {
                    ...turn, // 展开所有属性
                    score: semanticScore, // 相似度得分
                };
            })
            .filter(item => item.score >= SCORE_THRESHOLD) // 过滤出相似度大于等于阈值的记录
            .sort((a, b) => b.score - a.score) // 根据相似度得分降序排序
            .slice(0, limit); // 截取返回结果

        return { data: results, mode: 'semantic' };
    } catch(err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        throw new Error(`[CoBridge] Search Failed: ${message}`);
    }
}
