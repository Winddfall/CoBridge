import { getBase64Safe, getServerUrl, convertTableToMarkdown } from "../utils";

declare global {
    interface Window {
        COBRIDGE?: boolean;
    }
}

// 定义适配器配置类型
interface AdapterConfig {
  user_selector: string;
  ai_selector: string;
}

// 定义整个适配器字典类型（必须包含 default）
interface Adapters {
    default: AdapterConfig;  // 你的函数需要 fallback 默认值
    [host: string]: AdapterConfig; // 其他域名 key
}

// 适配器逻辑：存储不同 AI 网页的元素选择规则
const ADAPTERS: Adapters = {
    default: {
        user_selector: '',
        ai_selector: ''
    },
    // gemini
    'gemini': {
        user_selector: 'div.user-query-container',
        ai_selector: '.response-content'
    },
    // deepseek
    'deepseek': {
        user_selector: '.ds-message',
        ai_selector: '.ds-message'
    },
    // claude
    'claude': {
        user_selector: 'div[class="contents"]',
        ai_selector: 'div[class="contents"]'
    },
    // chatgpt
    'chatgpt': {
        user_selector: '[data-message-author-role="user"]',
        ai_selector: '[data-message-author-role="assistant"]'
    },
    // doubao
    'doubao': {
        user_selector: 'div[data-message-id]',
        ai_selector: 'div[data-message-id]'
    },
};

// 检查脚本是不是第一次注入
if (typeof window.COBRIDGE === 'undefined') {
    window.COBRIDGE = true;

    // 向浏览器控制台打印日志
    console.log('🚀 CoBridge Extension Active');

    // 添加监听器，监听来自 Popup 的消息
    // chrome.runtime.onMessage.addListener 属于扩展跨组件消息监听
    // request 是消息本身
    // sendResponse 是 Chrome 提前定义好的回调函数，直接使用即可
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "sync_to_agent") {
            // 抓取上下文并同步
            captureDialogue().then(data => {
                console.log('Captured data:', data);
                return syncToAgent(data);
            }).then(res => {
                sendResponse({ status: "success", data: res }); // 返回同步结果给 Popup
            }).catch(err => {
                console.error('Sync failed:', err);
                sendResponse({ status: "error", message: err.message || err.toString() });
            });
            return true; // 保持消息通道打开，以便异步发送响应
        }
    });
}

