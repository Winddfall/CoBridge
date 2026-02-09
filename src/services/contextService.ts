import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { saveBase64AsPng, ensureDirectory, ensureFile, updateRulesFile, appendToGitignore } from '../utils';

/**
 * 消息数据接口
 */
export interface MessageData {
    url: string;
    className: string;
    images: string[] | null;
    text: string;
    is_ai_likely: boolean;
    is_user_likely: boolean;
    rect: {
        top: number;
        left: number;
        width: number;
    };
}

/**
 * 保存上下文到文件系统
 * - 将上下文文件存放在 .cobridge 文件夹里
 * - 更新 .traerules、.cursorrules、.github/copilot-instructions.md
 * - 添加到 .gitignore 防止污染
 */
export async function saveContext(data: MessageData[], outputChannel: vscode.OutputChannel): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return;

    const rootPath = workspaceFolders[0].uri.fsPath;
    const cobridgePath = path.join(rootPath, '.cobridge');
    const githubPath = path.join(rootPath, '.github');
    const imagesPath = path.join(cobridgePath, 'images');
    const contextPath = path.join(cobridgePath, 'AI_CONTEXT.md');
    const traeRulesPath = path.join(rootPath, '.traerules');
    const cursorRulesPath = path.join(rootPath, '.cursorrules');
    const vscodeRulesPath = path.join(githubPath, 'copilot-instructions.md');
    const gitignorePath = path.join(rootPath, '.gitignore');

    // 创建必要的目录
    ensureDirectory(cobridgePath);
    ensureDirectory(githubPath);
    ensureDirectory(imagesPath);
    ensureFile(contextPath, '# AI Context Sync \n\n');

    // 生成 Markdown
    let md = `# 🧠 AI Context (${new Date().toLocaleString()})\n\n`;

    let messages: MessageData[] = [];
    if (Array.isArray(data)) {
        messages = data;
    }

    messages.forEach((msg: MessageData, msgIndex: number) => {
        let imageIndex = 0;
        let role = 'Unknown';
        if (msg.is_user_likely) {
            role = 'User';
        } else if (msg.is_ai_likely) {
            role = 'AI';
        }

        // 构建消息内容
        md += `**${role}:**\n\n`;

        // 如果消息包含图片，先保存图片并添加引用
        if (msg.images && Array.isArray(msg.images)) {
            for (const img of msg.images) {
                imageIndex++;
                const imageName = `context_img_${msgIndex + 1}_${imageIndex}.png`;
                const imageFullPath = path.join(imagesPath, imageName);

                // 保存图片文件
                saveBase64AsPng(img, imageFullPath);

                // 在 Markdown 中添加图片引用（使用相对路径）
                md += `![上下文图片 ${imageIndex}](./images/${imageName})\n\n`;
            }
        }

        // 添加文本内容
        if (msg.text && msg.text.trim()) {
            md += `${msg.text}\n\n`;
        }

        md += `---\n\n`;
    });

    // 写入 AI_CONTEXT.md
    fs.writeFileSync(contextPath, md, 'utf8');

    // 更新规则文件
    updateRulesFile(
        traeRulesPath,
        '# Trae Rules\nAlways refer to the historical context when answering：.cobridge/AI_CONTEXT.md\n',
        'AI_CONTEXT.md',
        '\nAI_CONTEXT.md\n'
    );
    updateRulesFile(
        cursorRulesPath,
        '# Cursor Rules\nAlways refer to the historical context when answering：.cobridge/AI_CONTEXT.md\n',
        'AI_CONTEXT.md',
        '\nAI_CONTEXT.md\n'
    );
    updateRulesFile(
        vscodeRulesPath,
        '# Copilot Instructions\nAlways refer to the historical context when answering：.cobridge/AI_CONTEXT.md\n',
        'AI_CONTEXT.md',
        '\nAI_CONTEXT.md\n'
    );

    // 更新 .gitignore
    appendToGitignore(gitignorePath, '.cobridge', 'AI Context');
    appendToGitignore(gitignorePath, '.traerules', '.traerules');
    appendToGitignore(gitignorePath, '.cursorrules', '.cursorrules');
    appendToGitignore(gitignorePath, '.github/copilot-instructions.md', 'GitHub Copilot Instructions');
}

/**
 * 清除上下文文件
 */
export async function clearContext(outputChannel: vscode.OutputChannel): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace open.');
        return;
    }

    const root = workspaceFolders[0].uri.fsPath;
    const filePath = path.join(root, '.cobridge', 'AI_CONTEXT.md');

    if (fs.existsSync(filePath)) {
        try {
            fs.writeFileSync(filePath, '# AI Context Sync \n\n', 'utf8');
            outputChannel.appendLine('🗑️ Context file cleared.');
            vscode.window.showInformationMessage('AI Context file has been cleared.');
        } catch (err: any) {
            vscode.window.showErrorMessage(`Failed to clear context file: ${err.message}`);
        }
    } else {
        vscode.window.showInformationMessage('No context file to clear.');
    }
}

/**
 * 打开同步文件
 */
export function openSyncFile(): void {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace open.');
        return;
    }
    const root = workspaceFolders[0].uri.fsPath;
    const filePath = path.join(root, '.cobridge', 'AI_CONTEXT.md');
    if (fs.existsSync(filePath)) {
        vscode.window.showTextDocument(vscode.Uri.file(filePath));
    } else {
        vscode.window.showErrorMessage('No sync file found yet.');
    }
}
