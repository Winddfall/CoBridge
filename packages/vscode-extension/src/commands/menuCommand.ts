import * as vscode from 'vscode';
import { startServer, stopServer, isServerRunning } from '../services/syncServer';
import { clearContext, openContextFile, selectAgent } from '../services/contextService';

/**
 * 显示 CoBridge 快捷菜单
 */
export async function showMenuCommand(
    outputChannel: vscode.OutputChannel,
    statusBarCallback: (active: boolean) => void
): Promise<void> {
    // 检查服务器状态
    const serverRunning = isServerRunning();

    // 构建菜单项
    const items = [
        {
            label: serverRunning ? '$(stop) Stop Server' : '$(play) Start Server', 
            action: serverRunning ? 'stop' : 'start'
        },
        { label: '$(file) Open Context File', action: 'open' },
        { label: '$(trash) Clear Context', action: 'clear' },
        { label: '$(output) Show Logs', action: 'logs' },
        { label: '$(hubot) Select An Agent', action: 'select' }
    ];

    // 显示菜单
    const selection = await vscode.window.showQuickPick(items, {
        placeHolder: 'CoBridge Management'
    });

    if (selection) {
        switch (selection.action) {
            case 'start':
                startServer(outputChannel, statusBarCallback);
                break;
            case 'stop':
                stopServer(outputChannel, statusBarCallback);
                break;
            case 'logs':
                outputChannel.show();
                break;
            case 'open':
                openContextFile();
                break;
            case 'clear':
                await clearContext(outputChannel);
                break;
            case 'select':
                // 选项
                const agents = [
                    { label: 'Github Copilot', action: 'Copilot' },
                    { label: 'Trae', action: 'Trae' },
                    { label: 'Cursor', action: 'Cursor' },
                    { label: 'Antigravity', action: 'Antigravity' },
                    { label: 'Claude Code', action: 'Claude Code' },
                    { label: 'Codex', action: 'Codex' },
                ];
                // 显示选项
                const selection_agent = await vscode.window.showQuickPick(agents, {
                    placeHolder: 'Select An Agent'
                });
                if (selection_agent) {
                    selectAgent(outputChannel, selection_agent.action, statusBarCallback);
                }
                break;
        }
    }
}
