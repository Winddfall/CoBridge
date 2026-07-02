// 对话轮次监听与扫描器
// 两种模式：
//   1. MutationObserver 实时监听新对话
//   2. 手动扫描当前页面所有对话（由 popup 触发）

// ── 适配器配置 ────────────────────────────────────────────────

interface AdapterConfig {
    user_selector: string;
    ai_selector: string;
    id_selector?: string;  // 消息容器上的 ID 属性名，如 'data-message-id'
}

interface Adapters {
    default: AdapterConfig;
    [host: string]: AdapterConfig;
}

// 这里的 id_selector ：每一条消息（无论问答）都有一个唯一的 ID
const ADAPTERS: Adapters = {
    default: { user_selector: '', ai_selector: '' },
    'gemini': { user_selector: 'div.query-content', ai_selector: '.response-content', id_selector: 'id' },
    'chatgpt': { user_selector: '[data-message-author-role="user"]', ai_selector: '[data-message-author-role="assistant"]', id_selector: 'data-message-id' },
    'claude': { user_selector: 'div[class="contents"]', ai_selector: 'div[class="contents"]' },
    'doubao': { user_selector: 'div[data-message-id]', ai_selector: 'div[data-message-id]', id_selector: 'data-message-id' },
};

function getMatchedAdapter(host: string) {
    for (const key of Object.keys(ADAPTERS)) {
        if (key === 'default') continue;
        if (host.includes(key)) {
            return { AIname: key, adapter: ADAPTERS[key] };
        }
    }
    return { AIname: 'default', adapter: ADAPTERS['default'] };
}

// ── 状态 ──────────────────────────────────────────────────────

let extractTimer: ReturnType<typeof setTimeout> | null = null; // 向量化定时器
let currentConversationId: string | null = null;

// Gemini URL 缓存：拦截 history.pushState/replaceState 捕获最新对话 URL
let geminiLastCapturedUrl: string | null = null;

/** 从 URL 中提取会话 ID */
function extractConversationId(url: string): string | null {
    try {
        const pathname = new URL(url).pathname; // 路径
        switch (AIname) {
            case 'chatgpt': {
                const m = pathname.match(/\/c\/([a-zA-Z0-9-]+)/);
                return m ? m[1] : null;
            }
            case 'claude': {
                const m = pathname.match(/\/chat\/([a-zA-Z0-9-]+)/);
                return m ? m[1] : null;
            }
            case 'gemini': {
                const m = pathname.match(/\/app\/([a-zA-Z0-9]+)/);
                return m ? m[1] : null;
            }
            case 'doubao': {
                const m = pathname.match(/\/chat\/([a-zA-Z0-9-]+)/);
                return m ? m[1] : null;
            }
            default:
                return null;
        }
    } catch {
        return null;
    }
}

let autoScanTimer: ReturnType<typeof setTimeout> | null = null;

/** 会话 URL 变化时触发自动扫描 */
function onConversationChanged() {
    if (autoScanTimer) clearTimeout(autoScanTimer);
    autoScanTimer = setTimeout(() => {
        performAutoScan();
    }, 1500);
}

/** 初始化 URL 变化检测 */
function initUrlChangeDetection() {
    const checkUrlChange = () => {
        // Gemini 特殊：同步更新 geminiLastCapturedUrl
        if (AIname === 'gemini') {
            const match = window.location.pathname.match(/\/app\/[a-zA-Z0-9]+/);
            if (match) {
                geminiLastCapturedUrl = `${window.location.origin}${match[0]}`;
            }
        }

        const newId = extractConversationId(window.location.href);
        if (newId && newId !== currentConversationId) {
            const oldId = currentConversationId;
            currentConversationId = newId;
            console.log('[CoBridge] Conversation changed:', oldId, '->', newId);
            onConversationChanged();
        }
    };

    // 拦截 pushState / replaceState
    const origPushState = history.pushState;
    const origReplaceState = history.replaceState;

    history.pushState = function (...args) {
        origPushState.apply(this, args);
        checkUrlChange();
    };
    history.replaceState = function (...args) {
        origReplaceState.apply(this, args);
        checkUrlChange();
    };

    // 监听浏览器前进/后退
    window.addEventListener('popstate', checkUrlChange);

    // 监听 hash 变化（部分 SPA 用 hash 路由）
    window.addEventListener('hashchange', checkUrlChange);

    // 轮询兜底（防止遗漏某些导航方式，如 location.href 赋值）
    setInterval(checkUrlChange, 2000);

    // 页面加载时初始检查
    checkUrlChange();
}

