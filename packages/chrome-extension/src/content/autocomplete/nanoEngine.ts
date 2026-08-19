/// <reference types="dom-chromium-ai" />

import {getLM} from '../../popup/ai';

export class NanoEngine {
  private session: LanguageModel | null = null;
  private abortController: AbortController | null = null;
  private cache = new Map<string, string>();

  async init(profile: string): Promise<boolean> {
    const LM = getLM();
    if (!LM) {
      console.warn('[CoBridge] Prompt API (LanguageModel) is not available.');
      return false;
    }

    const availability = await LM.availability();
    if (availability === 'unavailable') {
      console.warn('[CoBridge] LanguageModel is unavailable on this device.');
      return false;
    }

    try {
      const profileLine = profile ? `\n用户画像：${profile}` : '';

      this.session = await LM.create({
        initialPrompts: [
          {
            role: 'system',
            content: `你是输入法的幽灵补全（ghost completion），不是聊天助手。你正在替用户继续输入，将光标后的文字直接接在用户已有文本后面。${profileLine}
硬性规则：
1. 只输出要追加的文字，绝不复述已有文本、解释、加引号或加前缀
2. 采用用户的立场和人称继续说话；遇到问题时，续写用户会说的话，而不是回答或帮助用户
3. 绝不以 AI、助手、客服或搜索工具的身份说话；不要出现“我可以帮你”“当然”“好的”“作为 AI”
4. 只补一个自然的短语或一句话的剩余部分，中文最多 15 个字；拿不准就输出空字符串
5. 保持原文的语言、语气、标点和第一人称视角`
          },
          {role: 'user', content: '已有文本："帮我写一篇"\n只输出光标后续写：'},
          {role: 'assistant', content: '关于 AI 发展的文章'},
          {role: 'user', content: '已有文本："今天天气不错，你有什么计划吗？"\n只输出光标后续写：'},
          {role: 'assistant', content: '我打算去公园散步。'},
          {role: 'user', content: '已有文本："用 Python 实现"\n只输出光标后续写：'},
          {role: 'assistant', content: '一个快速排序算法'},
          {role: 'user', content: '已有文本："Explain"\n只输出光标后续写：'},
          {role: 'assistant', content: ' how machine learning works'},
        ],
      });
      console.log('[CoBridge] NanoEngine initialized successfully.');
      return true;
    } catch (e) {
      console.error('[CoBridge] Failed to initialize NanoEngine:', e);
      return false;
    }
  }

  async getCompletion(input: string, context: string): Promise<string> {
    if (!this.session) return '';

    // Cancel any previous in-flight request
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    // Fast path: Check cache
    const cacheKey = `${context}|${input}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      let contextBlock = '';
      if (context) {
        contextBlock = `以下是用户与AI的对话，用户正在写新的提示词：\n${context}\n\n`;
      }
      const prompt = `${contextBlock}已有文本："${input}"\n只输出光标后续写：`;

      const result = await this.session.prompt(prompt, {signal});
      const completion = this.cleanOutput(result);

      if (completion && !signal.aborted) {
        this.cache.set(cacheKey, completion);
        return completion;
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error('[CoBridge] Autocomplete request failed:', e);
      }
    }
    return '';
  }

  /** 清理模型输出：去引号、去多余空白、截断过长结果 */
  private cleanOutput(text: string): string {
    let s = text.trim();
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      s = s.slice(1, -1).trim();
    }
    // 宁可不展示，也不要把“助手回答”伪装成用户正在输入的续写。
    if (/^(?:当然|好的|你好|我可以(?:帮|为)|作为(?:一个)?AI|我能(?:帮|为)|很高兴)/.test(s)) {
      return '';
    }
    if (s.length > 15) {
      const end = s.search(/[。！？.!?，,]/);
      s = end > 0 ? s.slice(0, end + 1) : s.slice(0, 15);
    }
    return s;
  }

  destroy() {
    if (this.abortController) {
      this.abortController.abort();
    }
    if (this.session) {
      this.session.destroy();
    }
  }
}
