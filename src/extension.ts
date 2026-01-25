import * as vscode from 'vscode';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

let server: http.Server | undefined;
let outputChannel: vscode.OutputChannel; // 输出面板
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    try {
        console.log('CoBridge: Activating...');
        
        // 1. 初始化 Output Channel
        outputChannel = vscode.window.createOutputChannel("CoBridge");
        outputChannel.appendLine('🚀 CoBridge is starting...');

        // 2. 初始化状态栏
        // 初始化状态栏，设置为靠右显示，优先级为 100
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        // 点击命令
        statusBarItem.command = 'ai-context-sync.showMenu'; 
        context.subscriptions.push(statusBarItem);
        // 初始状态设为 Off
        updateStatusBarItem(false);

        // 3. 注册命令
        registerCommands(context);

        // 4. 自动启动服务器
        startServer();

        // 5. 成功提示
        vscode.window.showInformationMessage('CoBridge is ready!');
        
    } catch (error: any) {
        console.error('Activation failed:', error);
        vscode.window.showErrorMessage(`CoBridge Activation Error: ${error.message}`);
    }
}

function registerCommands(context: vscode.ExtensionContext) {
    // 菜单命令
    let menuCmd = vscode.commands.registerCommand('ai-context-sync.showMenu', async () => {
        const items = [
            { label: server ? '$(stop) Stop CoBridge Server' : '$(play) Start Sync Server', action: server ? 'stop' : 'start' },
            { label: '$(file-text) Open CoBridge File', action: 'open' },
            { label: '$(output) Show Logs', action: 'logs' }
        ];
        const selection = await vscode.window.showQuickPick(items, { placeHolder: 'AI Context Sync Management' });
        if (selection) {
            if (selection.action === 'start') startServer();
            else if (selection.action === 'stop') stopServer();
            else if (selection.action === 'logs') outputChannel.show();
            else if (selection.action === 'open') openSyncFile();
        }
    });

    // 独立命令
    let startCmd = vscode.commands.registerCommand('ai-context-sync.startServer', startServer);
    let stopCmd = vscode.commands.registerCommand('ai-context-sync.stopServer', stopServer);

    context.subscriptions.push(menuCmd, startCmd, stopCmd);
}

// 打开文件
function openSyncFile() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace open.');
        return;
    }
    const root = workspaceFolders[0].uri.fsPath;
    const vscodePath = path.join(root, '.vscode');
    const filePath = path.join(vscodePath, 'AI_CONTEXT_SYNC.md');
    if (fs.existsSync(filePath)) {
        vscode.window.showTextDocument(vscode.Uri.file(filePath));
    } else {
        vscode.window.showErrorMessage('No sync file found yet.');
    }
}

// 启动服务器函数
function startServer() {
    if (server) {
        outputChannel.appendLine('⚠️ Server already running.');
        return;
    }

    const config = vscode.workspace.getConfiguration('aiContextSync');
    const port = config.get<number>('port') || 3030;

    try {
        server = http.createServer(handleRequest);
        server.listen(port, '127.0.0.1', () => {
            const msg = `🚀 CoBridge Server running on port ${port}`;
            outputChannel.appendLine(msg);
            updateStatusBarItem(true);
            vscode.window.showInformationMessage('CoBridge is ready!');
        });

        server.on('error', (err: any) => {
            const msg = `❌ Server Error: ${err.message}`;
            outputChannel.appendLine(msg);
            vscode.window.showErrorMessage(msg);
            server = undefined;
            updateStatusBarItem(false);
        });
    } catch (err: any) {
        vscode.window.showErrorMessage(`Failed to create server: ${err.message}`);
    }
}

function stopServer() {
    if (server) {
        server.close();
        server = undefined;
        outputChannel.appendLine('🛑 Server stopped.');
        updateStatusBarItem(false);
        vscode.window.showInformationMessage('CoBridge Server stopped.');
    }
}

function handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
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
                const data = JSON.parse(body);
                const srcUrl = data[0].url;
                outputChannel.appendLine(`📦 Received sync: ${srcUrl || 'Unknown source'}`);
                await saveContext(data); // 保存文本
                outputChannel.append(JSON.stringify(data, null, 2)) // 输出传送来的数据
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'success' }));
                vscode.window.showInformationMessage(`Successfully synced ${data.length} messages from ${srcUrl}`); // 通知消息
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

