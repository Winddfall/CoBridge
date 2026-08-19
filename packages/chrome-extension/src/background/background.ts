// Background Service Worker 入口
// 职责：接收消息，分发到对应的 handler
console.log('[CoBridge] Background service worker loaded.');

import {handleCheckSyncStatus, handleSyncToAgent} from './context-sync/syncHandler';
import {handleFetchImage} from './context-sync/fetchImageHandler';
import {handleVectorizeAndSave, setRequestEmbedding} from './semantic-search/vectorizeSaveHandler';
import {handleSearchConversations, setSearchRequestEmbedding} from './semantic-search/searchHandler';
import {handleNavigateToTurn} from './semantic-search/navigateHandler';
import {warmupEmbeddingModel, requestEmbedding} from './semantic-search/offscreenHandler';
import {historyKey, shouldRefresh, refreshTopics, DEBOUNCE_MS} from '../utils/topicsManager';
import {refreshProfile} from './autocomplete/profileManager';

// 初始化时设置 requestEmbedding 函数
setRequestEmbedding(requestEmbedding); // 存入
setSearchRequestEmbedding(requestEmbedding); // 检索

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        // 同步到 Agent
        case "cobridge.syncToAgent":
            handleSyncToAgent(request, sendResponse);
            return true;
        // 检查同步状态
        case "cobridge.checkSyncStatus":
            handleCheckSyncStatus(request, sendResponse);
            return true;
        // 抓取照片
        case "cobridge.fetchImage":
            handleFetchImage(request, sendResponse);
            return true;
        // 向量化并存储
        case "cobridge.vectorizeAndSave":
            (async () => {
                try {
                    const result = await handleVectorizeAndSave(request);
                    sendResponse({ ok: true, data: result });
                } catch (err: any) {
                    sendResponse({ ok: false, error: err.message });
                }
            })();
            return true;
        // 语义搜索
        case "cobridge.searchConversations":
            (async () => {
                try {
                    const result = await handleSearchConversations(request);
                    // 保持与 popup 约定：data 为数组，mode 为搜索模式
                    sendResponse({ ok: true, data: result.data, mode: result.mode });
                } catch (err: any) {
                    // 统一错误处理，不会遗漏
                    sendResponse({ ok: false, error: err.message });
                }
            })();
            return true;
        // 滚动到对话位置
        case "cobridge.navigateToTurn":
            (async () => {
                try {
                    const result = await handleNavigateToTurn(request);
                    // 统一在这里回复，成功路径唯一
                    sendResponse({ ok: true, data: result });
                } catch (err: any) {
                    // 统一错误处理，不会遗漏
                    sendResponse({ ok: false, error: err.message });
                }
            })();
            return true;
    }
});

// 启动后异步预热模型（不阻塞正常消息处理）
void warmupEmbeddingModel('startup');

// 异步预生成用户画像（不阻塞，下次补全时可直接使用缓存）
void refreshProfile();

// ── 近日话题：实时监听与刷新 ──────────────────────────────────────

const PLATFORMS = ['chatgpt', 'claude', 'gemini', 'doubao', 'deepseek'];
const HISTORY_KEYS = PLATFORMS.map(p => historyKey(p));
const refreshTimers = new Map<string, ReturnType<typeof setTimeout>>();

function debouncedRefresh(platform: string): void {
  const existing = refreshTimers.get(platform);
  if (existing) clearTimeout(existing);
  refreshTimers.set(platform, setTimeout(() => {
    refreshTimers.delete(platform);
    void refreshTopics(platform);
  }, DEBOUNCE_MS));
}

// 监听 cobridge_history_* 变化，自动刷新话题
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;
  for (const key of HISTORY_KEYS) {
    if (!(key in changes)) continue;
    const platform = key.replace('cobridge_history_', '');
    (async () => {
      if (await shouldRefresh(platform)) {
        debouncedRefresh(platform);
      }
    })();
  }
});

// 处理 popup 发来的刷新请求（24h 缓存过期场景）
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type !== 'cobridge.refreshTopics') return false;
  (async () => {
    try {
      await refreshTopics(request.platform);
      sendResponse({ ok: true });
    } catch (err: any) {
      sendResponse({ ok: false, error: err.message });
    }
  })();
  return true;
});