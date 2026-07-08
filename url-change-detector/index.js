/**
 * URL Change Detector
 * 检测浏览器中所有 URL 变化方式：
 * - 新标签页 / 首次加载
 * - 从其他页面导航过来
 * - 页面刷新 (F5 / 刷新按钮)
 * - SPA pushState / replaceState
 * - 浏览器前进 / 后退
 * - hash 路由变化
 * - 直接修改 location.href
 *
 * 同时派发全局 CustomEvent('urlchange') 和提供 onUrlChange() 回调 API
 */

// --- 内部状态 ---

const STORAGE_KEY = '__url_change_detector_last_url';
const INIT_FLAG = '__url_change_detector_initialized';

/** @type {Set<(detail: UrlChangeDetail) => void>} */
const listeners = new Set();

let currentUrl = '';

// --- 工具函数 ---

/** 从 sessionStorage 读取上次 URL */
function getStoredUrl() {
    try {
        return sessionStorage.getItem(STORAGE_KEY) || '';
    } catch {
        return '';
    }
}

/** 把当前 URL 写入 sessionStorage */
function setStoredUrl(url) {
    try {
        sessionStorage.setItem(STORAGE_KEY, url);
    } catch {
        // 隐私模式或存储已满时静默忽略
    }
}

/** 检测当前页面是否是通过刷新加载的 */
function isPageReload() {
    try {
        const entry = performance.getEntriesByType('navigation')[0];
        return entry && entry.type === 'reload';
    } catch {
        return false;
    }
}

/** 检测是否是通过前进/后退按钮加载的 */
function isBackForwardNavigation() {
    try {
        const entry = performance.getEntriesByType('navigation')[0];
        return entry && entry.type === 'back_forward';
    } catch {
        return false;
    }
}

// --- 核心事件派发 ---

/**
 * 触发 URL 变化通知
 * @param {string} oldUrl
 * @param {string} newUrl
 * @param {ChangeType} type
 */
function emit(oldUrl, newUrl, type) {
    currentUrl = newUrl;
    setStoredUrl(newUrl);

    const detail = { oldUrl, newUrl, type };

    // 1. 派发全局 CustomEvent（方便直接 addEventListener）
    window.dispatchEvent(new CustomEvent('urlchange', { detail }));

    // 2. 调用所有注册回调
    listeners.forEach((fn) => {
        try {
            fn(detail);
        } catch (err) {
            console.error('[url-change-detector] listener error:', err);
        }
    });
}

/**
 * 检查当前 URL 是否发生变化
 * @param {ChangeType} [type='poll']
 */
function check(type = 'poll') {
    const url = location.href;
    if (url !== currentUrl) {
        emit(currentUrl, url, type);
    }
}

// --- History API 劫持 ---

/**
 * 劫持 history 方法（pushState / replaceState）
 * @param {string} methodName
 * @param {ChangeType} eventType
 */
function hijack(methodName, eventType) {
    const symbolKey = Symbol.for(`url_change_detector_${methodName}`);

    // 防止重复劫持（比如多个库或 content script 多次注入）
    if (history[symbolKey]) return;

    const original = history[methodName];
    history[symbolKey] = original;

    history[methodName] = function (...args) {
        const before = location.href;
        original.apply(this, args);
        const after = location.href;

        // 只有 URL 真正变化时才触发
        if (after !== before) {
            emit(before, after, eventType);
        }
    };
}

// --- 初始化：页面加载/刷新检测 ---

function init() {
    const stored = getStoredUrl();
    const now = location.href;

    if (!stored) {
        // 情况 1：新标签页 / 首次打开
        currentUrl = now;
        setStoredUrl(now);
        emit('', now, 'load');
    } else if (stored !== now) {
        // 情况 2：从其他页面导航过来（非刷新，URL 变了）
        currentUrl = now;
        emit(stored, now, 'load');
    } else if (isPageReload()) {
        // 情况 3：页面刷新，URL 相同
        currentUrl = now;
        emit(stored, now, 'refresh');
    } else if (isBackForwardNavigation()) {
        // 情况 4：通过前进/后退按钮加载新页面（非 SPA）
        // 这种情况通常 popstate 已经处理，但非 SPA 时页面会重新加载
        currentUrl = now;
        setStoredUrl(now);
        // 不重复触发，因为 popstate 在页面加载后会再触发一次
    } else {
        // 其他情况：直接记录
        currentUrl = now;
        setStoredUrl(now);
    }

    // 劫持 SPA 路由方法
    hijack('pushState', 'push');
    hijack('replaceState', 'replace');

    // 监听浏览器事件
    window.addEventListener('popstate', () => check('pop'));
    window.addEventListener('hashchange', () => check('hash'));

    // 轮询兜底（防止直接修改 location.href 等遗漏）
    setInterval(() => check('poll'), 2000);
}

// 确保只初始化一次（防止 content script 热重载或重复注入）
if (!window[INIT_FLAG]) {
    window[INIT_FLAG] = true;
    init();
}

// --- 导出 API ---

/**
 * 订阅 URL 变化
 * @param {(detail: UrlChangeDetail) => void} callback
 * @returns {() => void} 取消订阅函数
 */
export function onUrlChange(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

/**
 * 手动触发一次检查
 */
export function checkNow() {
    check('manual');
}

/**
 * 获取当前 URL
 */
export function getCurrentUrl() {
    return location.href;
}

/**
 * 获取上一次记录的非当前 URL（如果从未变化则返回空字符串）
 */
export function getLastUrl() {
    return currentUrl;
}

/**
 * 获取存储的上一个 URL（可能来自页面刷新前）
 */
export function getStoredPreviousUrl() {
    return getStoredUrl();
}

/**
 * 获取检测器内部状态（调试用）
 */
export function getDetectorState() {
    return {
        currentUrl,
        storedUrl: getStoredUrl(),
        listenerCount: listeners.size,
    };
}
