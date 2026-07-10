/** 从 URL 中提取会话 ID */
export function extractConversationId(url: string, AIname: string): string | null {
    try {
        const pathname = new URL(url).pathname; // 路径
        switch (AIname) {
            case 'chatgpt': {
                const m = pathname.match(/\/c\/([a-zA-Z0-9-]+)/);
                return m ? m[1] : null;
            }
            case 'claude': {
                const m = pathname.match(/\/chat\/([a-zA-Z0-9-]+)/);
                return m ? m[1] : null;
            }
            case 'gemini': {
                const m = pathname.match(/\/app\/([a-zA-Z0-9]+)/);
                return m ? m[1] : null;
            }
            case 'doubao': {
                const m = pathname.match(/\/chat\/([a-zA-Z0-9-]+)/);
                return m ? m[1] : null;
            }
            default:
                return null;
        }
    } catch {
        return null;
    }
}