interface Env {
  NEXTJS_APP_URL: string;
  CRON_SECRET: string;
}

export default {
  async scheduled(
    _event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    ctx.waitUntil(
      triggerPost(env).catch((err) => {
        console.error("[cron] triggerPost failed:", err);
      })
    );
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    return triggerPost(env);
  },
} satisfies ExportedHandler<Env>;

async function triggerPost(env: Env): Promise<Response> {
  const url = `${env.NEXTJS_APP_URL}/api/cron/telegram`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.CRON_SECRET}`,
    },
  });

  const body = await response.text();
  console.log(`[cron] POST ${url} -> ${response.status}: ${body}`);

  return new Response(body, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
