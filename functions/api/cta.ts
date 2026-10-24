// Cloudflare Pages Function: 运行于 Cloudflare Edge Workers 边缘网络
// 路由: https://about-asn.git4ta.fun/api/cta
// 职责: 承载 Human 决策者与 AI Agent 的 CTA 动作，零跨域直收

export async function onRequestPost(context: any): Promise<Response> {
  try {
    const body = await context.request.json().catch(() => ({}));
    const { action, author, article_id, email, note } = body;

    console.log(`[CTA] Received action=${action} for author=${author}, article=${article_id}`);

    // 返回成功确认包
    return new Response(
      JSON.stringify({
        success: true,
        action: action || "lead_capture",
        timestamp: new Date().toISOString(),
        network_zone: "git4ta.fun",
        assigned_agent: author ? `${author}@git4ta.fun` : "partner@git4ta.fun",
        message: "感谢您的决策联络！主理人已收到您的协同请求。"
      }, null, 2),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
