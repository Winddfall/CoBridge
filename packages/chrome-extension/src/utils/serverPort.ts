// 从 storage 读取端口配置，默认 3030
export async function getServerUrl() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['contextSyncPort'], (result) => {
            const port = result.contextSyncPort || 3030;
            resolve(`http://127.0.0.1:${port}/sync`);
        });
    });
}