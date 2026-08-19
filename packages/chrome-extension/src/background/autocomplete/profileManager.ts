/// <reference types="dom-chromium-ai" />

/**
 * 用户画像管理器（语义记忆）
 * 从对话历史中提炼用户写作风格、常用话题、语言偏好，
 * 作为 Nano 补全的个性化上下文。
 */

import {getLM} from '../../popup/ai';
import {getRecentTurns} from '../../utils/topicsManager';
import type {ConversationTurn} from '../../utils/historyStore';

const PROFILE_KEY = 'cobridge_user_profile';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const TURNS_LIMIT = 50;

interface CachedProfile {
  profile: string;
  updatedAt: number;
}

const PLATFORMS = ['chatgpt', 'claude', 'gemini', 'doubao', 'deepseek'];

// ── 缓存读写 ──────────────────────────────────────────────────

async function getCachedProfile(): Promise<CachedProfile | null> {
  const storage = await chrome.storage.local.get(PROFILE_KEY);
  return (storage[PROFILE_KEY] as CachedProfile) || null;
}

async function setCachedProfile(profile: string): Promise<void> {
  await chrome.storage.local.set({
    [PROFILE_KEY]: {profile, updatedAt: Date.now()} as CachedProfile,
  });
}

// ── 数据采集 ──────────────────────────────────────────────────

/** 从所有平台收集最近的对话记录 */
async function collectRecentTurns(): Promise<ConversationTurn[]> {
  const allTurns: ConversationTurn[] = [];
  for (const platform of PLATFORMS) {
    const turns = await getRecentTurns(platform, TURNS_LIMIT);
    allTurns.push(...turns);
  }
  // 按时间排序，取最新的 TURNS_LIMIT 条
  allTurns.sort((a, b) => b.timestamp - a.timestamp);
  return allTurns.slice(0, TURNS_LIMIT);
}

// ── AI 生成 ──────────────────────────────────────────────────

/** 用大模型从对话记录中提炼用户画像 */
async function generateProfileText(turns: ConversationTurn[]): Promise<string> {
  const LM = getLM();
  if (!LM) throw new Error('Prompt API 不可用');

  const samples = turns
    .slice(0, 20)
    .map((t, i) => `${i + 1}. ${t.userMessage}`)
    .join('\n');

  const prompt = `以下是用户在不同AI平台上写过的提示词/消息：
${samples}

根据以上内容，用一段话（不超过80字）描述这个用户的写作风格和常用领域。重点描述：
- 主要使用什么语言
- 写作风格（简洁/详细、正式/口语化）
- 常讨论的话题领域
只输出描述，不要编号，不要其他内容。`;

  const session = await LM.create({
    initialPrompts: [{role: 'system', content: '你是一个用户画像分析助手，只输出简短的风格描述。'}],
  });

  const result = await session.prompt(prompt);
  session.destroy();

  return result.trim().slice(0, 150); // 硬截断，防止过长
}

// ── 公开接口 ──────────────────────────────────────────────────

/** 获取用户画像（有缓存返回缓存，无缓存或过期则生成） */
export async function getProfile(): Promise<string> {
  const cached = await getCachedProfile();
  if (cached && Date.now() - cached.updatedAt < CACHE_TTL_MS) {
    return cached.profile;
  }
  return refreshProfile();
}

/** 强制刷新用户画像 */
export async function refreshProfile(): Promise<string> {
  const turns = await collectRecentTurns();
  if (turns.length === 0) return '';

  try {
    const profile = await generateProfileText(turns);
    if (profile) {
      await setCachedProfile(profile);
    }
    return profile;
  } catch (err) {
    console.error('[CoBridge] Failed to generate user profile:', err);
    return '';
  }
}
