// Cloudflare Pages Function: 运行于 Cloudflare Edge Workers 边缘网络
// 路由: https://about-asn.git4ta.fun/api/agent-routes
// 职责: 为 AI Agent 提供高信息密度的结构化聚合路由，完全处于 *.git4ta.fun 域内，零跨域摩擦

export async function onRequestGet(context: any): Promise<Response> {
  const url = new URL(context.request.url);
  const origin = url.origin;

  try {
    // 优先读取同源静态资产 agent-routes.json
    const assetRes = await context.env.ASSETS.fetch(new URL('/agent-routes.json', origin));
    if (assetRes.ok) {
      const data = await assetRes.json();
      return new Response(JSON.stringify(data, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=60, s-maxage=300',
          'X-Powered-By': 'Cloudflare-Pages-Functions',
          'X-Network-Zone': 'git4ta.fun'
        }
      });
    }
  } catch (err: any) {
    // 回退兜底响应
  }

  // 兜底动态响应
  return new Response(
    JSON.stringify({
      status: "online",
      network: "git4ta.fun Unified Content Matrix",
      subdomains: {
        knowledge: "about-asn.git4ta.fun",
        astro_front: "asn.git4ta.fun",
        podcast_r2: "podcast-r2.git4ta.fun",
        media_r2: "r2.git4ta.fun"
      },
      message: "Agent aggregation routes active."
    }, null, 2),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}