/* -将上下文文件存放在.vscode文件里
   -更新.traerules
   -添加到.gitignore防止污染
*/
async function saveContext(data: any) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return;

    const rootPath = workspaceFolders[0].uri.fsPath;
    const vscodePath = path.join(rootPath, '.vscode');
    const mdPath = path.join(vscodePath, 'AI_CONTEXT_SYNC.md');
    const traeRulesPath = path.join(rootPath, '.traerules'); // Trae 的规则文件
    const cursorRulesPath = path.join(rootPath, '.cursorrules'); // Cursor 的规则文件
    const gitignorePath = path.join(rootPath, '.gitignore');

    // 动态创建.gitignore
    if (!fs.existsSync(gitignorePath)) {
        fs.writeFileSync(gitignorePath, '# Git Ignore File\n', 'utf8');
    }

    // 动态创建 .vscode 目录（如果不存在）
    if (!fs.existsSync(vscodePath)) {
        fs.mkdirSync(vscodePath, { recursive: true });
    }

    // 创建或更新缓存文件
    if (!fs.existsSync(mdPath)) {
        fs.writeFileSync(mdPath, '# AI Context Sync \n\n');
    }
    
    // 生成 Markdown
    let md = `# 🧠 AI Context (${new Date().toLocaleString()})\n\n`;
    // Handle both array format (new) and object format with messages property (old)
    let messages: any[] = [];
    if (Array.isArray(data)) {
        messages = data;
    } else if (data.messages && Array.isArray(data.messages)) {
        messages = data.messages;
    }

    messages.forEach((msg: any) => {
        // New format: { text, is_user_likely, is_ai_likely, ... }
        let role = 'Unknown';
        if (msg.is_user_likely) {
            role = 'User';
        } else if (msg.is_ai_likely) {
            role = 'AI';
        }
        md += `**${role}**: ${msg.text}\n\n`;
    });

    // 写入AI_CONTEXT_SYNC.md
    fs.writeFileSync(mdPath, md, 'utf8');
    // 更新 .traerules (简单追加)
    if (!fs.existsSync(traeRulesPath)) {
        fs.writeFileSync(traeRulesPath, '# Trae Rules\n务必参考历史上下文：.vscode/AI_CONTEXT_SYNC.md\n', 'utf8');
    } else {
        const rules = fs.readFileSync(traeRulesPath, 'utf8');
        if (!rules.includes('AI_CONTEXT_SYNC.md')) {
            fs.appendFileSync(traeRulesPath, '\nAI_CONTEXT_SYNC.md\n');
        }
    }
    // 更新.cursorrules
    if (!fs.existsSync(cursorRulesPath)) {
        fs.writeFileSync(cursorRulesPath, '# Cursor Rules\n历史上下文：.vscode/AI_CONTEXT_SYNC.md\n', 'utf8');
    } else {
        const rules = fs.readFileSync(cursorRulesPath, 'utf8');
        if (!rules.includes('AI_CONTEXT_SYNC.md')) {
            fs.appendFileSync(cursorRulesPath, '\nAI_CONTEXT_SYNC.md\n');
        }
    }

    /* 添加到 .gitignore 避免污染 */
    // git忽略AI_CONTEXT_SYNC.md
    const ignoreContext = '\n# AI Context Sync\n.vscode/AI_CONTEXT_SYNC.md\n'; // 标记：忽略AI_CONTEXT_SYNC.md
    let content = fs.readFileSync(gitignorePath, 'utf8');
    if (!content.includes('.vscode/AI_CONTEXT_SYNC.md')) {
        fs.appendFileSync(gitignorePath, ignoreContext);
    }
    // git忽略.traerules
    const ignoreTraerules = '\n# .traerules\n.traerules\n'; // 标记：忽略.traerules
    content = fs.readFileSync(gitignorePath, 'utf8');
    if (!content.includes('.traerules')) {
        fs.appendFileSync(gitignorePath, ignoreTraerules);
    }
    // git忽略.cursorrules
    const ignoreCursorrules = '\n# .cursorrules\n.cursorrules\n'; // 标记：忽略.traerules
    content = fs.readFileSync(gitignorePath, 'utf8');
    if (!content.includes('.cursorrules')) {
        fs.appendFileSync(gitignorePath, ignoreCursorrules);
    }

    outputChannel.appendLine('✅ Files updated: AI_CONTEXT_SYNC.md & .traerules');
}

// 按钮的外观
function updateStatusBarItem(active: boolean) {
    if (active) {
        // 当处于 On 状态时：显示旋转图标和文字，设置警告背景色（通常是橙色/黄色）
        statusBarItem.text = '$(sync~spin) CoBridge: On';
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        statusBarItem.tooltip = 'CoBridge Server is Running';
    } else {
        // 当处于 Off 状态时：显示静态图标和文字，清除背景色
        statusBarItem.text = '$(circle-slash) CoBridge: Off';
        statusBarItem.backgroundColor = undefined;
        statusBarItem.tooltip = 'CoBridge Server is Stopped';
    }
    statusBarItem.show();
}

export function deactivate() {
    stopServer();
}