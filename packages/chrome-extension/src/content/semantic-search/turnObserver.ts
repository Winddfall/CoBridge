import { extractConversationId } from '../../utils';

interface AdapterConfig {
    user_selector: string;
    ai_selector: string;
    id_selector?: string;  // 消息容器上的 ID 属性名
}

interface Adapters {
    default: AdapterConfig;
    [host: string]: AdapterConfig;
}

// 这里的 id_selector ：每一条消息（无论问答）都有一个唯一的 ID
const ADAPTERS: Adapters = {
    default: {
        user_selector: '',
        ai_selector: ''
    },
    'gemini': {
        user_selector: 'div.query-content',
        ai_selector: '.response-content',
        id_selector: 'id'
    },
    'chatgpt': {
        user_selector: '[data-message-author-role="user"]',
        ai_selector: '[data-message-author-role="assistant"]',
        id_selector: 'data-message-id'
    },
    // claude 平台没有消息 ID
    'claude': {
        user_selector: 'div[class="contents"]',
        ai_selector: 'div[class="contents"]'
    },
    'doubao': {
        user_selector: 'div[data-message-id]',
        ai_selector: 'div[data-message-id]',
        id_selector: 'data-message-id'
    },
    'deepseek': {
        user_selector: '[data-virtual-list-item-key]',
        ai_selector: '[data-virtual-list-item-key]',
        id_selector: 'data-virtual-list-item-key'
    }
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

let extractTimer: ReturnType<typeof setTimeout> | null = null; // 向量化的定时器
let currentConversationId: string | null = null;

let autoScanTimer: ReturnType<typeof setTimeout> | null = null;

/** 初始化 URL 变化检测 */
function initUrlChangeDetection() {
    // 检查对话ID，执行自动扫描
    const checkUrlChange = () => {
        const newId = extractConversationId(window.location.href, AIname);
        if (newId && newId !== currentConversationId) {
            const oldId = currentConversationId;
            currentConversationId = newId;
            console.log('[CoBridge] Conversation changed:', oldId, '->', newId);
            // 对 performAutoScan() 做防抖处理
            if (autoScanTimer) clearTimeout(autoScanTimer);
            autoScanTimer = setTimeout(() => {
                performAutoScan();
                autoScanTimer = null;
            }, 1500);
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
        return await chrome.runtime.sendMessage(message);
    } catch (err) {
        console.warn('[CoBridge] Message failed:', err);
        return null;
    }
}

// ── 主入口 ────────────────────────────────────────────────────

const host: string = window.location.hostname;
const { AIname, adapter } = getMatchedAdapter(host);
console.log('[CoBridge] TurnObserver loaded on:', host, 'matched:', AIname);

// 语义搜索功能，消息协议
interface MessageRequest {
  action: string;
  expectedUrl: string;
  userMessage: string;
  turnIndex: number;
  messageId: string;
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
        (async ()=> {
            try {
                const found: boolean = await scrollToTurn(request.turnIndex, request.messageId);
                sendResponse({ ok: true, found });
            } catch (err: any) {
                sendResponse({ ok: false, error: String(err) });
            }
        })();
        return true;
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
        }
        if (!hasNewMessage) return;

        /* 防抖逻辑 */
        if (extractTimer) clearTimeout(extractTimer);
        // 这里 extractTimer 的值是一个数字
        extractTimer = setTimeout(() => {
            // 提取最新轮次并发送给 background
            extractLatestTurn();
            extractTimer = null;
        }, 5000);
    });

    observer.observe(document.body, {
        childList: true, // 字节点的增删
        subtree: true, // 是否监控所有后代节点
    });
}

/** 判断元素是否属于用户消息容器 */
function isMessageContainer(el: HTMLElement, cfg: AdapterConfig): boolean {
    if (!el.querySelectorAll) return false;
    if (AIname === 'deepseek') { // 偶数是 AI 消息，不提取
        const key = el.getAttribute('data-virtual-list-item-key');
        if (key && Number(key) % 2 == 0) return false;
    }
    // 自身匹配 + 内部包含匹配的元素
    return !!cfg.user_selector && (
        el.matches(cfg.user_selector) ||
        el.querySelector(cfg.user_selector) !== null
    );
}

