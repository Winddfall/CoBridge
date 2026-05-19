import * as fs from 'fs';

/**
 * 将 Base64 编码的图片保存为 PNG 文件
 * @param base64String Base64 编码的图片字符串（包含 data:image/xxx;base64, 前缀）
 * @param outputPath 输出文件路径
 */
export async function saveBase64AsPng(base64String: string, outputPath: string): Promise<void> {
    // 去掉 Base64 头部（例如: "data:image/png;base64,"）
    const base64Image = base64String.split(';base64,').pop() || '';

    // 将字符串转换为二进制 Buffer
    const buffer = Buffer.from(base64Image, 'base64');

    // 写入文件系统
    try {
        // fs.promises.writeFile 会返回一个 Promise
        // await 会暂停执行，直到文件写完（或失败）
        await fs.promises.writeFile(outputPath, buffer);
        // 如果执行到这一行，说明保存成功
        console.log('图片已成功保存至:', outputPath);
    } catch (err) {
        // 如果保存过程中出错，会直接跳到这里
        console.error('保存失败:', err);
    }
}
