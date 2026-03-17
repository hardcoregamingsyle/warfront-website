function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    status: init.status ?? 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init.headers ?? {}),
    },
  });
}

function getToken(request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  const workerToken = request.headers.get("X-Worker-Token");
  if (workerToken) {
    return workerToken.trim();
  }

  return null;
}

function isAuthorized(request, env) {
  const expected = env.WORKER_SECRET_TOKEN;
  if (!expected) {
    return false;
  }
  return getToken(request) === expected;
}

export default {
  async fetch(request, env) {
    if (!isAuthorized(request, env)) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (!env.CARD_KV) {
      return new Response("KV binding not configured", { status: 500 });
    }

    const url = new URL(request.url);
    const match = url.pathname.match(/^\/cards\/([^/]+)$/);

    if (!match) {
      return new Response("Not Found", { status: 404 });
    }

    const key = url.searchParams.get("key");
    if (!key) {
      return new Response("Missing key", { status: 400 });
    }

    if (request.method === "GET") {
      const value = await env.CARD_KV.get(key, "text");
      if (value === null) {
        return new Response("Not Found", { status: 404 });
      }

      return new Response(value, {
        status: 200,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        },
      });
    }

    if (request.method === "PUT") {
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response("Invalid JSON", { status: 400 });
      }

      if (!body || typeof body !== "object" || !("value" in body)) {
        return new Response("Missing value", { status: 400 });
      }

      await env.CARD_KV.put(key, JSON.stringify(body.value));

      return json({
        ok: true,
        key,
        customId: decodeURIComponent(match[1]),
      });
    }

    if (request.method === "DELETE") {
      await env.CARD_KV.delete(key);

      return json({
        ok: true,
        key,
        customId: decodeURIComponent(match[1]),
        deleted: true,
      });
    }

    return new Response("Method Not Allowed", {
      status: 405,
      headers: {
        Allow: "GET, PUT, DELETE",
      },
    });
  },
};
