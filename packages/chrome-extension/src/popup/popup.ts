// Popup 入口
// 职责：初始化各功能模块

import { initLangToggle, applyLang, getCurrentLang } from './i18n';
import { initTheme } from './theme';
import { initSync } from './sync';
import { initSearch } from './search';

// 初始化语言和主题（立即执行，不等 DOMContentLoaded）
initTheme();
applyLang(getCurrentLang());
initLangToggle();
console.log('初始化语言和主题完成！');

// 等待 DOM 就绪后初始化交互功能
async function init() {
    await initSync();
    await initSearch();
    console.log('所有功能模块初始化完成！');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
