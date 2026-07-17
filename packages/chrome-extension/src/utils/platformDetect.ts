/**
 * 平台检测工具
 * 通过当前标签页 URL 识别用户正在使用的 AI 平台
 */

const PLATFORMS = ['chatgpt', 'claude', 'gemini', 'doubao', 'deepseek'];

/** 从 URL 中识别平台，不匹配则返回 null */
export function detectPlatform(url: string): string | null {
  for (const platform of PLATFORMS) {
    if (url.includes(platform)) return platform;
  }
  return null;
}

/** 获取当前活跃标签页的平台 */
export async function getCurrentPlatform(): Promise<string | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return null;
  return detectPlatform(tab.url);
}
