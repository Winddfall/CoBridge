import * as fs from 'fs';

/**
 * 确保目录存在，如果不存在则递归创建
 * @param dirPath 目录路径
 */
export function ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * 确保文件存在，如果不存在则创建并写入默认内容
 * @param filePath 文件路径
 * @param defaultContent 默认内容
 */
export function ensureFile(filePath: string, defaultContent: string): void {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, defaultContent, 'utf8');
    }
}

/**
 * 更新规则文件（如 .traerules, .cursorrules）
 * @param filePath 规则文件路径
 * @param defaultContent 如果文件不存在时的默认内容
 * @param keyword 需要检查是否存在的关键字
 * @param appendContent 如果关键字不存在时追加的内容
 */
export function updateRulesFile(
    filePath: string,
    defaultContent: string,
    keyword: string,
    appendContent: string
): void {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, defaultContent, 'utf8');
    } else {
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes(keyword)) {
            fs.appendFileSync(filePath, appendContent);
        }
    }
}

/**
 * 向 .gitignore 文件追加忽略规则
 * @param gitignorePath .gitignore 文件路径
 * @param pattern 需要忽略的模式
 * @param comment 注释说明
 */
export function appendToGitignore(gitignorePath: string, pattern: string, comment: string): void {
    ensureFile(gitignorePath, '# Git Ignore File\n');
    const content = fs.readFileSync(gitignorePath, 'utf8');
    if (!content.includes(pattern)) {
        fs.appendFileSync(gitignorePath, `\n# ${comment}\n${pattern}\n`);
    }
}
