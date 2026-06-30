// 同步按钮逻辑：端口配置、连接检测、上下文同步

import { t, setStatusKey, setConnectionKey } from './i18n';

const DEFAULT_PORT = 3030;

export async function initSync() {
    const syncBtn = document.getElementById('syncBtn') as HTMLInputElement;
    const status = document.getElementById('status')!;
    const tip = document.getElementById('tip');
    const statusIndicator = document.getElementById('status-indicator')!;
    const statusText = document.getElementById('status-text')!;
    const portInput = document.getElementById('portInput') as HTMLInputElement;

    const stored = await chrome.storage.sync.get('contextSyncPort');
    let currentPort = String(stored.contextSyncPort || DEFAULT_PORT);
    portInput.value = currentPort;

    function baseUrl() {
        return `http://127.0.0.1:${currentPort}`;
    }

    function setStatus(key: string | null, color?: string) {
        setStatusKey(key);
        status.textContent = key ? t(key) : '';
        if (color) status.style.color = color;
    }

    function setConnection(key: 'agentOnline' | 'agentOffline') {
        setConnectionKey(key);
        statusText.textContent = t(key);
        statusIndicator.className = key === 'agentOnline' ? 'status-online' : 'status-offline';
    }

    async function checkConnection() {
        try {
            const controller = new AbortController();
            setTimeout(() => controller.abort(), 1000);

            await fetch(`${baseUrl()}/sync`, {
                method: 'GET',
                signal: controller.signal
            });

            setConnection('agentOnline');
            syncBtn.disabled = false;
        } catch (err) {
            setConnection('agentOffline');
            syncBtn.disabled = true;
            setStatus('startCoBridge');
        }
    }

    await checkConnection();

    // 端口变更
    let portChangeTimer: any = null;
    portInput.addEventListener('input', () => {
        clearTimeout(portChangeTimer);
        portChangeTimer = setTimeout(async () => {
            const raw = parseInt(portInput.value, 10);
            if (!raw || raw < 1 || raw > 65535) return;
            if (raw === Number(currentPort)) return;

            currentPort = String(raw);
            await chrome.storage.sync.set({ contextSyncPort: currentPort });
            await checkConnection();
        }, 500);
    });

    // 同步按钮
    syncBtn.addEventListener('click', async () => {
        setStatus('capturing', 'var(--muted-foreground)');
        syncBtn.disabled = true;

        if (tip) tip.style.display = 'none';

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (
                !tab ||
                !tab.id ||
                !tab.url ||
                (
                    !tab.url.includes('gemini.google.com') &&
                    !tab.url.includes('chatgpt.com') &&
                    !tab.url.includes('claude.ai') &&
                    !tab.url.includes('www.doubao.com')
                )
            ) {
                throw new Error(t('unsupportedSite'));
            }

            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'sync_to_agent'
            });

            if (response.status === 'success') {
                setStatus('syncSuccess', 'oklch(0.55 0.17 155)');
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            const rawMessage = err instanceof Error ? err.message : String(err);
            const errorMap: Record<string, string> = {
                'Agent not responding.': 'agentNotResponding',
            };
            const errorKey = errorMap[rawMessage];
            const errorMessage = errorKey ? t(errorKey) : rawMessage;
            setStatusKey(null);
            status.textContent = `❌ ${errorMessage}`;
            status.style.color = 'var(--destructive)';
        } finally {
            syncBtn.disabled = false;
        }
    });
}