/** 向 background 发送消息的通用封装 */
async function sendMessageToBackground(message: any): Promise<any> {
    try {
        const response = await chrome.runtime.sendMessage(message);
        return response;
    } catch (err) {
        console.warn('[CoBridge] Message failed:', err);
        return null;
    }
}

// ── 主入口 ────────────────────────────────────────────────────

const host: string = window.location.hostname;
const { AIname, adapter } = getMatchedAdapter(host);

console.log('[CoBridge] TurnObserver loaded on:', host, 'matched:', AIname);

// 消息协议
interface MessageRequest {
  action: string;
  expectedUrl?: string;
  userMessage?: string;
  turnIndex?: number;
  messageId?: string;
}

// 监听广播消息
chrome.runtime.onMessage.addListener((request: MessageRequest, sender, sendResponse) => {
  switch (request.action) {
    case 'cobridge.scanCurrentPage':
        (async()=> {
            try {
                const pairs = await scanAllTurnsFromDom(request.expectedUrl!);
                sendResponse({ ok: true, count: pairs.length, pairs })
            } catch(err: any) {
                sendResponse({ ok: false, error: String(err) });
            }
        })();
        return true;
    case 'cobridge.scrollToTurn':
        (async()=> {
            const found: boolean = await scrollToTurn(request.userMessage!, request.turnIndex!, request.messageId!);
            sendResponse({ ok: true, found });
        })();
        return true;
    case 'cobridge.getSidebarConversations':
      sendResponse({ ok: true, conversations: getSidebarConversations() });
      return false;
  }
});

// 启动 MutationObserver 实时监听 + URL 变化检测
if (AIname !== 'default') {
    const init = () => {
        startObserver();
        initUrlChangeDetection();
    };
    if (document.body) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
}

// ── MutationObserver ──────────────────────────────────────────

function startObserver() {
    console.log('[CoBridge] MutationObserver started for:', AIname);

    // 监控网页 dom 变化的 observer
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
        let hasNewMessage = false;
        // 遍历所有变化
        for (const mutation of mutations) {
            // 子节点增删
            if (mutation.type === 'childList') {
                // 新增节点
                for (const node of mutation.addedNodes) {
                    // 判断是否是新消息
                    if (node instanceof HTMLElement && isMessageContainer(node, adapter)) {
                        hasNewMessage = true;
                        console.log('[CoBridge] New message found:', node);
                        break;
                    }
                }
            }
            // 文本内容变化
            /*
            if (mutation.type === 'characterData' && mutation.target.parentElement) {
                if (isMessageContainer(mutation.target.parentElement, adapter)) {
                    hasNewMessage = true;
                }
                console.log('[CoBridge] Text content changed:', mutation.target.textContent);
            }
            if (hasNewMessage) break;
             */
        }
        if (!hasNewMessage) return;

        if (extractTimer) clearTimeout(extractTimer);
        extractTimer = setTimeout(() => {
            // 提取最新轮次
            extractLatestTurn();
            // 新消息到达时触发全量扫描
            // performAutoScan();
        }, 1000);
    });

    observer.observe(document.body, {
        childList: true, // 字节点的增删
        subtree: true, // 是否监控所有后代节点
        characterData: true, // 文本内容变化
    });
}

