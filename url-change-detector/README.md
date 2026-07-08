# url-change-detector

一个全能的浏览器 URL 变化检测工具，覆盖 SPA 路由、页面刷新、标签页首次加载等所有场景。

## 为什么需要它

现代浏览器原生不提供统一的 URL 变化事件：

- `history.pushState` / `history.replaceState` **不触发任何事件**
- `popstate` 只在前进/后退时触发
- `hashchange` 只对 hash 路由有效
- 页面刷新后 content script 重新注入，需要重新识别状态

这个库把以上所有漏洞补上，提供一个**统一的事件入口**。

## 安装

```bash
npm install url-change-detector
```

## 使用

### 1. 回调方式（推荐）

```javascript
import { onUrlChange } from 'url-change-detector';

const unsubscribe = onUrlChange(({ oldUrl, newUrl, type }) => {
  console.log(`[${type}] ${oldUrl} -> ${newUrl}`);
});

// 取消监听
unsubscribe();
```

### 2. 全局事件方式

```javascript
window.addEventListener('urlchange', (e) => {
  const { oldUrl, newUrl, type } = e.detail;
  console.log(type, oldUrl, newUrl);
});
```

### 3. 手动触发检查

```javascript
import { checkNow } from 'url-change-detector';

checkNow(); // 触发一次 poll，如果 URL 变了会收到事件
```

## 检测场景覆盖

| 场景 | 变化类型 | 检测方式 |
|------|---------|---------|
| 新标签页 / 首次打开 | `load` | 初始化时检查 sessionStorage 为空 |
| 从其他页面跳转过来 | `load` | 初始化时对比 sessionStorage 与当前 URL |
| 页面刷新（F5 / 刷新按钮） | `refresh` | `performance.getEntriesByType('navigation')` + sessionStorage |
| SPA 路由切换（pushState） | `push` | 劫持 `history.pushState` |
| SPA 参数替换（replaceState） | `replace` | 劫持 `history.replaceState` |
| 浏览器前进 / 后退 | `pop` | 监听 `popstate` 事件 |
| hash 路由变化 | `hash` | 监听 `hashchange` 事件 |
| 直接修改 `location.href` | `poll` | 2 秒轮询兜底 |
| 手动调用 `checkNow()` | `manual` | 立即执行检查 |

## 浏览器环境

- 仅支持浏览器环境（依赖 `window`、`history`、`sessionStorage`）
- 支持 Chrome 扩展 content script 使用
- TypeScript 类型已内置

## 原理简述

1. **劫持 History API**：重写 `history.pushState` / `replaceState`，在调用前后对比 URL，有变化则触发事件。
2. **监听原生事件**：`popstate`（前进/后退）、`hashchange`（hash 路由）。
3. **轮询兜底**：`setInterval` 每 2 秒检查一次，防止 `location.href = xxx` 等硬跳转被遗漏。
4. **sessionStorage 持久化**：记录上一个 URL，使得页面刷新后仍能知道刷新前的地址，从而触发 `refresh` 事件。
5. **Performance API**：利用 `PerformanceNavigationTiming.type` 判断当前加载是刷新、前进/后退还是正常导航。

## 许可证

MIT
