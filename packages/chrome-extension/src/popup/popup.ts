// ── i18n ──────────────────────────────────────────────────────
type Lang = 'en' | 'zh_CN' | 'zh_TW' | 'ja' | 'ko' | 'fr' | 'pt' | 'ru';

const SUPPORTED_LANGS: Lang[] = ['en', 'zh_CN', 'zh_TW', 'ja', 'ko', 'fr', 'pt', 'ru'];

// Import locale files directly so we can switch languages at runtime.
// chrome.i18n.getMessage() is locked to the browser UI language and cannot
// be overridden, so we need our own lookup on the same JSON data.
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

/** Map browser language codes to our supported languages */
function matchBrowserLang(browserLang: string): Lang {
    const lower = browserLang.toLowerCase();
    // Traditional Chinese: zh-tw, zh-hant, zh-hk, zh-mo
    if (lower.startsWith('zh-tw') || lower.startsWith('zh-hant') || lower.startsWith('zh-hk') || lower.startsWith('zh-mo')) return 'zh_TW';
    // Simplified Chinese: zh, zh-cn, zh-hans, zh-sg
    if (lower.startsWith('zh')) return 'zh_CN';
    for (const lang of SUPPORTED_LANGS) {
        if (lang.startsWith('zh')) continue; // already handled above
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

/** Get translated text for the current language (falls back to English, then key) */
function t(key: string): string {
    return LOCALES[currentLang]?.[key]?.message ?? LOCALES['en']?.[key]?.message ?? key;
}

function applyLang(lang: Lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    // Apply text content from data-i18n attributes
    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
        const key = el.dataset.i18n!;
        const msg = t(key);
        if (msg) el.textContent = msg;
    });

    // Apply title attributes from data-i18n-title attributes
    document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((el) => {
        const key = el.dataset.i18nTitle!;
        const msg = t(key);
        if (msg) el.title = msg;
    });

    // Re-render dynamic connection status in the new language
    const statusText = document.getElementById('status-text');
    if (statusText) statusText.textContent = t(connectionKey);

    // Re-render dynamic status message in the new language
    if (statusKey) {
        const status = document.getElementById('status');
        if (status) status.textContent = t(statusKey);
    }

    updateDarkModeTitle();
}

const langToggle = document.getElementById('langToggle')!;
langToggle.addEventListener('click', () => {
    const idx = SUPPORTED_LANGS.indexOf(currentLang);
    const next = SUPPORTED_LANGS[(idx + 1) % SUPPORTED_LANGS.length];
    applyLang(next);
});

// ── Dark Mode ────────────────────────────────────────────────
const darkModeToggle = document.getElementById('darkModeToggle')!;
const iconSun = document.getElementById('icon-sun')!;
const iconMoon = document.getElementById('icon-moon')!;

function getInitialDark(): boolean {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

let isDark = getInitialDark();

function updateDarkModeTitle() {
    darkModeToggle.title = isDark ? t('lightTitle') : t('darkTitle');
}

function applyTheme(dark: boolean) {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('darkMode', String(dark));
    isDark = dark;
    if (isDark) {
        iconSun.style.display = '';
        iconMoon.style.display = 'none';
    } else {
        iconSun.style.display = 'none';
        iconMoon.style.display = '';
    }
    updateDarkModeTitle();
}

applyTheme(isDark);
applyLang(currentLang);

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addEventListener('change', (e) => {
    if (localStorage.getItem('darkMode') === null) {
        applyTheme(e.matches);
    }
});

darkModeToggle.addEventListener('click', (event: MouseEvent) => {
    const newIsDark = !isDark;

    const startViewTransition = (
        document as { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }
    ).startViewTransition;

    if (
        !startViewTransition ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
        applyTheme(newIsDark);
        return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
    );

    const transition = startViewTransition.call(document, () => applyTheme(newIsDark));

    transition.ready.then(() => {
        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${endRadius}px at ${x}px ${y}px)`,
                ],
            },
            {
                duration: 500,
                easing: 'ease-in-out',
                pseudoElement: '::view-transition-new(root)',
            },
        );
    });
});

// ── Page Logic ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    const syncBtn = document.getElementById('syncBtn') as HTMLInputElement;
    const status = document.getElementById('status')!;
    const tip = document.getElementById('tip');
    const statusIndicator = document.getElementById('status-indicator')!;
    const statusText = document.getElementById('status-text')!;
    const portInput = document.getElementById('portInput') as HTMLInputElement;

    const DEFAULT_PORT = 3030;

    const stored = await chrome.storage.sync.get('contextSyncPort');
    let currentPort = String(stored.contextSyncPort || DEFAULT_PORT);
    portInput.value = currentPort;

    function baseUrl() {
        return `http://127.0.0.1:${currentPort}`;
    }

    function setStatus(key: string | null, color?: string) {
        statusKey = key;
        status.textContent = key ? t(key) : '';
        if (color) status.style.color = color;
    }

    function setConnection(key: 'agentOnline' | 'agentOffline') {
        connectionKey = key;
        statusText.textContent = t(key);
        statusIndicator.className = key === 'agentOnline' ? 'status-online' : 'status-offline';
    }

    async function checkConnection() {
        try {
            const controller = new AbortController();
            setTimeout(() => controller.abort(), 1000);

            await fetch(`${baseUrl()}/sync`, {
                method: 'GET',
                signal: controller.signal
            });

            setConnection('agentOnline');
            syncBtn.disabled = false;
            if (statusKey === 'startCoBridge') {
                setStatus(null);
            }
        } catch (err) {
            setConnection('agentOffline');
            syncBtn.disabled = true;
            setStatus('startCoBridge');
        }
    }

    await checkConnection();

    let portChangeTimer: any = null;

    portInput.addEventListener('input', () => {
        clearTimeout(portChangeTimer);
        portChangeTimer = setTimeout(async () => {
            const raw = parseInt(portInput.value, 10);
            if (!raw || raw < 1 || raw > 65535) return;
            if (raw === Number(currentPort)) return;

            currentPort = String(raw);
            await chrome.storage.sync.set({ contextSyncPort: currentPort });
            await checkConnection();
        }, 500);
    });

    syncBtn.addEventListener('click', async () => {
        setStatus('capturing', 'var(--muted-foreground)');
        syncBtn.disabled = true;

        if (tip) tip.style.display = 'none';

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (
                !tab ||
                !tab.id ||
                !tab.url ||
                (
                    !tab.url.includes('gemini.google.com') &&
                    !tab.url.includes('chatgpt.com') &&
                    !tab.url.includes('claude.ai') &&
                    !tab.url.includes('www.doubao.com') &&
                    !tab.url.includes('chat.deepseek.com')
                )
            ) {
                throw new Error(t('unsupportedSite'));
            }

            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'sync_to_agent'
            });

            if (response.status === 'success') {
                setStatus('syncSuccess', 'oklch(0.55 0.17 155)');
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            const rawMessage = err instanceof Error ? err.message : String(err);
            // Map known error strings to i18n keys
            const errorMap: Record<string, string> = {
                'Agent not responding.': 'agentNotResponding',
            };
            const errorKey = errorMap[rawMessage];
            const errorMessage = errorKey ? t(errorKey) : rawMessage;
            statusKey = null;
            status.textContent = `❌ ${errorMessage}`;
            status.style.color = 'var(--destructive)';
        } finally {
            syncBtn.disabled = false;
        }
    });
});
