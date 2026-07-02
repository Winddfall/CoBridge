// 搜索 UI 逻辑：只使用语义搜索（基于 embedding 向量相似度）
// 对话数据存储在 IndexedDB 中，通过 background 的语义搜索服务查询

import { t } from './i18n';

const platformNames: Record<string, string> = {
    chatgpt: 'ChatGPT',
    claude: 'Claude',
    gemini: 'Gemini',
    doubao: 'Doubao',
};

const PLATFORM_HOSTS: Record<string, string> = {
    'chatgpt.com': 'Chatgpt',
    'claude.ai': 'Claude',
    'gemini.google.com': 'Gemini',
    'doubao.com': 'Doubao',
};

/** 从 URL 匹配平台 */
function matchPlatform(url: string): string | null {
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
}

/** 从当前活跃标签页检测平台 */
async function detectCurrentPlatform() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true}); // 标签页
    const url = tab?.url; // 如果 tab 是 undefined 或 null，返回 undefined
    if (url) {
        return matchPlatform(url);
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
        type: 'gv.navigateToTurn',
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

function renderResults(
    container: HTMLElement,
    results: { user: string; url: string; platform: string; timestamp: number; score: number; turnIndex: number; messageId: string }[],
    searchMode?: string,
) {
    container.innerHTML = '';

    // 显示搜索模式标签
    if (searchMode && results.length > 0) {
        const modeLabel = document.createElement('div');
        modeLabel.className = 'search-mode-label';
        const modeText = searchMode === 'hybrid' ? '⚡ Hybrid' : searchMode === 'semantic' ? '🧠 Semantic' : searchMode === 'text-fallback' ? '📝 Text' : searchMode === 'text' ? '📝 Text' : '🔍 Search';
        modeLabel.textContent = modeText;
        modeLabel.style.cssText = 'font-size: 10px; color: var(--muted-foreground); padding: 4px 8px; text-align: right;';
        container.appendChild(modeLabel);
    }

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
            <div class="search-result-text">${escapeHtml(item.user)}</div>
            <div class="search-result-score">${scorePercent}%</div>
        `;

        card.addEventListener('click', () => {
            navigateToTurn(item.url, item.user, item.turnIndex, item.messageId);
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

    // 空查询：清空搜索结果
    /*
    if (!trimmed) {
        resultsContainer.innerHTML = '';
        return;
    }

     */

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
function normalizeResults(data: any[]): { user: string; url: string; platform: string; timestamp: number; score: number; turnIndex: number; messageId: string }[] {
    return data.map((item: any) => ({
        user: item.userMessage || item.user || '',
        url: item.url || '',
        platform: item.platform || '',
        timestamp: item.timestamp || 0,
        score: item.score || 0,
        turnIndex: item.turnIndex ?? 0,
        messageId: item.messageId || '',
    }));
}

/** 批量扫描：通过浏览器历史记录扫描最近的对话 */
function startBatchScan(batchBtn: HTMLButtonElement, statusEl: HTMLElement) {
    batchBtn.disabled = true;
    batchBtn.querySelector('span')!.textContent = t('scanning') || 'Scanning...';

    const port = chrome.runtime.connect({ name: 'gv.batchScan' });

    port.onMessage.addListener((msg: any) => {
        if (msg.status === 'searching') {
            statusEl.textContent = t('batchSearching') || 'Searching history...';
            statusEl.style.color = 'var(--muted-foreground)';
        } else if (msg.status === 'scanning') {
            const percent = msg.total > 0 ? Math.round((msg.processed / msg.total) * 100) : 0;
            statusEl.textContent = `${msg.processed}/${msg.total} (${msg.turns} turns)`;
            statusEl.style.color = 'var(--muted-foreground)';
        } else if (msg.status === 'done') {
            statusEl.textContent = msg.message;
            statusEl.style.color = msg.turns > 0 ? 'oklch(0.55 0.17 155)' : 'var(--muted-foreground)';
            batchBtn.disabled = false;
            batchBtn.querySelector('span')!.textContent = t('batchScanBtn') || 'Batch';
            setTimeout(() => { statusEl.textContent = ''; }, 5000);
            port.disconnect();
        } else if (msg.status === 'error') {
            statusEl.textContent = msg.message;
            statusEl.style.color = 'var(--destructive)';
            batchBtn.disabled = false;
            batchBtn.querySelector('span')!.textContent = t('batchScanBtn') || 'Batch';
            setTimeout(() => { statusEl.textContent = ''; }, 5000);
            port.disconnect();
        }
    });

    port.onDisconnect.addListener(() => {
        batchBtn.disabled = false;
        batchBtn.querySelector('span')!.textContent = t('batchScanBtn') || 'Batch';
    });
}

/** 初始化搜索功能 */
export async function initSearch() {
    const searchInput = document.getElementById('searchInput') as HTMLInputElement; // 输入框
    const searchResults = document.getElementById('searchResults')!; // 搜索结果
    const searchStatus = document.getElementById('searchStatus')!; // 搜索状态
    const batchScanBtn = document.getElementById('batchScanBtn') as HTMLButtonElement; // 批量按钮

    // 在不同的环境中，setTimeout() 返回的类型不同，这样写能适应不同类型
    let searchTimer: ReturnType<typeof setTimeout> | null = null; // 输入框定时器
    let searchGeneration = 0;
    // 读值接口
    const getGeneration = () => searchGeneration;

    // 检测当前平台
    const currentPlatform: string | null = await detectCurrentPlatform();
    console.log('[CoBridge] Detected platform:', currentPlatform);

    // 输入搜索：防抖 300ms
    searchInput.addEventListener('input', () => {
        if (searchTimer) clearTimeout(searchTimer);
        const gen = ++searchGeneration;

        // 空输入：立即清空，不走防抖
        if (!searchInput.value.trim()) {
            searchResults.innerHTML = '';
            return;
        }

        searchTimer = setTimeout(() => {
            doSearch(searchInput.value, currentPlatform, searchResults, getGeneration, gen);
        }, 300);
    });

    // 批量扫描按钮
    batchScanBtn.addEventListener('click', () => {
        startBatchScan(batchScanBtn, searchStatus);
    });

    // 初始显示空状态（不自动加载搜索历史）
    searchResults.innerHTML = `<div class="search-empty">${t('noResults') || 'Search conversations'}</div>`;
}
