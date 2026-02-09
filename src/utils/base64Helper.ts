import * as fs from 'fs';

/**
 * 将 Base64 编码的图片保存为 PNG 文件
 * @param base64String Base64 编码的图片字符串（包含 data:image/xxx;base64, 前缀）
 * @param outputPath 输出文件路径
 */
export function saveBase64AsPng(base64String: string, outputPath: string): void {
    // 1. 去掉 Base64 头部（例如: "data:image/png;base64,"）
    const base64Image = base64String.split(';base64,').pop() || '';

    // 2. 将字符串转换为二进制 Buffer
    const buffer = Buffer.from(base64Image, 'base64');

    // 3. 写入文件系统
    fs.writeFile(outputPath, buffer, (err: any) => {
        if (err) {
            console.error('保存失败:', err);
        } else {
            console.log('图片已成功保存至:', outputPath);
        }
    });
}
