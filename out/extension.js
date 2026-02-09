"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const syncServer_1 = require("./services/syncServer");
const contextService_1 = require("./services/contextService");
const menuCommand_1 = require("./commands/menuCommand");
let outputChannel;
let statusBarItem;
function activate(context) {
    try {
        console.log('CoBridge: Activating...');
        // 1. 初始化 Output Channel
        outputChannel = vscode.window.createOutputChannel("CoBridge");
        outputChannel.appendLine('🚀 CoBridge is starting...');
        // 2. 初始化状态栏
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        statusBarItem.command = 'ai-context-sync.showMenu';
        context.subscriptions.push(statusBarItem);
        updateStatusBarItem(false);
        // 3. 注册命令
        registerCommands(context);
        // 4. 监听配置变更
        context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('AIContextSync.port')) {
                outputChannel.appendLine('⚙️ Port configuration changed, restarting server...');
                (0, syncServer_1.stopServer)(outputChannel, updateStatusBarItem);
                (0, syncServer_1.startServer)(outputChannel, updateStatusBarItem);
            }
        }));
        // 5. 自动启动服务器
        (0, syncServer_1.startServer)(outputChannel, updateStatusBarItem);
        // 6. 成功提示
        vscode.window.showInformationMessage('CoBridge is ready!');
    }
    catch (error) {
        console.error('Activation failed:', error);
        vscode.window.showErrorMessage(`CoBridge Activation Error: ${error.message}`);
    }
}
exports.activate = activate;
function registerCommands(context) {
    // 菜单命令
    const menuCmd = vscode.commands.registerCommand('ai-context-sync.showMenu', () => {
        (0, menuCommand_1.showMenuCommand)(outputChannel, updateStatusBarItem);
    });
    // 独立命令
    const startCmd = vscode.commands.registerCommand('ai-context-sync.startServer', () => {
        (0, syncServer_1.startServer)(outputChannel, updateStatusBarItem);
    });
    const stopCmd = vscode.commands.registerCommand('ai-context-sync.stopServer', () => {
        (0, syncServer_1.stopServer)(outputChannel, updateStatusBarItem);
    });
    const clearCmd = vscode.commands.registerCommand('ai-context-sync.clearContext', () => {
        (0, contextService_1.clearContext)(outputChannel);
    });
    context.subscriptions.push(menuCmd, startCmd, stopCmd, clearCmd);
}
/**
 * 更新状态栏显示
 */
function updateStatusBarItem(active) {
    if (active) {
        statusBarItem.text = '$(sync~spin) CoBridge: On';
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        statusBarItem.tooltip = 'CoBridge Server is Running';
    }
    else {
        statusBarItem.text = '$(circle-slash) CoBridge: Off';
        statusBarItem.backgroundColor = undefined;
        statusBarItem.tooltip = 'CoBridge Server is Stopped';
    }
    statusBarItem.show();
}
function deactivate() {
    (0, syncServer_1.stopServer)(outputChannel, updateStatusBarItem);
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map