import * as vscode from 'vscode';
import { startServer, stopServer } from './services/syncServer';
import { clearContext, openContextFile } from './services/contextService';
import { showMenuCommand } from './commands/menuCommand';

let outputChannel: vscode.OutputChannel;
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    try {
        console.log('CoBridge: Activating...');

        // 初始化 Output Channel
        outputChannel = vscode.window.createOutputChannel("CoBridge");
        outputChannel.appendLine('🚀 CoBridge is starting...');

        // 初始化状态栏
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        statusBarItem.command = 'cobridge.showMenu'; // 点击状态栏时执行的命令
        // 登记待回收资源
        context.subscriptions.push(statusBarItem);
        // 更新状态栏
        updateStatusBarItem(false);

        // 注册命令
        registerCommands(context);

        // 监听配置变更
        // 如果配置改变就重启服务器
        context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
            // 如果端口配置改变就重启服务器
            if (e.affectsConfiguration('AIContextSync.port')) {
                outputChannel.appendLine('⚙️ Port configuration changed, restarting server...');
                stopServer(outputChannel, updateStatusBarItem);
                startServer(outputChannel, updateStatusBarItem);
            }
        }));

        // 自动启动服务器
        startServer(outputChannel, updateStatusBarItem);
    } catch (error: any) {
        console.error('Activation failed:', error);
        vscode.window.showErrorMessage(`CoBridge Activation Error: ${error.message}`);
    }
}

/**
 * 注册命令：把命令名和函数绑定
 */
function registerCommands(context: vscode.ExtensionContext) {
    // 菜单命令
    const menuCmd = vscode.commands.registerCommand('cobridge.showMenu', () => {
        showMenuCommand(outputChannel, updateStatusBarItem);
    });

    // 独立命令
    const startCmd = vscode.commands.registerCommand('cobridge.startServer', () => {
        startServer(outputChannel, updateStatusBarItem);
    });

    const stopCmd = vscode.commands.registerCommand('cobridge.stopServer', () => {
        stopServer(outputChannel, updateStatusBarItem);
    });

    const openCmd = vscode.commands.registerCommand('cobridge.openContext', () => {
        openContextFile();
    });

    const clearCmd = vscode.commands.registerCommand('cobridge.clearContext', () => {
        clearContext(outputChannel);
    });

    // 登记待回收资源
    context.subscriptions.push(menuCmd, startCmd, stopCmd, openCmd, clearCmd);
}

/**
 * 更新状态栏显示
 */
function updateStatusBarItem(isActive: boolean): void {
    if (isActive) {
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