/** 判断元素是否属于用户消息容器 */
function isMessageContainer(el: HTMLElement, cfg: AdapterConfig): boolean {
    if (!el.querySelectorAll) return false;
    // 自身匹配 + 内部包含匹配的元素
    return !!cfg.user_selector && (
        el.matches(cfg.user_selector) ||
        el.querySelector(cfg.user_selector) !== null
    );
}

// ── 提取并发送（实时模式：只提取最后一轮）─────────────────────

function extractLatestTurn() {
    // 提取最后一轮对话
    const pair = extractLastPair(adapter);
    if (!pair) return;
    console.log('[CoBridge] Realtime turn:', pair.queryString.slice(0, 100));
    // 发送给 background
    sendTurnToBackground(pair.queryString, pair.turnIndex, pair.messageId);
}

// ── 自动扫描 ────────────────────────────────────────────────────

/** 执行自动扫描（会话 URL 变化时触发） */
async function performAutoScan() {
    console.log('[CoBridge] Auto-scan triggered for:', AIname);
    // const conversationUrl = getConversationUrl();
    const conversationUrl = window.location.href;
    const pairs = await scanAllTurnsFromDom(conversationUrl);
    await savePairsToBackground(pairs);
}

/** 轻量 DOM 扫描 */
async function scanAllTurnsFromDom(conversationUrl: string): Promise<{
    user: string; url: string; platform: string; turnIndex: number; messageId: string;
}[]> {
    if (AIname === 'default') return [];

    const allPairs = extractAllPairs(adapter);
    if (allPairs.length === 0) {
        console.log('[CoBridge] Auto-scan: no messages in DOM');
        return [];
    }

    console.log('[CoBridge] Auto-scan: found', allPairs.length, 'turns in DOM');
    return allPairs.map((pair) => ({
        user: pair.user.slice(0, 500),
        url: conversationUrl,
        platform: AIname,
        turnIndex: pair.turnIndex,
        messageId: pair.messageId,
    }));
}

/** 将扫描结果发送到 background 进行向量化存储 */
async function savePairsToBackground(
    pairs: Array<{ user: string; url: string; platform: string; turnIndex: number; messageId: string }>
) {
    if (pairs.length === 0) return;
    console.log('[CoBridge] Auto-scan: saving', pairs.length, 'turns');
    for (const pair of pairs) {
        await sendMessageToBackground({
            type: 'cobridge.vectorizeAndSave',
            data: {
                url: pair.url,
                platform: pair.platform,
                userMessage: pair.user,
                timestamp: Date.now(),
                turnIndex: pair.turnIndex,
                messageId: pair.messageId,
            },
        });
    }
    console.log('[CoBridge] Auto-scan: done');
}

// ── DOM 提取逻辑 ──────────────────────────────────────────────

/** 从消息元素中提取 DOM 消息 ID */
// claude 没有消息 ID
function extractMessageId(el: HTMLElement, cfg: AdapterConfig): string {
    if (!cfg.id_selector) return '';
    return el.getAttribute(cfg.id_selector) || '';
}

/** 提取最后一轮对话 */
function extractLastPair(cfg: AdapterConfig) {
    switch (AIname) {
        case 'gemini':
        case 'chatgpt': {
            const queries = document.querySelectorAll<HTMLElement>(cfg.user_selector);
            if (queries.length === 0) return null;
            const queryEl = queries[queries.length - 1];
            const queryString = queryEl.innerText?.trim() || '';
            return { queryString, turnIndex: queries.length - 1, messageId: extractMessageId(queryEl, cfg) };
        }
        case 'doubao':
        case 'claude': {
            const msgs = document.querySelectorAll<HTMLElement>(cfg.user_selector);
            if (msgs.length === 0) return null;
            const queryEl = msgs[msgs.length - 2];
            const queryString = queryEl.innerText?.trim() || '';
            return { queryString, turnIndex: (msgs.length - 2) / 2, messageId: extractMessageId(queryEl, cfg) };
        }
        default:
            return null;
    }
}

