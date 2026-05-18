// 运行方式：node export-concepts.js
// 从 data.js 导出所有概念到 concepts.csv

const fs = require('fs');
const code = fs.readFileSync('./data.js', 'utf8');
const match = code.match(/const MODULES = (\[[\s\S]*?\]);?\s*\n\/\/ 进度管理/);
if (!match) { console.error('无法解析 data.js，请检查文件结构'); process.exit(1); }

eval('var MODULES = ' + match[1]);

const rows = ['模块ID,模块名称,概念ID,概念英文名,概念中文名,标语'];
MODULES.forEach(m => {
  m.concepts.forEach(c => {
    const row = [m.id, m.name, c.id, c.name, c.zh || '', c.tagline || '']
      .map(v => '"' + String(v).replace(/"/g, '""') + '"')
      .join(',');
    rows.push(row);
  });
});

fs.writeFileSync('./concepts.csv', rows.join('\n'), 'utf8');
console.log(`✓ 已导出 ${rows.length - 1} 个概念 → concepts.csv`);
