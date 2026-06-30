// 国际化模块
// 自行管理语言切换，不依赖 chrome.i18n（它锁定为浏览器 UI 语言，无法运行时切换）

export type Lang = 'en' | 'zh_CN' | 'zh_TW' | 'ja' | 'ko' | 'fr' | 'pt' | 'ru';

const SUPPORTED_LANGS: Lang[] = ['en', 'zh_CN', 'zh_TW', 'ja', 'ko', 'fr', 'pt', 'ru'];

import enMessages from '../../_locales/en/messages.json';
import zhCNMessages from '../../_locales/zh_CN/messages.json';
import zhTWMessages from '../../_locales/zh_TW/messages.json';
import jaMessages from '../../_locales/ja/messages.json';
import koMessages from '../../_locales/ko/messages.json';
import frMessages from '../../_locales/fr/messages.json';
import ptMessages from '../../_locales/pt/messages.json';
import ruMessages from '../../_locales/ru/messages.json';

type MessageEntry = { message: string; description?: string };
type MessageBundle = Record<string, MessageEntry>;

const LOCALES: Record<Lang, MessageBundle> = {
    en: enMessages as MessageBundle,
    zh_CN: zhCNMessages as MessageBundle,
    zh_TW: zhTWMessages as MessageBundle,
    ja: jaMessages as MessageBundle,
    ko: koMessages as MessageBundle,
    fr: frMessages as MessageBundle,
    pt: ptMessages as MessageBundle,
    ru: ruMessages as MessageBundle,
};

function matchBrowserLang(browserLang: string): Lang {
    const lower = browserLang.toLowerCase();
    if (lower.startsWith('zh-tw') || lower.startsWith('zh-hant') || lower.startsWith('zh-hk') || lower.startsWith('zh-mo')) return 'zh_TW';
    if (lower.startsWith('zh')) return 'zh_CN';
    for (const lang of SUPPORTED_LANGS) {
        if (lang.startsWith('zh')) continue;
        if (lower === lang || lower.startsWith(lang + '-')) return lang;
    }
    return 'en';
}

function getInitialLang(): Lang {
    const saved = localStorage.getItem('lang');
    if (saved && SUPPORTED_LANGS.includes(saved as Lang)) return saved as Lang;
    return matchBrowserLang(navigator.language);
}

let currentLang: Lang = getInitialLang();
let statusKey: string | null = null;
let connectionKey: 'agentOnline' | 'agentOffline' = 'agentOffline';

/** 获取当前语言的翻译文本 */
export function t(key: string): string {
    return LOCALES[currentLang]?.[key]?.message ?? LOCALES['en']?.[key]?.message ?? key;
}

/** 获取当前语言 */
export function getCurrentLang(): Lang {
    return currentLang;
}

/** 设置动态状态 key（用于语言切换时重新渲染） */
export function setStatusKey(key: string | null) {
    statusKey = key;
}

/** 设置连接状态 key */
export function setConnectionKey(key: 'agentOnline' | 'agentOffline') {
    connectionKey = key;
}

/** 应用语言到 DOM */
export function applyLang(lang: Lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
        const key = el.dataset.i18n!;
        const msg = t(key);
        if (msg) el.textContent = msg;
    });

    document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((el) => {
        const key = el.dataset.i18nTitle!;
        const msg = t(key);
        if (msg) el.title = msg;
    });

    const statusText = document.getElementById('status-text');
    if (statusText) statusText.textContent = t(connectionKey);

    if (statusKey) {
        const status = document.getElementById('status');
        if (status) status.textContent = t(statusKey);
    }
}

/** 初始化语言切换按钮 */
export function initLangToggle(onLangChange?: () => void) {
    const langToggle = document.getElementById('langToggle')!;
    langToggle.addEventListener('click', () => {
        const idx = SUPPORTED_LANGS.indexOf(currentLang);
        const next = SUPPORTED_LANGS[(idx + 1) % SUPPORTED_LANGS.length];
        applyLang(next);
        onLangChange?.();
    });
}
