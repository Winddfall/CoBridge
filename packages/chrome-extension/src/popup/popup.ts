// Popup 入口
// 职责：初始化各功能模块

import { initLangToggle, applyLang, getCurrentLang } from './i18n';
import { initTheme } from './theme';
import { initSync } from './sync';
import { initSearch } from './search';

// 初始化语言和主题（立即执行，不等 DOMContentLoaded）
initTheme();
applyLang(getCurrentLang());
initLangToggle(() => {
    // 语言切换后，主题标题也需要更新（已在 theme 内部处理）
});

// 等待 DOM 就绪后初始化交互功能
document.addEventListener('DOMContentLoaded', async () => {
    await initSync();
    initSearch();
});
