// ── i18n ──────────────────────────────────────────────────────
type Lang = 'en' | 'zh';

const i18n: Record<Lang, Record<string, string>> = {
    en: {
        portLabel: 'Port',
        syncBtn: 'Sync Context to Agent',
        tip: 'For long conversations, please scroll up to ensure all context is loaded.',
        agentOnline: 'Agent Online',
        agentOffline: 'Agent Offline',
        startCoBridge: 'Please start CoBridge in Agent',
        capturing: '⏳ Capturing dialogue...',
        syncSuccess: '✅ Sync successfully!',
        unsupportedSite: 'Please use this on Supported AI websites.',
        darkTitle: 'Switch to dark mode',
        lightTitle: 'Switch to light mode',
        langTitle: '切换为中文',
    },
    zh: {
        portLabel: '服务端口',
        syncBtn: '同步上下文至 Agent',
        tip: '长对话请向上滑动以确保加载所有上下文',
        agentOnline: 'Agent 在线',
        agentOffline: 'Agent 离线',
        startCoBridge: '请在 Agent 中启动 CoBridge',
        capturing: '⏳ 正在捕获对话...',
        syncSuccess: '✅ 同步成功！',
        unsupportedSite: '请在支持的 AI 网站上使用',
        darkTitle: '切换为深色模式',
        lightTitle: '切换为浅色模式',
        langTitle: 'Switch to English',
    },
};

function getInitialLang(): Lang {
    const saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'zh') return saved;
    return navigator.language.startsWith('zh') ? 'zh' : 'en';
}

let currentLang: Lang = getInitialLang();
let statusKey: string | null = null;
let connectionKey: 'agentOnline' | 'agentOffline' = 'agentOffline';

function applyLang(lang: Lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
        const key = el.dataset.i18n!;
        if (i18n[lang][key]) el.textContent = i18n[lang][key];
    });

    // Re-render dynamic connection status in the new language
    const statusText = document.getElementById('status-text');
    if (statusText) statusText.textContent = i18n[lang][connectionKey];

    // Re-render dynamic status message in the new language
    if (statusKey && i18n[lang][statusKey]) {
        const status = document.getElementById('status');
        if (status) status.textContent = i18n[lang][statusKey];
    }

    langToggle.title = i18n[lang].langTitle;
    updateDarkModeTitle();
}

const langToggle = document.getElementById('langToggle')!;
langToggle.addEventListener('click', () => {
    applyLang(currentLang === 'en' ? 'zh' : 'en');
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
    darkModeToggle.title = isDark ? i18n[currentLang].lightTitle : i18n[currentLang].darkTitle;
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
        status.textContent = key ? i18n[currentLang][key] : '';
        if (color) status.style.color = color;
    }

    function setConnection(key: 'agentOnline' | 'agentOffline') {
        connectionKey = key;
        statusText.textContent = i18n[currentLang][key];
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
                throw new Error(i18n[currentLang].unsupportedSite);
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
            const errorMessage = err instanceof Error ? err.message : String(err);
            statusKey = null;
            status.textContent = `❌ ${errorMessage}`;
            status.style.color = 'var(--destructive)';
        } finally {
            syncBtn.disabled = false;
        }
    });
});
