import * as vscode from 'vscode';
import * as http from 'http';
import { saveContext, MessageData } from './contextService';

let server: http.Server | undefined;

/**
 * 获取服务器实例
 */
export function getServer(): http.Server | undefined {
    return server;
}

/**
 * 检查服务器是否正在运行
 */
export function isServerRunning(): boolean {
    return server !== undefined;
}

/**
 * 启动同步服务器
 */
export function startServer(
    outputChannel: vscode.OutputChannel,
    statusBarCallback: (active: boolean) => void
): void {
    if (server) {
        outputChannel.appendLine('⚠️ Server already running.');
        return;
    }

    const config = vscode.workspace.getConfiguration('AIContextSync');
    const port = config.get<number>('port') || 3030;

    try {
        server = http.createServer((req, res) => handleRequest(req, res, outputChannel));
        server.listen(port, '127.0.0.1', () => {
            const msg = `🚀 CoBridge Server running on port ${port}`;
            outputChannel.appendLine(msg);
            statusBarCallback(true);
            vscode.window.showInformationMessage('CoBridge is ready!');
        });

        server.on('error', (err: any) => {
            const msg = `❌ Server Error: ${err.message}`;
            outputChannel.appendLine(msg);
            vscode.window.showErrorMessage(msg);
            server = undefined;
            statusBarCallback(false);
        });
    } catch (err: any) {
        vscode.window.showErrorMessage(`Failed to create server: ${err.message}`);
    }
}

/**
 * 停止同步服务器
 */
export function stopServer(
    outputChannel: vscode.OutputChannel,
    statusBarCallback: (active: boolean) => void
): void {
    if (server) {
        server.close();
        server = undefined;
        outputChannel.appendLine('🛑 Server stopped.');
        statusBarCallback(false);
        vscode.window.showInformationMessage('CoBridge Server stopped.');
    }
}

/**
 * 处理 HTTP 请求
 */
function handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    outputChannel: vscode.OutputChannel
): void {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/sync') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const data: MessageData[] = JSON.parse(body);
                const srcUrl = data[0]?.url || 'Unknown source';
                outputChannel.appendLine(`📦 Received sync: ${srcUrl}`);
                await saveContext(data, outputChannel);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'success' }));
                vscode.window.showInformationMessage(`Successfully synced ${data.length} messages from ${srcUrl}`);
            } catch (err: any) {
                outputChannel.appendLine(`❌ Error processing request: ${err.message}`);
                res.writeHead(400);
                res.end(JSON.stringify({ status: 'error', message: err.message }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
}