/** 提取页面上所有对话轮次 */
function extractAllPairs(cfg: AdapterConfig): { user: string; turnIndex: number; messageId: string }[] {
    const pairs: { user: string; turnIndex: number; messageId: string }[] = [];

    switch (AIname) {
        case 'gemini':
        case 'chatgpt': {
            const queries = document.querySelectorAll<HTMLElement>(cfg.user_selector);
            for (let i = 0; i < queries.length; i++) {
                const user = queries[i].innerText?.trim() || '';
                if (user.length >= 2) pairs.push({ user, turnIndex: i, messageId: extractMessageId(queries[i], cfg) });
            }
            break;
        }
        case 'doubao':
        case 'claude': {
            const msgs = document.querySelectorAll<HTMLElement>(cfg.user_selector);
            for (let i = 0; i + 1 < msgs.length; i += 2) {
                const user = msgs[i].innerText?.trim() || '';
                if (user.length >= 2) pairs.push({ user, turnIndex: i / 2, messageId: extractMessageId(msgs[i], cfg) });
            }
            break;
        }
    }

    return pairs;
}

// ── 滚动定位到指定对话 ─────────────────────────────────────────

/** 在 DOM 中查找目标消息元素 */
function findTargetElement(_userMessage: string, _turnIndex: number, messageId: string): HTMLElement | null {
    // 仅通过 messageId 精确匹配
    if (messageId && adapter.id_selector) {
        const el = document.querySelector<HTMLElement>(`[${adapter.id_selector}="${messageId}"]`);
        if (el) {
            console.log('[CoBridge] Matched by messageId:', messageId);
            return el;
        }
        console.warn('[CoBridge] messageId not found in DOM:', messageId);
    } else {
        console.warn('[CoBridge] No messageId or id_selector for platform:', AIname);
    }

    return null;
}

async function scrollToTurn(userMessage: string, turnIndex: number, messageId: string): Promise<boolean> {
    console.log('[CoBridge] scrollToTurn:', { messageId, turnIndex, platform: AIname });

    // 仅通过 messageId 精确查找，找到就高亮并滚动
    const target = findTargetElement(userMessage, turnIndex, messageId);
    if (target) {
        highlightTarget(target);
        return true;
    }

    console.warn('[CoBridge] scrollToTurn: target not found (messageId:', messageId, ')');
    return false;
}

