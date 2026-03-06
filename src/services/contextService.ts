import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { saveBase64AsPng, ensureDirectory, ensureFile, updateRulesFile, appendToGitignore } from '../utils';

/**
 * 消息数据接口
 */
export interface MessageData {
    url: string; // 上下文来源网页url
    className: string; // dom元素的class
    text: string; // 文本
    images: string[] | null; // 图片
    is_ai_likely: boolean; // 是否是AI
    is_user_likely: boolean; // 是否是用户
}

/**
 * 保存上下文到文件系统
 * - 将上下文文件转md格式存放在 .cobridge 文件夹里
 * - 更新 .traerules、.cursorrules、.github/copilot-instructions.md
 * - 添加到 .gitignore 防止污染
 */
// 函数内包含异步操作
export async function saveContext(data: MessageData[]): Promise<void> {
    // 工作区路径
    const WORKSPACE_FOLDERS = vscode.workspace.workspaceFolders;
    if (!WORKSPACE_FOLDERS) {
        vscode.window.showErrorMessage('No workspace open.');
        return;
    }

    const ROOT_PATH = WORKSPACE_FOLDERS[0].uri.fsPath; // 工作区根目录
    const COBRIDGE_PATH = path.join(ROOT_PATH, '.cobridge'); // .cobridge 目录
    const GITHUB_PATH = path.join(ROOT_PATH, '.github'); // .github 目录
    const TRAE_RULES_PATH = path.join(ROOT_PATH, '.traerules'); // .traerules 文件
    const CURSOR_RULES_PATH = path.join(ROOT_PATH, '.cursorrules'); // .cursorrules 文件
    const GITIGNORE_PATH = path.join(ROOT_PATH, '.gitignore'); // .gitignore 文件
    const IMAGES_PATH = path.join(COBRIDGE_PATH, 'images'); // images 目录
    const CONTEXT_PATH = path.join(COBRIDGE_PATH, 'AI_CONTEXT.md'); // AI_CONTEXT.md 文件
    const COPILOT_RULES_PATH = path.join(GITHUB_PATH, 'copilot-instructions.md'); // copilot-instructions.md 文件

    // 创建必要的目录和文件
    ensureDirectory(COBRIDGE_PATH);
    ensureDirectory(GITHUB_PATH);
    ensureDirectory(IMAGES_PATH);
    ensureFile(CONTEXT_PATH, '# AI Context Sync \n\n');

    let messages: MessageData[] = [];
    if (Array.isArray(data)) {
        messages = data;
    }

    const context_md = writeDownContext(messages, IMAGES_PATH);

    // 写入 AI_CONTEXT.md
    fs.writeFileSync(CONTEXT_PATH, context_md, 'utf8');

    // 更新规则文件
    updateAllRulesFile(TRAE_RULES_PATH, CURSOR_RULES_PATH, COPILOT_RULES_PATH);

    // 更新 .gitignore
    updateGitignore(GITIGNORE_PATH);
}

// 写入上下文
function writeDownContext(messages: MessageData[], imagesPath: string): string {
    // 上下文标题
    let context_md = `# 🧠 AI Context (${new Date().toLocaleString()})\n\n`;
    // 遍历每条消息
    // msg是MessageData类型，msgIndex是消息的索引
    messages.forEach((msg: MessageData, msgIndex: number) => {
        let imageIndex = 0; // 每条信息的图片索引初始值
        let role = 'Unknown'; // 角色
        if (msg.is_user_likely) {
            role = '👤User';
        } else if (msg.is_ai_likely) {
            role = '✨AI';
        }

        // 构建消息内容
        context_md += `**${role}:**\n\n`;
        // 如果消息包含图片，保存图片并添加引用
        if (msg.images) {
            // 遍历每张图片
            for (const img of msg.images) {
                imageIndex++;
                const imageName = `context_img_${msgIndex + 1}_${imageIndex}.png`;
                const imageFullPath = path.join(imagesPath, imageName); // 图片完整路径
                // 保存图片文件
                saveBase64AsPng(img, imageFullPath);
                // 在 Markdown 中添加图片引用（使用相对路径）
                context_md += `![context_img_${msgIndex + 1}_${imageIndex}](./images/${imageName})\n\n`;
            }
        }
        // 添加文本内容
        if (msg.text && msg.text.trim()) {
            context_md += `${msg.text}\n\n`;
        }
        context_md += `---\n\n`;
    });
    return context_md;
}

/**
 * 更新所有规则文件
 */
function updateAllRulesFile(traeRulesPath: string, cursorRulesPath: string, copilotRulesPath: string) {
    updateRulesFile(
        traeRulesPath,
        '# Trae Rules\nAlways refer to the historical context when answering：.cobridge/AI_CONTEXT.md\n',
        'AI_CONTEXT.md',
        '\nAlways refer to the historical context when answering：.cobridge/AI_CONTEXT.md\n'
    );
    updateRulesFile(
        cursorRulesPath,
        '# Cursor Rules\nAlways refer to the historical context when answering：.cobridge/AI_CONTEXT.md\n',
        'AI_CONTEXT.md',
        '\nAlways refer to the historical context when answering：.cobridge/AI_CONTEXT.md\n'
    );
    updateRulesFile(
        copilotRulesPath,
        '# Copilot Instructions\nAlways refer to the historical context when answering：.cobridge/AI_CONTEXT.md\n',
        'AI_CONTEXT.md',
        '\nAlways refer to the historical context when answering：.cobridge/AI_CONTEXT.md\n'
    );
}

/**
 * 更新 .gitignore
 */
function updateGitignore(gitignorePath: string) {
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
 * 打开上下文文件
 */
export function openContextFile(): void {
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
        vscode.window.showErrorMessage('No context file found yet.');
    }
}
