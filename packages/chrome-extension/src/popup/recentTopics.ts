/**
 * 近日话题模块（Popup 端）
 * 职责：UI 渲染 + 读缓存展示 + 过期时请求 background 刷新
 *
 * 话题卡片集成在语义搜索组件的搜索框下方，
 * 独立的 toggle 按钮放在搜索 well 下方。
 */

import { getCurrentPlatform } from '../utils/platformDetect';
import { getCachedTopics, CACHE_TTL_MS } from '../utils/topicsManager';
import { t } from './i18n';

// ── UI 渲染 ─────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  const el = document.createElement('span');
  el.textContent = text;
  return el.innerHTML;
}

function renderTopics(topics: string[]): void {
  const list = document.getElementById('topics-list');
  if (!list) return;

  if (topics.length === 0) {
    list.innerHTML = '<div class="topics-empty">暂无话题数据</div>';
    return;
  }

  list.innerHTML = topics
    .map(t => `<div class="topic-tag">${escapeHtml(t)}</div>`)
    .join('');
}

/**
 * 注入话题卡片到搜索 well 内部（搜索结果下方），
 * 并在搜索 well 下方注入独立的 toggle 按钮。
 */
function injectTopicsUI(): void {
  if (document.getElementById('topics-list')) return;

  // ── 1. 话题卡片容器：注入到 well-search 内部 ──
  const searchWell = document.querySelector('.well-search');
  if (!searchWell) return;

  const topicsContainer = document.createElement('div');
  topicsContainer.id = 'topics-list';
  topicsContainer.innerHTML = '<div class="topics-loading">正在总结话题...</div>';
  searchWell.appendChild(topicsContainer);

  // ── 2. 独立 toggle 按钮：注入到 well-search 之后 ──
  const toggleWrapper = document.createElement('div');
  toggleWrapper.className = 'topics-toggle-btn-wrap';
  toggleWrapper.innerHTML = `
    <button id="topics-toggle-btn" class="topics-toggle-btn" type="button">
      <span class="topics-toggle-btn-label" data-i18n="showRecentTopics">${t('showRecentTopics')}</span>
      <label class="topics-toggle">
        <input type="checkbox" id="topics-toggle-input" checked />
        <span class="topics-toggle-slider"></span>
      </label>
    </button>
  `;

  searchWell.insertAdjacentElement('afterend', toggleWrapper);
}

// ── 主入口 ──────────────────────────────────────────────────────

let toggleOn = true;

export async function initRecentTopics(): Promise<void> {
  injectTopicsUI();

  // toggle 开关
  const toggleInput = document.getElementById('topics-toggle-input') as HTMLInputElement;
  const toggleBtn = document.getElementById('topics-toggle-btn') as HTMLButtonElement;

  // 点击按钮整体可切换（排除 toggle 区域，因为 label 已自动处理）
  toggleBtn.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    // 点击 toggle 开关区域时 label 已自动切换 checkbox，不需要再手动处理
    if (target.closest('.topics-toggle')) return;
    toggleInput.checked = !toggleInput.checked;
    toggleInput.dispatchEvent(new Event('change'));
  });

  toggleInput.addEventListener('change', () => {
    toggleOn = toggleInput.checked;
    const list = document.getElementById('topics-list');
    if (list) list.style.display = toggleOn ? '' : 'none';
  });

  // 检测当前平台
  const platform = await getCurrentPlatform();
  if (!platform) {
    renderTopics([]);
    return;
  }

  // 读缓存并展示
  try {
    const cached = await getCachedTopics(platform);
    if (cached) {
      renderTopics(cached.topics);
      // 缓存过期：请求 background 后台刷新，下次打开 popup 生效
      if (Date.now() - cached.updatedAt >= CACHE_TTL_MS) {
        chrome.runtime.sendMessage({ type: 'cobridge.refreshTopics', platform });
      }
    } else {
      renderTopics([]);
      // 无缓存：也请求 background 刷新（可能 background 刚启动还没来得及处理）
      chrome.runtime.sendMessage({ type: 'cobridge.refreshTopics', platform });
    }
  } catch (error) {
    console.error('[RecentTopics]', error);
  }
}
