/**
 * 跳转到对话并滚动定位
 */
export async function handleNavigateToTurn(request: any) {
    const { url, userMessage, turnIndex, messageId } = request;
    const MAX_RETRIES = 10;
    const RETRY_DELAY = 1500;

    const findAndScroll = async (tabId: number, attempt = 1): Promise<void> => {
        try {
            // 向 content script 发送滚动请求，返回 { found: boolean }
            const response = await chrome.tabs.sendMessage(tabId, {
                action: 'cobridge.scrollToTurn',
                userMessage,
                turnIndex,
                messageId,
            });

            if (response?.found) {
                console.log('[CoBridge] 滚动定位成功，第', attempt, '次尝试');
                return;
            }

            // content script 已响应但没找到元素（SPA 还在渲染），继续重试
            if (attempt < MAX_RETRIES) {
                console.log('[CoBridge] 元素未就绪，等待重试...', attempt, '/', MAX_RETRIES);
                setTimeout(() => findAndScroll(tabId, attempt + 1), RETRY_DELAY);
            } else {
                console.warn('[CoBridge] 达到最大重试次数，放弃滚动定位');
            }
        } catch {
            // content script 还没加载（连接失败），继续重试
            if (attempt < MAX_RETRIES) {
                console.log('[CoBridge] content script 未就绪，等待重试...', attempt, '/', MAX_RETRIES);
                setTimeout(() => findAndScroll(tabId, attempt + 1), RETRY_DELAY);
            } else {
                console.warn('[CoBridge] content script 始终未就绪，放弃');
            }
        }
    };

    // 创建新标签页并等待页面框架加载完成后开始轮询
    const tab = await chrome.tabs.create({ url });
    if (!tab.id) return { newTab: false };

    const tabId = tab.id;

    // 等待页面框架加载完成后开始第一次尝试
    chrome.tabs.onUpdated.addListener(function listener (updatedTabId, changeInfo) {
        if (updatedTabId === tabId && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener);
            setTimeout(() => findAndScroll(tabId), 1500);
        }
    });

    return { newTab: true };
}
