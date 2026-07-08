/**
 * 跳转到对话并滚动定位
 */
export async function handleNavigateToTurn(request: any) {
    const { url, userMessage, turnIndex, messageId } = request;
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 1000;

    const tryScroll = async (tabId: number, attempt = 1) => {
        // background 不能操纵dom，向新标签页的 content script 发送滚动请求
        await chrome.tabs.sendMessage(
            tabId,
            {
                action: 'cobridge.scrollToTurn',
                userMessage,
                turnIndex,
                messageId,
            },
        );
        if (chrome.runtime.lastError) {
            // content script 还没加载，重试
            if (attempt < MAX_RETRIES) {
                setTimeout(() => tryScroll(tabId, attempt + 1), RETRY_DELAY);
            }
            return;
        }
    }

    // 根据 url 创建新标签页
    chrome.tabs.create({ url }, (tab) => {
        // 校验标签页是否创建成功
        if (!tab.id)  return { newTab: false };
        // 监听标签页加载完成事件
        const listener = (tabId: number, changeInfo: chrome.tabs.OnUpdatedInfo) => {
            if (tabId === tab.id && changeInfo.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);
                // 1秒后执行滚动
                setTimeout(() => tryScroll(tabId), 500);
            }
        };
        chrome.tabs.onUpdated.addListener(listener);
        return { newTab: true };
    });
}