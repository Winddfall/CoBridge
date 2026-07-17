// 搜索 UI 逻辑：只使用语义搜索（基于 embedding 向量相似度）
// 对话数据存储在 IndexedDB 中，通过 background 的语义搜索服务查询

import {t} from './i18n';

// 这个是放在前端看的，不影响业务逻辑
const platformNames: Record<string, string> = {
    chatgpt: 'ChatGPT',
    claude: 'Claude',
    gemini: 'Gemini',
    doubao: 'Doubao',
    deepseek: 'DeepSeek',
};

/** 从当前活跃标签页检测平台 */
async function detectCurrentPlatform() {
    const PLATFORM_HOSTS = {
        'chatgpt.com': 'chatgpt',
        'claude.ai': 'claude',
        'gemini.google.com': 'gemini',
        'doubao.com': 'doubao',
        'deepseek.com': 'deepseek',
    };
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true}); // 活跃标签页
    const url = tab?.url; // 如果 tab 是 undefined 或 null，返回 undefined
    if (url) {
        try {
            // 提取域名
            const hostname = new URL(url).hostname;
            for (const [host, platform] of Object.entries(PLATFORM_HOSTS)) {
                if (hostname.includes(host)) return platform;
            }
        } catch {
            console.error('[CoBridge] Failed to match platform:', url);
        }
        return null;
    } else {
        console.warn('[CoBridge] No active tab found');
        return null;
    }
}

function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/** 导航到指定对话并滚动定位（交给 background 处理，不受 popup 生命周期影响） */
function navigateToTurn(url: string, userMessage: string, turnIndex: number, messageId: string) {
    chrome.runtime.sendMessage({
        type: 'cobridge.navigateToTurn',
        url,
        userMessage,
        turnIndex,
        messageId,
    });
}

function formatTime(ts: number): string {
    const now = Date.now();
    const diff = now - ts;
    if (diff < 60000) return t('justNow') || 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** 渲染前端 */
function renderResults(
    container: HTMLElement,
    results: { userMessage: string; url: string; platform: string; timestamp: number; score: number; turnIndex: number; messageId: string }[],
    searchMode?: string,
) {
    container.innerHTML = '';

    // 显示搜索模式标签
    /*
    if (searchMode && results.length > 0) {
        const modeLabel = document.createElement('div');
        modeLabel.className = 'search-mode-label';
        const modeText = searchMode === 'hybrid' ? '⚡ Hybrid' : searchMode === 'semantic' ? '🧠 Semantic' : searchMode === 'text-fallback' ? '📝 Text' : searchMode === 'text' ? '📝 Text' : '🔍 Search';
        modeLabel.textContent = modeText;
        modeLabel.style.cssText = 'font-size: 10px; color: var(--muted-foreground); padding: 4px 8px; text-align: right;';
        container.appendChild(modeLabel);
    }

     */

    if (results.length === 0) {
        container.innerHTML = `<div class="search-empty">${t('noResults')}</div>`;
        return;
    }

    for (const item of results) {
        const card = document.createElement('div');
        card.className = 'search-result-card';

        const scorePercent = Math.round(item.score * 100);
        card.innerHTML = `
            <div class="search-result-meta">
                <span class="search-result-platform">${platformNames[item.platform] || item.platform}</span>
                <span class="search-result-time">${formatTime(item.timestamp)}</span>
            </div>
            <div class="search-result-text">${escapeHtml(item.userMessage)}</div>
            <div class="search-result-score">${scorePercent}%</div>
        `;

        card.addEventListener('click', () => {
            navigateToTurn(item.url, item.userMessage, item.turnIndex, item.messageId);
        });

        container.appendChild(card);
    }
}

/** 语义搜索：调用 background 的 embedding 服务 */
async function doSearch(
    query: string,
    platform: string | null,
    resultsContainer: HTMLElement,
    getGeneration: () => number,
    requestGen: number,
) {
    const trimmed = query.trim();

    // 无法检测平台时提示用户
    if (!platform) {
        resultsContainer.innerHTML = `<div class="search-empty">${t('noResults') || 'No results'}</div>`;
        return;
    }

    // 如果已经有更新的搜索请求，跳过本次
    if (requestGen !== getGeneration()) return;

    // 语义搜索
    try {
        // 给 background 发送搜索请求
        const response = await chrome.runtime.sendMessage({
            type: 'cobridge.searchConversations',
            query: trimmed,
            limit: 5,
            platform,
        });

        // 搜索请求已过期，丢弃结果
        if (requestGen !== getGeneration()) return;

        if (response?.ok && response.data?.length > 0) {
            console.log('[CoBridge] Semantic search returned', response.data.length, 'results, mode:', response.mode);
            const normalized = normalizeResults(response.data);
            renderResults(resultsContainer, normalized, response.mode);
            return;
        }

        // 搜索无结果
        console.log('[CoBridge] No results found for:', trimmed);
        renderResults(resultsContainer, [], response?.mode || 'semantic');
    } catch (err) {
        console.error('[CoBridge] Search failed:', err);
        renderResults(resultsContainer, []);
    }
}

/** 标准化搜索结果字段名 */
function normalizeResults(data: any[]) {
    return data.map(
        (item: any) =>
        ({
            userMessage: item.userMessage || '',
            url: item.url || '',
            platform: item.platform || '',
            timestamp: item.timestamp || 0,
            score: item.score || 0,
            turnIndex: item.turnIndex ?? 0,
            messageId: item.messageId || '',
        })
    );
}

/** 初始化搜索功能 */
export async function initSearch() {
    const searchInput = document.getElementById('searchInput') as HTMLInputElement; // 输入框
    const searchResults = document.getElementById('searchResults')!; // 搜索结果

    let searchGeneration = 0;
    // 读值接口
    const getGeneration = () => searchGeneration;

    // 检测当前平台
    const currentPlatform: string | null = await detectCurrentPlatform();
    console.log('[CoBridge] Detected platform:', currentPlatform);

    // 初始显示空结果
    searchResults.innerHTML = '';

    // 输入搜索：防抖 300ms
    let searchTimer: any = null; // 输入框定时器
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        const gen = ++searchGeneration; // 生成新的请求序列号

        // 空输入：立即清空结果，不显示“未找到结果”
        if (!searchInput.value.trim()) {
            searchResults.innerHTML = '';
            return;
        }

        searchTimer = setTimeout(() => {
            doSearch(searchInput.value, currentPlatform, searchResults, getGeneration, gen);
        }, 200);
    });
}
