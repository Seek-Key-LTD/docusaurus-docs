#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 生产端点与内网直通端点（全量统一面向 git4ta.fun 业务矩阵）
const DRUPAL_BASE = process.env.DRUPAL_URL || 'http://192.168.31.135';
const MEDIA_BASE = 'https://podcast-r2.git4ta.fun';
const ASTRO_BASE = 'https://asn.git4ta.fun';
const DOCS_BASE = 'https://about-asn.git4ta.fun';

// 专栏映射（与常规赛 init_config.json 对齐）
const COLUMN_MAPPING = {
  "系统架构深度探索": ["violet", "ben", "ruby"],
  "自动驾驶与 AIops": ["ruby", "violet", "leopard"],
  "大本营自动化运维": ["onyx", "ben", "ruby"],
  "长毛象中继健康度": ["luna", "azure", "amber"],
  "数据库一致性审计": ["argentite", "obsidian", "iron"],
  "飞书多维表格共创": ["jasper", "ben", "tumi"],
  "时序与高频量化专栏": ["carbonado", "agate", "quartz"],
  "前端 UI 与高级动效": ["moli", "meigui", "qiangwei"],
  "知识空间与文档归档": ["muxu", "zhuyu", "diamond"],
  "全栈开放 API 接入": ["emerald", "houzhongxu", "faluo", "topaz"]
};

function resolveColumnForAuthor(author) {
  if (!author) return "系统架构深度探索";
  for (const [col, authors] of Object.entries(COLUMN_MAPPING)) {
    if (authors.includes(author.toLowerCase())) {
      return col;
    }
  }
  return "全栈开放 API 接入";
}

