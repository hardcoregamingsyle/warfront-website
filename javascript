// worker.js
export default {
  async fetch(request, env) {
    // Auth check
    const authHeader = request.headers.get("Authorization") || "";
    const workerToken = request.headers.get("X-Worker-Token") || "";
    const token = authHeader.replace("Bearer ", "") || workerToken;

    if (!env.WORKER_SECRET_TOKEN || token !== env.WORKER_SECRET_TOKEN) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    if (!key) {
      return new Response(JSON.stringify({ error: "Missing key param" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (request.method === "GET") {
      const value = await env.CARD_KV.get(key);
      if (value === null) {
        return new Response(JSON.stringify({ error: "Not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(value, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (request.method === "PUT") {
      const body = await request.json();
      const value = body.value ?? body;
      await env.CARD_KV.put(key, JSON.stringify(value));
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (request.method === "DELETE") {
      await env.CARD_KV.delete(key);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  },
};
