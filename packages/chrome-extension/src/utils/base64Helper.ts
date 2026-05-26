// 将图片 URL 转换为 Base64（支持 blob URL、Google 高清原图、多策略抓取）
export async function getBase64Safe(url: string): Promise<string | null> {
    if (!url || url === 'about:blank') return null;

    // blob URL：直接 fetch 并转 Base64
    if (url.startsWith('blob:')) {
        try {
            const resp = await fetch(url);
            const blob = await resp.blob();
            return new Promise<string | null>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = () => {
                    console.error('[ContextSync] FileReader error for blob');
                    resolve(null);
                };
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.error('[ContextSync] Failed to fetch blob URL:', e);
            return null;
        }
    }

    // Google 图片：请求原图 (=s0)
    let targetUrl = url;
    const isGoogleImage = url.includes('googleusercontent.com') || url.includes('ggpht.com');

    if (isGoogleImage) {
        // rd-gg → rd-gg-dl 以获取更高分辨率
        if (targetUrl.includes('/rd-gg/')) {
            targetUrl = targetUrl.replace('/rd-gg/', '/rd-gg-dl/');
        }
        // 请求原始尺寸 (=s0)
        if (targetUrl.match(/=[swh]\d+/)) {
            targetUrl = targetUrl.replace(/=[swh]\d+[^?#]*/, '=s0');
        } else if (!targetUrl.includes('=s0')) {
            if (targetUrl.includes('=')) {
                targetUrl += '-s0';
            } else {
                targetUrl += '=s0';
            }
        }
    }

    // 策略 1：直接 fetch（带 credentials）
    const fetchToBlob = async (fetchUrl: string) => {
        try {
            const resp = await fetch(fetchUrl, { credentials: 'include', mode: 'cors' });
            if (resp.ok) return await resp.blob();
        } catch { /* ignore */ }

        try {
            const resp = await fetch(fetchUrl, { credentials: 'omit', mode: 'cors' });
            if (resp.ok) return await resp.blob();
        } catch (e) {
            console.error('[ContextSync] Image fetch failed (direct):', e);
        }
        return null;
    };

    try {
        const blob = await fetchToBlob(targetUrl);
        if (blob) {
            return new Promise<string | null>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(blob);
            });
        }
    } catch (e) {
        console.warn('[ContextSync] Direct fetch exception:', e);
    }

    // 策略 2：通过后台 Service Worker 抓取
    return new Promise<string | null>((resolve) => {
        chrome.runtime.sendMessage({ action: "fetchImage", url: targetUrl }, (response) => {
            if (response && response.success) {
                resolve(response.data);
            } else {
                console.error("[ContextSync] Image fetch failed (all methods):", targetUrl);
                resolve(null);
            }
        });
    });
}