// ── 提取并发送（实时模式：只提取最后一轮）─────────────────────
function extractLatestTurn() {
    /** 提取最后一轮对话 */
    const extractLastTurn = (cfg: AdapterConfig) => {
        switch (AIname) {
            case 'gemini':
            case 'chatgpt': {
                const queries = document.querySelectorAll<HTMLElement>(cfg.user_selector);
                if (queries.length === 0) return null;
                const queryEl: HTMLElement = queries[queries.length - 1];
                let queryString: string = queryEl.innerText?.trim() || '';
                if (AIname === 'gemini') queryString = queryString.slice(4); // 去掉 "你说\n\n" 前缀
                return { queryString, turnIndex: queries.length - 1, messageId: extractMessageId(queryEl, cfg) };
            }
            case 'doubao':
            case 'claude':
            case 'deepseek': {
                const msgs = document.querySelectorAll<HTMLElement>(cfg.user_selector);
                if (msgs.length === 0) return null;
                // 倒数第二个是用户消息
                const queryEl: HTMLElement = msgs[msgs.length - 2];
                const queryString: string = queryEl.innerText?.trim() || '';
                return { queryString, turnIndex: (msgs.length - 2) / 2, messageId: extractMessageId(queryEl, cfg) };
            }
            default:
                return null;
        }
    }

    /** 将最后一轮对话发送给 background ，以待保存 */
    const sendTurnToBackground = async (queryString: string, turnIndex: number, messageId: string) => {
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
            }
        });
        if (response?.ok) {
            console.log('[CoBridge] Turn saved');
        } else if (response) {
            console.warn('[CoBridge] Save failed:', response?.error);
        }
    }

    // 提取最后一轮对话
    const lastQueryTurn = extractLastTurn(adapter);

    if (!lastQueryTurn) return;
    // 发送给 background
    sendTurnToBackground(lastQueryTurn.queryString, lastQueryTurn.turnIndex, lastQueryTurn.messageId);
}

// ── 自动扫描 ────────────────────────────────────────────────────

/** 执行自动扫描（会话 URL 变化时触发） */
async function performAutoScan() {
    console.log('[CoBridge] Auto-scan triggered for:', AIname);
    // const conversationUrl = getConversationUrl();
    const conversationUrl = window.location.href;
    const pairs = await scanAllTurnsFromDom(conversationUrl);
    console.log('pairs', pairs)
    await savePairsToBackground(pairs);
}

