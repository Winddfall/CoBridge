chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "gv.syncToAgent") {
        const { url, data } = request;
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (!response.ok) throw new Error(`Server responded with ${response.status}`);
            return response.json();
        })
        .then(json => sendResponse({ ok: true, data: json }))
        .catch(err => sendResponse({ ok: false, error: err.message }));

        return true; // keep channel open for async response
    }

    if (request.type === "gv.checkSyncStatus") {
        const { url, timeout } = request;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout || 500);

        fetch(url, { method: 'GET', signal: controller.signal })
            .then(() => { clearTimeout(timer); sendResponse({ ok: true }); })
            .catch(() => { clearTimeout(timer); sendResponse({ ok: false }); });

        return true;
    }

    if (request.action === "fetchImage") {
        
        // 使用 Request 对象可以更精细地控制
        fetch(request.url, {
            method: 'GET',
            // 必须使用 include，因为 Google 用户头像通常有访问权限限制
            credentials: 'include',
            // 允许跟随重定向
            redirect: 'follow'
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
            console.error("抓取失败细节:", err);
            sendResponse({ success: false, error: err.message });
        });

        return true; 
    }
});