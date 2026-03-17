export default {
  async fetch(request, env) {
    // Auth check
    const token = request.headers.get("X-Worker-Token") ||
                  (request.headers.get("Authorization") || "").replace("Bearer ", "");

    if (!token || token !== env.WORKER_SECRET_TOKEN) {
      return new Response("Unauthorized", { status: 401 });
    }

    const url = new URL(request.url);
    // Key comes from query param ?key=cards/xxx/detail.json
    const key = url.searchParams.get("key");

    if (!key) {
      return new Response("Missing key", { status: 400 });
    }

    if (request.method === "GET") {
      const object = await env.R2_BUCKET.get(key);
      if (!object) {
        return new Response("Not Found", { status: 404 });
      }
      const text = await object.text();
      return new Response(text, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (request.method === "PUT") {
      const body = await request.json();
      const value = body.value ?? body;
      await env.R2_BUCKET.put(key, JSON.stringify(value), {
        httpMetadata: { contentType: "application/json" },
      });
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (request.method === "DELETE") {
      await env.R2_BUCKET.delete(key);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Method Not Allowed", { status: 405 });
  },
};
