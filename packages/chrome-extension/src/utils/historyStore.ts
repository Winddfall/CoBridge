// 对话历史存储：管理 chrome.storage.local 中的数据

// 对话存储对象
export interface ConversationTurn {
    id: string;           // 唯一ID: `${platform}_${timestamp}_${index}`
    url: string;          // 对话页面 URL
    platform: string;     // 'chatgpt' | 'claude' | 'gemini' | 'doubao'
    userMessage: string;  // 用户消息文本（截取前500字符用于摘要）
    timestamp: number;    // Date.now()
    embedding: number[] | null;  // 嵌入向量
    turnIndex: number;    // 对话在页面中的序号（0-based）
    messageId: string;    // DOM 消息容器 ID（如有）
}

const MAX_RECORDS = 500;

/** 获取平台对应的对话历史库名 */
function getStorageKey(platform: string): string {
    return `cobridge_history_${platform}`;
}

/**
 * 去数据库获取指定平台的所有历史记录
 *
 * 要访问数据库，所以是异步
 */
export async function getAllTurns(platform: string): Promise<ConversationTurn[]> {
    // 获取表名
    const storageKey: string = getStorageKey(platform);
    // chrome.storage.local 在逻辑上是一个哈希表
    // 键是平台名，值是 ConversationTurn[]
    const storage: { [key: string]: ConversationTurn[] } = await chrome.storage.local.get(storageKey); // get 方法返回键值对
    return storage[storageKey] || [];
}

/**
 * 一条对话入库
 */
export async function saveTurn(turn: ConversationTurn) {
    let turns: ConversationTurn[] = await getAllTurns(turn.platform);
    const storageKey: string = getStorageKey(turn.platform);
    // 去重（第二层保险）
    const exist = turns.some(t => t.userMessage === turn.userMessage);
    if (exist) {
        console.log('[CoBridge] Skipping, turn already exists');
        return;
    }
    turns.push(turn);
    if (turns.length > MAX_RECORDS) {
        turns = turns.slice(-MAX_RECORDS);
    }
    // [] 表示取值
    chrome.storage.local.set({ [storageKey] : turns });
}

/**
 * 更新指定记录的 embedding（补算场景）
 */
export async function updateTurnEmbedding(platform: string, id: string, embedding: number[]) {
    const turns: ConversationTurn[] = await getAllTurns(platform);
    const storageKey: string = getStorageKey(platform);
    const turn = turns.find(t => t.id === id);
    if (turn) {
        turn.embedding = embedding;
        await chrome.storage.local.set({ [storageKey]: turns } );
    }
}