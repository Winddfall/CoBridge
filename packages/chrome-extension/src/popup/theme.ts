// 深色模式模块

import { t } from './i18n';

let isDark: boolean;
const iconSun = document.getElementById('icon-sun')!;
const iconMoon = document.getElementById('icon-moon')!;
const darkModeToggle = document.getElementById('darkModeToggle')!;

function getInitialDark(): boolean {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

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

/** 初始化主题（立即应用 + 绑定切换事件） */
export function initTheme() {
    isDark = getInitialDark();
    applyTheme(isDark);

    // 跟随系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
        if (localStorage.getItem('darkMode') === null) {
            applyTheme(e.matches);
        }
    });

    // 切换按钮（带动画）
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
}
