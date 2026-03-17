export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    // Auth check
    const authHeader = request.headers.get("Authorization") || "";
    const workerToken = request.headers.get("X-Worker-Token") || "";
    const incomingToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : workerToken;

    if (!env.WORKER_SECRET_TOKEN || incomingToken !== env.WORKER_SECRET_TOKEN) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!key) {
      return new Response(JSON.stringify({ error: "Missing key parameter" }), {
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
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const valueToStore = body.value ?? body;
      await env.CARD_KV.put(key, JSON.stringify(valueToStore));
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
