/// <reference types="dom-chromium-ai" />

/**
 * 话题管理器（共享模块）
 * 供 background（实时监听）和 popup（读缓存）共同使用
 */

import { getLM } from '../popup/ai';
import type { ConversationTurn } from './historyStore';

export const TOPICS_COUNT = 5;
export const TURNS_LIMIT = 50;
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const FRESHNESS_THRESHOLD = 20;
export const DEBOUNCE_MS = 3000;

export interface CachedTopics {
  topics: string[];
  updatedAt: number;
}

// ── Key 工具 ────────────────────────────────────────────────────

export function historyKey(platform: string): string {
  return `cobridge_history_${platform}`;
}

export function topicsKey(platform: string): string {
  return `cobridge_recent_topics_${platform}`;
}

// ── 数据读写 ────────────────────────────────────────────────────

export async function getRecentTurns(platform: string, limit: number): Promise<ConversationTurn[]> {
  const key = historyKey(platform);
  const storage = await chrome.storage.local.get(key);
  const turns = (storage[key] || []) as ConversationTurn[];
  turns.sort((a, b) => b.timestamp - a.timestamp);
  return turns.slice(0, limit);
}

export async function getTurnCount(platform: string): Promise<number> {
  const key = historyKey(platform);
  const storage = await chrome.storage.local.get(key);
  return ((storage[key] || []) as ConversationTurn[]).length;
}

export async function getCachedTopics(platform: string): Promise<CachedTopics | null> {
  const key = topicsKey(platform);
  const storage = await chrome.storage.local.get(key);
  return (storage[key] as CachedTopics) || null;
}

export async function setCachedTopics(platform: string, topics: string[]): Promise<void> {
  const data: CachedTopics = { topics, updatedAt: Date.now() };
  await chrome.storage.local.set({ [topicsKey(platform)]: data });
}

// ── AI 总结 ─────────────────────────────────────────────────────

export async function summarizeTopics(turns: ConversationTurn[]): Promise<string[]> {
  const LM = getLM();
  if (!LM) throw new Error('Prompt API 不可用');

  const messages = turns
    .map((t, i) => `${i + 1}. ${t.userMessage}`)
    .join('\n');

  const prompt = `以下是一些对话记录。从中提取出不超过 ${TOPICS_COUNT} 个核心讨论话题，每个对话最多提取一个话题，并用一句简短的中文概括（不超过 20 字）。只输出话题列表，每行一个，不要编号，不要其他内容。

${messages}`;

  const session = await LM.create({
    initialPrompts: [{ role: 'system', content: '你是一个话题提取助手，只输出简短的话题概括。' }],
    expectedOutputs: [{ type: 'text', languages: ['en'] }],
  });

  const result = await session.prompt(prompt);
  session.destroy();

  return result
    .split('\n')
    .map(s => s.replace(/^[\d.\-•*\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, TOPICS_COUNT);
}

// ── 刷新逻辑 ────────────────────────────────────────────────────

/** 判断指定平台是否需要刷新话题 */
export async function shouldRefresh(platform: string): Promise<boolean> {
  const count = await getTurnCount(platform);
  if (count === 0) return false;

  if (count < FRESHNESS_THRESHOLD) return true;

  const cached = await getCachedTopics(platform);
  if (!cached) return true;
  return Date.now() - cached.updatedAt >= CACHE_TTL_MS;
}

/** 执行话题刷新并写入缓存 */
export async function refreshTopics(platform: string): Promise<string[]> {
  const turns = await getRecentTurns(platform, TURNS_LIMIT);
  if (turns.length === 0) return [];

  const topics = await summarizeTopics(turns);
  await setCachedTopics(platform, topics);
  return topics;
}
