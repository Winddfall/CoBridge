/**
 * 从 chrome.storage.local 读取 background 预生成的用户画像缓存。
 * 不做生成，只读。生成由 background/autocomplete/profileManager.ts 负责。
 */

const PROFILE_KEY = 'cobridge_user_profile';

interface CachedProfile {
  profile: string;
  updatedAt: number;
}

/** 读取已缓存的用户画像，无缓存返回空串 */
export async function getCachedProfile(): Promise<string> {
  try {
    const storage = await chrome.storage.local.get(PROFILE_KEY);
    const cached = storage[PROFILE_KEY] as CachedProfile | undefined;
    return cached?.profile || '';
  } catch {
    return '';
  }
}
