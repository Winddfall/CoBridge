// 抓取图片并转为 Base64（处理跨域和权限限制）

export function handleFetchImage(request: any, sendResponse: (response: any) => void) {
    fetch(request.url, {
        method: 'GET',
        credentials: 'include',  // Google 用户头像通常有访问权限限制
        redirect: 'follow',
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.blob();
    })
    .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => sendResponse({ success: true, data: reader.result });
        reader.onerror = () => sendResponse({ success: false, error: "Base64 conversion failed" });
        reader.readAsDataURL(blob);
    })
    .catch(err => {
        console.error("[CoBridge] Image fetch failed:", err);
        sendResponse({ success: false, error: err.message });
    });
}
