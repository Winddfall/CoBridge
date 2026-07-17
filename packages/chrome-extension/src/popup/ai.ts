/// <reference types="dom-chromium-ai" />

/**
 * AI 会话管理模块
 * 封装 Chrome Prompt API (LanguageModel) 的可用性检测与会话创建
 */

/**
 * 获取 LanguageModel 构造器（带运行时可用性检测）
 */
export function getLM(): typeof LanguageModel | undefined {
  return (globalThis as any).LanguageModel as typeof LanguageModel | undefined;
}

/**
 * 检查 Prompt API 是否可用
 */
export async function isAvailable(): Promise<boolean> {
  const LM = getLM();
  if (!LM) return false;
  const availability = await LM.availability();
  return availability !== 'unavailable';
}

/**
 * 创建 LanguageModel 会话
 * 注意：当模型处于 downloading/downloadable 状态时，必须在用户手势（点击事件）的调用栈中调用
 */
export async function createSession(): Promise<LanguageModel> {
  const LM = getLM();
  if (!LM) throw new Error('Prompt API 不可用');

  return LM.create({
    initialPrompts: [{ role: 'system', content: '你是一个简洁的 AI 助手，请用简短的中文回答用户。' }],
    expectedOutputs: [{ type: 'text', languages: ['en'] }],
  });
}
