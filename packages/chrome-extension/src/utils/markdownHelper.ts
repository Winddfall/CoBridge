// 将表格转换为 Markdown
export function convertTableToMarkdown(table: HTMLTableElement) {
    try {
        const rows = Array.from(table.rows);
        if (rows.length === 0) return '';

        // 提取数据
        const data = rows.map(row => {
            const cells = Array.from(row.cells);
            return cells.map(cell => {
                // 移除换行符，转义管道符，使用占位符代替 <br> 以免被后续的 HTML 转义处理掉
                return cell.innerText.trim().replace(/\|/g, '\\|').replace(/\n/g, '___BR___');
            });
        });

        // 规范化列数
        const maxCols = data.reduce((max, row) => Math.max(max, row.length), 0);
        if (maxCols === 0) return '';

        let md = '\n\n';

        // 表头
        const headerRow = data[0];
        while (headerRow.length < maxCols) headerRow.push('');
        md += '| ' + headerRow.join(' | ') + ' |\n';

        // 分割线
        md += '| ' + Array(maxCols).fill('---').join(' | ') + ' |\n';

        // 数据行
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            while (row.length < maxCols) row.push('');
            md += '| ' + row.join(' | ') + ' |\n';
        }

        return md + '\n';
    } catch (e) {
        console.error('Table conversion failed', e);
        return table.innerText;
    }
}