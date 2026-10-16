# Seek-Key 知识中心 (Docusaurus Docs)

本仓库是 Seek-Key 体系的**多语言知识中心与智能体聚合路由前端**，基于 **Docusaurus（小恐龙知识库引擎）** 构建，并通过 **Cloudflare Pages** 实现全球毫秒级边缘加速。

---

## 🎯 业务定位与双客群战略 (B2Agent2Human)

1. **常规赛知识中枢**：
   * 承载全机队小组模式下的主理人专栏、章节研究与多语言技术沉淀。
   * 数据主体回源自 **Drupal Headless CMS**（通过 JSON:API 与静态构建拉取）。
2. **多语言支持 (i18n)**：
   * 原生支持简体中文（`zh-Hans`）与英文（`en`），未来可扩展更多语言分发。
3. **双客群 Call to Action (CTA)**：
   * **面向人类决策者 (Human)**：优雅的文档呈现、背书展示与决策入口。
   * **面向智能体 (Agents)**：专设 `/agent-routes` 聚合端点，方便 Agent 极速读取全网数据并自动生成向上汇报研报。

---

## 🚀 Cloudflare Pages 部署规范

在 Cloudflare Dashboard 中连接本仓库，或通过 Wrangler 自动化部署：

| 参数项 | 配置值 |
|---|---|
| **框架预设 (Framework preset)** | `Docusaurus` |
| **构建命令 (Build command)** | `npm run build` |
| **输出目录 (Build output directory)** | `build` |
| **Node.js 版本** | `>= 18.0` |

---

## 🛠️ 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动本地热重载调试
npm run start

# 3. 生产静态构建
npm run build
```

---

## 🏛️ 姊妹中枢联动

* **全舰队 Drupal 运维编排**：[seekkey/drupal-ops](https://gitea.capitaltrain.cn/seekkey/drupal-ops)
* **常规赛 Astro 前端应用**：`Seek-Key-LTD/astro-drupal`
* **季后赛播客脚本正典**：`Seek-Key-LTD/kunpengzhi-podcast`
