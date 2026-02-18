interface Env {
  BUCKET: R2Bucket;
  ALLOWED_ORIGINS: string;
  UPLOAD_SECRET: string;
}

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get("Origin") ?? "";
  const allowed = env.ALLOWED_ORIGINS.split(",").map((s) => s.trim());
  const match = allowed.includes(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": match,
    "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Upload-Secret",
    "Access-Control-Max-Age": "300",
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const key = url.pathname.slice(1); // remove leading /

    if (!key) {
      return new Response("Key required", { status: 400, headers: cors });
    }

    // GET — public read
    if (request.method === "GET") {
      const object = await env.BUCKET.get(key);
      if (!object) {
        return new Response("Not found", { status: 404, headers: cors });
      }
      const headers = new Headers(cors);
      object.writeHttpMetadata(headers);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      return new Response(object.body, { headers });
    }

    // Auth check for write operations
    const secret = request.headers.get("X-Upload-Secret");
    if (secret !== env.UPLOAD_SECRET) {
      return new Response("Unauthorized", { status: 401, headers: cors });
    }

    // PUT — upload
    if (request.method === "PUT") {
      const contentType = request.headers.get("Content-Type") ?? "application/octet-stream";
      await env.BUCKET.put(key, request.body, {
        httpMetadata: { contentType },
      });
      return new Response(JSON.stringify({ key }), {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // DELETE — remove
    if (request.method === "DELETE") {
      await env.BUCKET.delete(key);
      return new Response(JSON.stringify({ deleted: key }), {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405, headers: cors });
  },
} satisfies ExportedHandler<Env>;
