# AI魔法词典

> 解锁 AI 世界的每一道咒语 — 系统学习 90+ 个 AI 核心概念

**线上地址：** https://ai-magic-dict.pages.dev

---

## 项目简介

哈利波特魔法书风格的 AI 学习网站。11 个模块，79 个概念，每个概念包含：
- 简单说 / 深入理解 / 真实场景 三层解释
- 施法挑战（2选1快答）
- 魔法测验（4选1 + 解析）
- 修炼作业

**功能：**
- 进度跟踪（localStorage）
- 全局复习（随机抽 10 题跨模块测验）
- 分享卡片（截图分享学习进度）
- 简繁中文切换
- 概念搜索

---

## 本地运行

纯静态文件，不需要任何构建工具。直接双击 `index.html` 用浏览器打开，或用 VS Code Live Server。

---

## 添加新概念

所有内容在 `data.js` 一个文件里。在对应模块的 `concepts: []` 数组末尾添加：

```js
{
  id: "concept-id",           // 英文小写，用连字符
  name: "Concept Name",       // 英文名
  zh: "中文名",               zhTW: "繁體中文名",
  tagline: "一句话描述",       taglineTW: "繁體一句話描述",
  simple: "小白也能懂的解释",
  deep: "技术原理深入解析",
  realWorld: "真实使用场景举例",
  related: ["related-id-1", "related-id-2"],
  challenge: {
    question: "判断题问法",
    options: ["选项A", "选项B"],
    correct: 1,               // 0 或 1
    reveal: "答案揭晓说明"
  },
  quiz: {
    question: "四选一问题",
    options: ["A", "B", "C", "D"],
    correct: 2,               // 0-3
    explanation: "为什么选这个"
  },
  homework: {
    task: "具体作业任务描述",
    file: "模块编号/概念id.md",
    time: "20分钟"
  }
}
```

添加后更新概念清单：
```bash
node export-concepts.js
```

部署：
```bash
git add data.js && git commit -m "Add concept: xxx" && git push
```

---

## 添加新模块

在 `data.js` 的 `MODULES` 数组末尾加：

```js
{
  id: 12,
  name: "模块名称",     nameTW: "繁體模組名稱",
  subtitle: "第X卷·副标题",  subtitleTW: "繁體副標題",
  icon: "🔮",
  color: "#颜色HEX",
  description: "模块描述",  descTW: "繁體描述",
  unlocked: true,
  concepts: [ /* 概念数组 */ ]
}
```

---

## 部署

连接了 GitHub + Cloudflare Pages，push 后自动部署（约 30 秒）。

```bash
git add -A && git commit -m "说明改了什么" && git push
```

手动部署（备用）：
```bash
npx wrangler pages deploy . --project-name ai-magic-dict
```

---

## 文件结构

```
index.html          # 页面入口
style.css           # 样式（羊皮纸主题）
app.js              # 渲染逻辑 + 交互
data.js             # 所有概念数据 + 进度管理
i18n.js             # 简繁中文翻译
export-concepts.js  # 导出 concepts.csv 的脚本
wrangler.jsonc      # Cloudflare 配置（自动生成，勿改）
```

---

## 概念清单

运行 `node export-concepts.js` 生成 `concepts.csv`，用 Excel / Numbers 打开查看全部概念。
