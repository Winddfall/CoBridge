import * as vscode from 'vscode';
import { startServer, stopServer, isServerRunning } from '../services/syncServer';
import { clearContext, openSyncFile } from '../services/contextService';

/**
 * 显示 CoBridge 快捷菜单
 */
export async function showMenuCommand(
    outputChannel: vscode.OutputChannel,
    statusBarCallback: (active: boolean) => void
): Promise<void> {
    const serverRunning = isServerRunning();

    const items = [
        {
            label: serverRunning ? '$(stop) Stop Server' : '$(play) Start Server',
            action: serverRunning ? 'stop' : 'start'
        },
        { label: '$(file-text) Open Context File', action: 'open' },
        { label: '$(trash) Clear Context', action: 'clear' },
        { label: '$(output) Show Logs', action: 'logs' }
    ];

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
                openSyncFile();
                break;
            case 'clear':
                await clearContext(outputChannel);
                break;
        }
    }
}