/** 扫描所有对话 */
async function scanAllTurnsFromDom(conversationUrl: string): Promise<{
    user: string; url: string; platform: string; turnIndex: number; messageId: string;
}[]> {
    if (AIname === 'default') return [];
    /** 提取页面上所有提问轮次 */
    const extractAllPairs = (cfg: AdapterConfig): { user: string; turnIndex: number; messageId: string }[] => {
        const queryTurns: { user: string; turnIndex: number; messageId: string }[] = [];
        switch (AIname) {
            case 'gemini':
            case 'chatgpt':
                const queries = document.querySelectorAll<HTMLElement>(cfg.user_selector);
                for (let i = 0; i < queries.length; i++) {
                    let user = queries[i].innerText?.trim() || '';
                    if (AIname === 'gemini') user = user.slice(4);
                    if (user.length >= 2) queryTurns.push({ user, turnIndex: i, messageId: extractMessageId(queries[i], cfg) });
                }
                break;
            case 'doubao':
            case 'claude':
            case 'deepseek':
                const msgs = document.querySelectorAll<HTMLElement>(cfg.user_selector);
                for (let i = 0; i + 1 < msgs.length; i += 2) {
                    const user = msgs[i].innerText?.trim() || '';
                    if (user.length >= 2) queryTurns.push({ user, turnIndex: i / 2, messageId: extractMessageId(msgs[i], cfg) });
                }
                break;
        }
        return queryTurns;
    }
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

/** 从消息元素中提取 MessageId */
function extractMessageId(el: HTMLElement, cfg: AdapterConfig): string {
    if (!cfg.id_selector) return '';
    return el.getAttribute(cfg.id_selector) || '';
}

// ── 滚动定位到指定对话 ─────────────────────────────────────────

/** 在 DOM 中查找目标消息元素，处理虚拟滚动场景 */
async function findTargetElement(messageId: string, turnIndex: number) {
    /** 找到聊天区域的可滚动容器 */
    const findScrollContainer = (): HTMLElement | null => {
        // 优先通过已有消息元素向上找滚动容器
        const anyMsg = document.querySelector<HTMLElement>(adapter.user_selector);
        if (anyMsg) {
            let parent = anyMsg.parentElement;
            while (parent && parent !== document.body) {
                const style = getComputedStyle(parent);
                const overflow = style.overflow + style.overflowY;
                if ((overflow.includes('auto') || overflow.includes('scroll')) && parent.scrollHeight > parent.clientHeight + 10) {
                    return parent;
                }
                parent = parent.parentElement;
            }
        }
        return null;
    }

    const selector = `[${adapter.id_selector}="${messageId}"]`;

    // 第一轮：直接查找（元素可能已在视口附近）
    const direct = document.querySelector<HTMLElement>(selector);
    if (direct) return direct;

    // 第二轮：滚动探测，应对虚拟滚动
    const container = findScrollContainer();
    if (!container) {
        console.warn('[CoBridge] No scroll container found');
        return null;
    }

    // 根据 turnIndex 估算目标的大致滚动位置
    const totalMessages = document.querySelectorAll<HTMLElement>(adapter.user_selector).length;
    // const totalMessages = document.querySelectorAll([data-message-author-role="user"]).length
    const ratio = totalMessages > 0 ? Math.max(0, Math.min(1, turnIndex / totalMessages)) : 0;
    const estimatedTop = ratio * container.scrollHeight;

    // 跳到估算位置，触发虚拟列表渲染
    container.scrollTop = estimatedTop;
    await new Promise(r => setTimeout(r, 300));

    let el = document.querySelector<HTMLElement>(selector);
    if (el) return el;

    // 从估算位置向上探测（每次滚动一屏）
    const step = container.clientHeight;
    const maxProbes = 10;
    let probeTop = estimatedTop;

    for (let i = 0; i < maxProbes; i++) {
        probeTop = Math.max(0, probeTop - step);
        container.scrollTop = probeTop;
        await new Promise(r => setTimeout(r, 200));
        el = document.querySelector<HTMLElement>(selector);
        if (el) return el;
        if (probeTop === 0) break;
    }

    // 向下探测（从估算位置往下）
    probeTop = estimatedTop;
    for (let i = 0; i < maxProbes; i++) {
        probeTop = Math.min(container.scrollHeight - container.clientHeight, probeTop + step);
        container.scrollTop = probeTop;
        await new Promise(r => setTimeout(r, 200));
        el = document.querySelector<HTMLElement>(selector);
        if (el) return el;
        if (probeTop >= container.scrollHeight - container.clientHeight) break;
    }

    console.warn('[CoBridge] messageId not found after scroll probing:', messageId);
    return null;
}

/** 滚动定位到指定对话 */
async function scrollToTurn(turnIndex: number, messageId: string): Promise<boolean> {
    console.log('[CoBridge] scrollToTurn:', { messageId, turnIndex, platform: AIname });

    // 仅通过 messageId 精确查找，找到就高亮并滚动
    const target = await findTargetElement(messageId, turnIndex);
    if (target) {
        console.log('target', target);
        // 滚动并高亮
        highlightTarget(target);
        return true;
    }

    console.warn('[CoBridge] scrollToTurn: target not found (messageId:', messageId, ')');
    return false;
}

function highlightTarget(el: any) {
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
        border-radius: 6px;
        transition: opacity 0.6s ease-out;
        background: rgba(87, 99, 221, 0.22);
        border-left: 3px solid #5763DD;
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