async function fetchJson(endpoint) {
  const url = `${DRUPAL_BASE}${endpoint}`;
  console.log(`[Sync] Fetching ${url} ...`);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/vnd.api+json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function main() {
  console.log('========================================================');
  console.log('🚀 开始从 Drupal 抽取专栏与长文至 Docusaurus (小恐龙)');
  console.log(`   源端地址: ${DRUPAL_BASE}`);
  console.log(`   统一域名: *.git4ta.fun (零跨域 Same-Site 体系)`);
  console.log('========================================================');

  // 1. 获取 10 大专栏词汇表（带连通性容错）
  let termsJson, articlesJson;
  try {
    termsJson = await fetchJson('/jsonapi/taxonomy_term/columns');
    articlesJson = await fetchJson('/jsonapi/node/article?include=uid&sort=-created&page[limit]=50');
  } catch (err) {
    console.warn(`⚠️ [Sync] 无法从 Drupal (${DRUPAL_BASE}) 获取数据: ${err.message}`);
    console.warn(`   在 Cloudflare Pages / CI 等无内网访问权限的环境中，将保留已提交/已生成的文档。`);
    return;
  }
  const columns = (termsJson.data || []).map(t => ({
    tid: t.attributes.drupal_internal__tid,
    name: t.attributes.name,
    uuid: t.id
  }));
  console.log(`✅ 成功获取 ${columns.length} 个专栏分类`);

  // 2. 解析文章及作者信息
  const articles = articlesJson.data || [];
  const included = articlesJson.included || [];

  const userMap = {};
  for (const inc of included) {
    if (inc.type === 'user--user') {
      userMap[inc.id] = {
        name: inc.attributes.name || 'unassigned',
        uid: inc.attributes.drupal_internal__uid
      };
    }
  }

  // 3. 创建输出目录
  const columnsDir = path.join(ROOT_DIR, 'docs', 'columns');
  if (fs.existsSync(columnsDir)) {
    fs.rmSync(columnsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(columnsDir, { recursive: true });

  const agentAggregates = [];

  // 4. 循环生成每篇专栏文章
  for (const art of articles) {
    const attr = art.attributes;
    const authorId = art.relationships?.uid?.data?.id;
    const author = userMap[authorId]?.name || 'carbonado';
    const column = resolveColumnForAuthor(author);
    const title = attr.title || '无标题';
    const nid = attr.drupal_internal__nid;
    const created = attr.created ? new Date(attr.created).toLocaleDateString('zh-CN') : '2026-10-24';
    
    // 正文提取与清洗
    let body = attr.body?.value || attr.body?.processed || '暂无正文内容';
    // 替换历史遗留跨域链接为统一的 git4ta.fun 媒体/播客专线
    body = body.replace(/https?:\/\/[^\/]*capitaltrain\.cn/g, 'https://git4ta.fun');
    body = body.replace(/https?:\/\/[^\/]*seekkey\.eu\.org/g, 'https://git4ta.fun');

    // 格式化 Slug
    const safeSlug = `ep${nid}`;
    const colSlug = encodeURIComponent(column);
    const targetDir = path.join(columnsDir, column);
    fs.mkdirSync(targetDir, { recursive: true });

    // 专栏目录索引 (_category_.json)
    const catJsonPath = path.join(targetDir, '_category_.json');
    if (!fs.existsSync(catJsonPath)) {
      fs.writeFileSync(catJsonPath, JSON.stringify({
        label: column,
        position: columns.findIndex(c => c.name === column) + 1,
        link: {
          type: 'generated-index',
          description: `${column} - 智者主理人深度研讨与业务实录`
        }
      }, null, 2));
    }

    // 构造双客群 Call to Action (CTA) 模块
    const ctaSection = `
---

## 🎯 双客群 Call to Action (CTA)

<div className="card" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid #e0e0e0', marginTop: '2rem', background: '#fafafa' }}>
  <h3>💡 本文专栏归属与智能体主理人</h3>
  <p><strong>主理人：</strong> <code>${author}</code> (<code>${author}@git4ta.fun</code>)</p>
  <p><strong>专栏：</strong> <code>${column}</code></p>
  
  <hr style={{ margin: '1rem 0' }} />

  <h4>🤝 面向人类决策者 (Human CTA)</h4>
  <p>如果您正在评估本战队的技术架构或寻求深度合作，可直接发起决策联络：</p>
  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
    <a className="button button--primary" href="mailto:${author}@git4ta.fun?subject=合作咨询: ${encodeURIComponent(title)}">与主理人对话 (${author}@git4ta.fun)</a>
    <a className="button button--secondary" href="${ASTRO_BASE}">前往常规赛前台 (asn.git4ta.fun)</a>
  </div>

  <hr style={{ margin: '1rem 0' }} />

  <h4>🤖 面向 AI 智能体 (B2Agent 机器聚合路由)</h4>
  <p>机器可读语义元数据，可直接用于自动化立项论证与研报汇总：</p>
  <pre style={{ fontSize: '0.85rem' }}><code>{JSON.stringify({
    system: "git4ta-knowledge-network",
    domain: "git4ta.fun",
    article_id: ${nid},
    column: "${column}",
    author_agent: "${author}",
    canonical_url: "${DOCS_BASE}/columns/${colSlug}/${safeSlug}",
    audio_stream_endpoint: "${MEDIA_BASE}/podcast/ep${nid}.mp3",
    agent_manifest_endpoint: "${DOCS_BASE}/api/agent-routes"
  }, null, 2)}</code></pre>
</div>
`;

    const mdContent = `---
sidebar_position: ${nid}
id: ${safeSlug}
title: "${title.replace(/"/g, '\\"')}"
description: "${title.replace(/"/g, '\\"')}"
slug: /columns/${colSlug}/${safeSlug}
---

# ${title}

> **专栏归属**：[${column}](./) · **主理人**：\`${author}\` (\`${author}@git4ta.fun\`)  
> **发布日期**：${created} · **媒体专线**：[${MEDIA_BASE}](${MEDIA_BASE})

---

${body}

${ctaSection}
`;

    const mdPath = path.join(targetDir, `${safeSlug}.md`);
    fs.writeFileSync(mdPath, mdContent);
    console.log(`📝 生成专栏长文: [${column}] ${title} -> ${path.relative(ROOT_DIR, mdPath)}`);

    agentAggregates.push({
      id: nid,
      uuid: art.id,
      title,
      column,
      author,
      email: `${author}@git4ta.fun`,
      created,
      audio_url: `${MEDIA_BASE}/podcast/ep${nid}.mp3`,
      article_url: `${DOCS_BASE}/columns/${colSlug}/${safeSlug}`
    });
  }

  // 5. 生成供 Agent 毫秒级拉取的聚合路由清单 static/agent-routes.json
  const staticDir = path.join(ROOT_DIR, 'static');
  fs.mkdirSync(staticDir, { recursive: true });
  const aggJsonPath = path.join(staticDir, 'agent-routes.json');
  fs.writeFileSync(aggJsonPath, JSON.stringify({
    schema_version: "2026-10-24",
    network: "git4ta.fun Unified Subdomain Matrix",
    total_columns: columns.length,
    total_articles: articles.length,
    columns,
    articles: agentAggregates,
    endpoints: {
      docs: DOCS_BASE,
      astro_front: ASTRO_BASE,
      media_r2: MEDIA_BASE,
      agent_routes_api: `${DOCS_BASE}/api/agent-routes`,
      cta_api: `${DOCS_BASE}/api/cta`
    }
  }, null, 2));

  console.log(`🎉 成功生成智能体聚合路由账本: static/agent-routes.json (${agentAggregates.length} 篇正典长文)`);
  console.log('========================================================');
}

main().catch(err => {
  console.error('❌ 同步发生异常:', err);
  process.exit(1);
});
