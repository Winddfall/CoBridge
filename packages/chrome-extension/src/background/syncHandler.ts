// 同步上下文到本地 Agent

export function handleSyncToAgent(request: any, sendResponse: (response: any) => void) {
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
}

export function handleCheckSyncStatus(request: any, sendResponse: (response: any) => void) {
    const { url, timeout } = request;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout || 500);

    fetch(url, { method: 'GET', signal: controller.signal })
        .then(() => { clearTimeout(timer); sendResponse({ ok: true }); })
        .catch(() => { clearTimeout(timer); sendResponse({ ok: false }); });
}