async function captureDialogue(): Promise<any[]> {
    // 模糊匹配规则：网页域名中有 AI 的名字则匹配
    const getMatchedAdapter = (host: string, adapter: Adapters) => {
        for (const key of Object.keys(adapter)) {
            if (host.includes(key)) {
                console.log('matched adapter:', key);
                return { AIname: key, adapter: adapter[key] };
            }
        }
        return { AIname: 'default', adapter: adapter['default'] };
    };

    // 网页域名
    const host = window.location.hostname; 
    // 确定消息容器的规则
    const { AIname, adapter } = getMatchedAdapter(host, ADAPTERS);

    let queries: HTMLElement[] = [];
    let responses: HTMLElement[] = [];
    let messages: HTMLElement[] = [];

    // 提取消息容器
    const getNodes = () => {
        switch (AIname) {
            case 'gemini':
            case 'chatgpt':
                // 需要分别提取用户和 AI 的消息容器
                queries = Array.from(document.querySelectorAll<HTMLElement>(adapter.user_selector));
                responses = Array.from(document.querySelectorAll<HTMLElement>(adapter.ai_selector));
                break;
            case 'doubao':
            case 'claude':
            case 'deepseek':
                // 一次性提取所有消息
                messages = Array.from(document.querySelectorAll<HTMLElement>(adapter.user_selector));  
                break;
        }
    };
    getNodes();

    console.log(`Found ${queries.length} queries and ${responses.length} responses.`);

    // 从容器中提取元素。容器中包含图片、文本
    const extractNodeInfo = async (el: HTMLElement, forceRole: string) => {
        // 克隆容器以避免修改页面显示
        const clone = el.cloneNode(true) as HTMLElement;

        // 处理表格：转换为 Markdown
        const tables = Array.from(clone.querySelectorAll('table')).reverse();
        tables.forEach(table => {
            const md = convertTableToMarkdown(table);
            table.replaceWith(document.createTextNode(md));
        });

        // 处理图片：获取所有图片 URL 并转换为 Base64 数组（覆盖多种 AI 平台图片容器）
        let imgBase64List: string[] = [];
        const imageSelectors = [
            'user-query-file-preview img',
            '.preview-image',
            'generated-image img',
            'single-image img',
            '.attachment-container.generated-images img',
            'picture source[type="image/avif"]', // 豆包
            'img' // gpt、claude
        ].join(',');
        const imgElements = clone.querySelectorAll(imageSelectors) as NodeListOf<HTMLImageElement>;
        if (imgElements.length > 0) {
            console.log(`Found ${imgElements.length} image(s)`);
            for (const imgEl of imgElements) {
                let src = imgEl.getAttribute('src') || imgEl.src || '';
                if (!src || src === 'about:blank') continue;

                // 相对路径转绝对路径
                if (src.startsWith('/')) {
                    src = window.location.origin + src;
                }

                console.log('Found image URL:', src);
                try {
                    const base64 = await getBase64Safe(src);
                    if (base64) {
                        imgBase64List.push(base64);
                        console.log('Converted to Base64 (length):', base64.length);
                    }
                } catch (e) {
                    console.warn('[ContextSync] Failed to process image, skipping:', src, e);
                }
            }
            console.log(`Successfully converted ${imgBase64List.length} image(s) to Base64`);
        }

        // 提取文本
        // 某些 AI 平台前端会有一些隐藏文本，直接用 innerText 不干净，因此需要再筛选一次
        const textSelectors = [
            '[data-testid="collapsible-user-message-content"]', // chatgpt
            '[data-testid="user-message"]'
        ].join(',');
        const textElements = clone.querySelectorAll(textSelectors) as NodeListOf<HTMLElement>;
        let text = textElements.length > 0 ? textElements[0].innerText : clone.innerText;
        text = text.trim();
        if (text.length < 1 && imgBase64List.length === 0) return null;

        // 转义 HTML 特殊字符，防止 Markdown 误渲染
        text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // 恢复表格中的换行符 (将占位符 ___BR___ 还原为 <br>)
        text = text.replace(/___BR___/g, '<br>');

        // 记录节点信息
        return {
            url: host,
            className: el.className,
            images: imgBase64List, // 图片 Base64 数据数组（支持多张图片）
            text: text, // 文本
            is_ai_likely: forceRole === 'assistant',
            is_user_likely: forceRole === 'user',
        };
    };

    const buildConversation = async () => {
        let conversation: any[] = [];
        switch (AIname) {
            case 'gemini':
            case 'chatgpt':     
                // 遍历消息容器，交替写入
                for (let i = 0; i < queries.length; i++) {
                    // 用户
                    console.log('query:', queries[i]);
                    const query = await extractNodeInfo(queries[i], 'user');
                    if (query)   conversation.push(query);
                    // AI
                    console.log('response:', responses[i]);
                    const response = await extractNodeInfo(responses[i], 'assistant');
                    if (response)   conversation.push(response);
                }
                break;
            case 'doubao':   
            case 'claude':
            case 'deepseek':
                // 豆包是一次性抓取所有消息，再交替写入
                for (let i = 0; i < messages.length; i++) {
                    if (i % 2 === 0) {
                        // 用户
                        console.log('query:', messages[i]);
                        const query = await extractNodeInfo(messages[i], 'user');
                        if (query)   conversation.push(query);
                    } else {
                        // AI
                        console.log('response:', messages[i]);
                        const response = await extractNodeInfo(messages[i], 'assistant');
                        if (response)   conversation.push(response);
                    }
                }
                break;
            default:
                return [];
        }
        return conversation;
    };

    return buildConversation();
}

// 同步到 Agent（通过后台 Service Worker 转发，避免 CORS 限制）
async function syncToAgent(data: any[]) {
    console.log('📡 Syncing to Agent via background...', data);
    const url = await getServerUrl();
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: 'gv.syncToAgent', url, data }, (response) => {
            if (response && response.ok) {
                resolve(response.data);
            } else {
                reject(new Error(response?.error || 'Agent not responding.'));
            }
        });
    });
}