function highlightTarget(el: HTMLElement) {
    // 找到最近的可滚动父容器，手动滚动到目标位置
    let parent: HTMLElement | null = el.parentElement;
    while (parent && parent !== document.body) {
        const style = getComputedStyle(parent);
        const overflow = style.overflow + style.overflowY;
        if ((overflow.includes('auto') || overflow.includes('scroll')) && parent.scrollHeight > parent.clientHeight + 10) {
            const elTop = el.offsetTop - parent.offsetTop;
            const targetScroll = elTop - parent.clientHeight / 3;
            parent.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
            console.log('[CoBridge] Scrolled container', parent.tagName, parent.className?.slice(0, 40), 'to', Math.max(0, targetScroll));
            break;
        }
        parent = parent.parentElement;
    }

    // 滚动到目标位置
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // 创建独立的高亮覆盖层（不受页面 CSS 影响）
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: absolute;
        pointer-events: none;
        z-index: 2147483647;
        border-radius: 4px;
        transition: opacity 0.5s;
        box-shadow: 0 0 0 3px oklch(0.55 0.17 155), 0 0 12px oklch(0.55 0.17 155 / 0.3);
    `;

    const updatePosition = () => {
        const rect = el.getBoundingClientRect();
        overlay.style.top = `${rect.top + window.scrollY}px`;
        overlay.style.left = `${rect.left + window.scrollX}px`;
        overlay.style.width = `${rect.width}px`;
        overlay.style.height = `${rect.height}px`;
    };

    updatePosition();
    document.body.appendChild(overlay);

    // 跟随滚动更新位置（包括嵌套滚动容器）
    const scrollHandler = () => updatePosition();
    const scrollTargets: (Window | Element)[] = [window];
    let scrollParent = el.parentElement;
    while (scrollParent && scrollParent !== document.body) {
        const style = getComputedStyle(scrollParent);
        const overflow = style.overflow + style.overflowY;
        if (overflow.includes('auto') || overflow.includes('scroll')) {
            scrollTargets.push(scrollParent);
        }
        scrollParent = scrollParent.parentElement;
    }
    scrollTargets.forEach(t => t.addEventListener('scroll', scrollHandler, { passive: true }));

    // 3 秒后淡出移除
    setTimeout(() => {
        overlay.style.opacity = '0';
        scrollTargets.forEach(t => t.removeEventListener('scroll', scrollHandler));
        setTimeout(() => overlay.remove(), 500);
    }, 3000);
}

// ── 发送到 background ─────────────────────────────────────────

async function sendTurnToBackground(queryString: string, turnIndex: number, messageId: string) {
    // 向量化并保存
    const response = await sendMessageToBackground({
        type: 'cobridge.vectorizeAndSave',
        data: {
            url: window.location.href,
            platform: AIname,
            userMessage: queryString.slice(0, 500),
            timestamp: Date.now(),
            turnIndex,
            messageId,
        },
    });
    if (response?.ok) {
        console.log('[CoBridge] Turn saved');
    } else if (response) {
        console.warn('[CoBridge] Save failed:', response?.error);
    }
}

// ── 侧边栏对话列表抓取 ─────────────────────────────────────────

/** 各平台侧边栏选择器 */
const SIDEBAR_SELECTORS: Record<string, { linkSelector: string; titleSelector: string }> = {
    chatgpt: {
        linkSelector: 'nav a[href*="/c/"]',
        titleSelector: '', // 直接用 textContent
    },
    claude: {
        linkSelector: 'a[href*="/chat/"]',
        titleSelector: '',
    },
    gemini: {
        linkSelector: 'gem-nav-list-item[data-test-id="conversation"] a[href*="/app/"]',
        titleSelector: '.title-text',
    },
    doubao: {
        linkSelector: 'a[href*="/chat/"]',
        titleSelector: '',
    },
};

/**
 * 从当前页面的侧边栏读取对话链接列表
 * 返回 { url, title } 数组，按在侧边栏中出现的顺序排列
 */
function getSidebarConversations(): { url: string; title: string }[] {
    const selectors = SIDEBAR_SELECTORS[AIname];
    if (!selectors) {
        console.warn('[CoBridge] No sidebar selector for platform:', AIname);
        return [];
    }

    const links = document.querySelectorAll<HTMLAnchorElement>(selectors.linkSelector);
    const results: { url: string; title: string }[] = [];

    for (const link of links) {
        const href = link.getAttribute('href');
        if (!href) continue;

        // 构造完整 URL（Gemini 的 href 是 /app/xxx 格式）
        let url: string;
        if (AIname === 'gemini') {
            const match = href.match(/(\/app\/[a-zA-Z0-9]+)/);
            url = match ? `${window.location.origin}${match[1]}` : `${window.location.origin}${href}`;
        } else {
            url = href.startsWith('http') ? href : `${window.location.origin}${href}`;
        }

        // 提取标题
        let title = '';
        if (selectors.titleSelector) {
            const titleEl = link.querySelector(selectors.titleSelector);
            title = titleEl?.textContent?.trim() || '';
        }
        if (!title) {
            // fallback：取链接本身的文本内容
            title = link.textContent?.trim() || '';
        }
        // 清理标题（去掉多余空白和操作按钮文字）
        title = title.replace(/\s+/g, ' ').trim().slice(0, 100);

        if (title) {
            results.push({ url, title });
        }
    }

    console.log(`[CoBridge] Found ${results.length} conversations in sidebar`);
    return results;
}
