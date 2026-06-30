// 监听页面主世界通过 CustomEvent 桥接过来的 API 响应数据
// fetch hook 由 background 通过 chrome.scripting.executeScript 注入

const interceptedMessages: any[] = [];

document.addEventListener('__cobridge_fetch__', ((e: CustomEvent) => {
    const data = e.detail;
    let messages: any[] = [];
    if (Array.isArray(data)) {
        messages = data;
    } else if (data?.conversation_id || data?.id) {
        messages = [data];
    }
    if (messages.length > 0) {
        interceptedMessages.push(...messages);
        console.log('[CoBridge] Intercepted', messages.length, 'messages, total:', interceptedMessages.length);
    }
}) as EventListener);

// 暴露给 turnObserver 读取
(window as any).__cobridgeIntercepted = () => interceptedMessages.slice();
