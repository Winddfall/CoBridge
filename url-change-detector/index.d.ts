/**
 * URL 变化类型
 *
 * - `load`:   页面首次加载 / 从其他页面导航过来
 * - `refresh`: 页面刷新（F5 / 刷新按钮，URL 未变）
 * - `push`:    SPA 通过 history.pushState 改变 URL
 * - `replace`: SPA 通过 history.replaceState 改变 URL
 * - `pop`:     浏览器前进 / 后退按钮
 * - `hash`:    URL hash 部分变化（如 #/xxx）
 * - `poll`:    轮询检测到（如直接修改 location.href）
 * - `manual`:  手动调用 checkNow() 触发
 */
export type ChangeType = 'load' | 'refresh' | 'push' | 'replace' | 'pop' | 'hash' | 'poll' | 'manual';

/**
 * URL 变化事件详情
 */
export interface UrlChangeDetail {
    /** 变化前的 URL */
    oldUrl: string;
    /** 变化后的 URL */
    newUrl: string;
    /** 变化类型 */
    type: ChangeType;
}

/**
 * 订阅 URL 变化事件
 *
 * @param callback - 收到变化通知时执行的回调
 * @returns 取消订阅函数，调用即可移除监听
 *
 * @example
 * ```ts
 * const unsubscribe = onUrlChange(({ oldUrl, newUrl, type }) => {
 *   console.log(`URL ${type}: ${oldUrl} -> ${newUrl}`);
 * });
 *
 * // 取消监听
 * unsubscribe();
 * ```
 */
export function onUrlChange(callback: (detail: UrlChangeDetail) => void): () => void;

/**
 * 手动触发一次 URL 检查
 *
 * 如果当前 URL 与上一次记录的不同，会触发 'manual' 类型的变化事件。
 */
export function checkNow(): void;

/**
 * 获取当前浏览器地址栏 URL
 */
export function getCurrentUrl(): string;

/**
 * 获取检测器内部记录的上一个 URL
 *
 * 注意：这是检测器自己维护的当前 URL 缓存，可能与 getStoredPreviousUrl() 不同。
 */
export function getLastUrl(): string;

/**
 * 获取 sessionStorage 中保存的上一次 URL
 *
 * 用于页面刷新后仍然能知道刷新前的 URL。
 */
export function getStoredPreviousUrl(): string;

/**
 * 获取检测器内部状态（调试用）
 */
export function getDetectorState(): {
    currentUrl: string;
    storedUrl: string;
    listenerCount: number;
};

// --- 全局事件声明 ---

declare global {
    interface WindowEventMap {
        /**
         * URL 变化事件
         *
         * 除了通过 onUrlChange() 订阅，也可以直接用原生 addEventListener：
         *
         * @example
         * ```ts
         * window.addEventListener('urlchange', (e) => {
         *   const { oldUrl, newUrl, type } = e.detail;
         *   console.log(type, oldUrl, newUrl);
         * });
         * ```
         */
        urlchange: CustomEvent<UrlChangeDetail>;
    }
}

export {};
