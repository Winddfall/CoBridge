import * as vscode from 'vscode';
import { startServer, stopServer } from './services/syncServer';
import { clearContext } from './services/contextService';
import { showMenuCommand } from './commands/menuCommand';

let outputChannel: vscode.OutputChannel;
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
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
                stopServer(outputChannel, updateStatusBarItem);
                startServer(outputChannel, updateStatusBarItem);
            }
        }));

        // 5. 自动启动服务器
        startServer(outputChannel, updateStatusBarItem);

        // 6. 成功提示
        vscode.window.showInformationMessage('CoBridge is ready!');

    } catch (error: any) {
        console.error('Activation failed:', error);
        vscode.window.showErrorMessage(`CoBridge Activation Error: ${error.message}`);
    }
}

function registerCommands(context: vscode.ExtensionContext) {
    // 菜单命令
    const menuCmd = vscode.commands.registerCommand('ai-context-sync.showMenu', () => {
        showMenuCommand(outputChannel, updateStatusBarItem);
    });

    // 独立命令
    const startCmd = vscode.commands.registerCommand('ai-context-sync.startServer', () => {
        startServer(outputChannel, updateStatusBarItem);
    });

    const stopCmd = vscode.commands.registerCommand('ai-context-sync.stopServer', () => {
        stopServer(outputChannel, updateStatusBarItem);
    });

    const clearCmd = vscode.commands.registerCommand('ai-context-sync.clearContext', () => {
        clearContext(outputChannel);
    });

    context.subscriptions.push(menuCmd, startCmd, stopCmd, clearCmd);
}

/**
 * 更新状态栏显示
 */
function updateStatusBarItem(active: boolean): void {
    if (active) {
        statusBarItem.text = '$(sync~spin) CoBridge: On';
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        statusBarItem.tooltip = 'CoBridge Server is Running';
    } else {
        statusBarItem.text = '$(circle-slash) CoBridge: Off';
        statusBarItem.backgroundColor = undefined;
        statusBarItem.tooltip = 'CoBridge Server is Stopped';
    }
    statusBarItem.show();
}

export function deactivate() {
    stopServer(outputChannel, updateStatusBarItem);
}