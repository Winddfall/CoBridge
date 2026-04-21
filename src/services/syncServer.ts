import * as vscode from 'vscode';
import * as http from 'http';
import { saveContext, MessageData } from './contextService';

// 服务器：全局变量
let server: http.Server | undefined; // :后面跟变量类型

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
    outputChannel: vscode.OutputChannel, // 输出面板
    statusBarCallback: (isActive: boolean) => void // 状态栏回调函数
): void {
    /* 如果服务器已经开启了 */
    if (server) {
        outputChannel.appendLine('⚠️ Server already running.');
        return;
    }

    // 工作区路径
    // 如果没打开工作区，则提示错误
    const WORKSPACE_FOLDERS = vscode.workspace.workspaceFolders;
    if (!WORKSPACE_FOLDERS) {
        vscode.window.showErrorMessage('No workspace open.');
        outputChannel.appendLine('No workspace open.');
        return;
    }

    /* 如果服务器还没开启 */
    // 确认端口
    const config = vscode.workspace.getConfiguration('AIContextSync');
    const port = config.get<number>('port') || 3030; // 默认值兜底：如果||左边是undefined，则取右边

    try {
        // 创建服务器
        server = http.createServer((req, res) => handleRequest(req, res, outputChannel));
        // 启动服务器
        server.listen(port, '127.0.0.1', () => {
            // 服务器启动之后就立刻执行这个函数
            const msg = `🚀 CoBridge Server running on port ${port}`;
            outputChannel.appendLine(msg); // 输出面板
            statusBarCallback(true); // 状态栏显示运行
            vscode.window.showInformationMessage('CoBridge is ready!'); // 弹窗提示
        });
        // 监听错误
        server.on('error', (err: any) => {
            const msg = `❌ Server Error: ${err.message}`;
            outputChannel.appendLine(msg);
            vscode.window.showErrorMessage(msg);
            server = undefined;
            statusBarCallback(false); // 状态栏显示停止
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
    /* 如果服务器已经开启了 */
    if (server) {
        server.close(); // 关闭服务器
        server = undefined; // 清空服务器变量
        outputChannel.appendLine('🛑 Server stopped.'); // 输出面板
        statusBarCallback(false); // 状态栏回调
        vscode.window.showInformationMessage('CoBridge Server stopped.'); // 弹窗提示
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
    res.setHeader('Access-Control-Allow-Origin', '*'); // 允许接受所有网站的请求
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // 允许接受的请求方法
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // 允许接受的请求头

    // 预检请求
    if (req.method === 'OPTIONS') {
        res.writeHead(204); // 204 No Content: 请求成功，但没有响应体
        res.end();
        return;
    }

    // 处理 POST 请求
    if (req.method === 'POST' && req.url === '/sync') {
        let body = '';
        // 接收请求体
        req.on('data', (chunk: string) => body += chunk); // 流式传输
        // 请求结束
        req.on('end', async () => {
            try {
                // 数据解析
                const data: MessageData[] = JSON.parse(body); // data是MessageData[]类型
                // 源url
                const srcUrl = data[0]?.url || 'Unknown source';
                outputChannel.appendLine(`📦 Received context from: ${srcUrl}`);
                // 保存上下文
                await saveContext(data);
                // 响应
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'success' }));
                // 提示
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
