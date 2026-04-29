"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const syncServer_1 = require("./services/syncServer");
const contextService_1 = require("./services/contextService");
const menuCommand_1 = require("./commands/menuCommand");
let outputChannel;
let statusBarItem;
function activate(context) {
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
        // 更新状态栏系统
        updateStatusBarItem(false);
        // 注册命令
        registerCommands(context);
        // 监听配置变更
        // 如果配置改变就重启服务器
        context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
            // 如果端口配置改变就重启服务器
            if (e.affectsConfiguration('AIContextSync.port')) {
                outputChannel.appendLine('⚙️ Port configuration changed, restarting server...');
                (0, syncServer_1.stopServer)(outputChannel, updateStatusBarItem);
                (0, syncServer_1.startServer)(outputChannel, updateStatusBarItem);
            }
        }));
        // 自动启动服务器
        (0, syncServer_1.startServer)(outputChannel, updateStatusBarItem);
    }
    catch (error) {
        console.error('Activation failed:', error);
        vscode.window.showErrorMessage(`CoBridge Activation Error: ${error.message}`);
    }
}
/**
 * 注册命令：把命令名和函数绑定
 */
function registerCommands(context) {
    // 菜单命令
    const menuCmd = vscode.commands.registerCommand('cobridge.showMenu', () => {
        (0, menuCommand_1.showMenuCommand)(outputChannel, updateStatusBarItem);
    });
    // 独立命令
    const startCmd = vscode.commands.registerCommand('cobridge.startServer', () => {
        (0, syncServer_1.startServer)(outputChannel, updateStatusBarItem);
    });
    const stopCmd = vscode.commands.registerCommand('cobridge.stopServer', () => {
        (0, syncServer_1.stopServer)(outputChannel, updateStatusBarItem);
    });
    const openCmd = vscode.commands.registerCommand('cobridge.openContext', () => {
        (0, contextService_1.openContextFile)();
    });
    const clearCmd = vscode.commands.registerCommand('cobridge.clearContext', () => {
        (0, contextService_1.clearContext)(outputChannel);
    });
    // 登记待回收资源
    context.subscriptions.push(menuCmd, startCmd, stopCmd, openCmd, clearCmd);
}
/**
 * 更新状态栏显示
 */
function updateStatusBarItem(isActive) {
    if (isActive) {
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
//# sourceMappingURL=extension.js.map