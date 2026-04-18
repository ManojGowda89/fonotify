/**
 * FoNotify
 * Fire Once, Notify Once
 * Backend + Client SDK
 */

import Redis from "ioredis";

type ClientRes = {
  write: (msg: string) => void;
};

const topics: Map<string, Set<ClientRes>> = new Map();

let initialized = false;

let redisPub: Redis | null = null;
let redisSub: Redis | null = null;

/* =========================
   🔥 NOTIFY (GLOBAL)
========================= */

export function notify(topic: string): void {
  // 🔴 Redis mode
  if (redisPub) {
    redisPub.publish("fono", topic);
    return;
  }

  // 🟢 Local mode
  const clients = topics.get(topic);
  if (!clients || clients.size === 0) return;

  const msg = `data: ${JSON.stringify({ update: true })}\n\n`;

  clients.forEach((res) => res.write(msg));
}

/* =========================
   📡 REDIS SUBSCRIBER
========================= */

function setupRedis(redisUrl: string) {
  redisPub = new Redis(redisUrl);
  redisSub = new Redis(redisUrl);

  redisSub.subscribe("fono");

  redisSub.on("message", (_channel, topic) => {
    const clients = topics.get(topic);
    if (!clients || clients.size === 0) return;

    const msg = `data: ${JSON.stringify({ update: true })}\n\n`;

    clients.forEach((res) => res.write(msg));
  });
}

/* =========================
   🧩 EXPRESS
========================= */

function attachExpress(app: any) {
  app.get("/fono/subscribe/:topic", (req: any, res: any) => {
    const { topic } = req.params;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    if (!topics.has(topic)) topics.set(topic, new Set());
    const clients = topics.get(topic)!;

    clients.add(res);

    req.on("close", () => clients.delete(res));
  });
}

/* =========================
   ⚡ FASTIFY
========================= */

function attachFastify(app: any) {
  app.get("/fono/subscribe/:topic", (req: any, reply: any) => {
    const { topic } = req.params;

    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");

    if (!topics.has(topic)) topics.set(topic, new Set());
    const clients = topics.get(topic)!;

    clients.add(reply.raw);

    req.raw.on("close", () => clients.delete(reply.raw));
  });
}

/* =========================
   ⚡ HONO
========================= */

function attachHono(app: any) {
  app.get("/fono/subscribe/:topic", (c: any) => {
    const topic = c.req.param("topic");

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        const client: ClientRes = {
          write: (msg) =>
            controller.enqueue(encoder.encode(msg)),
        };

        if (!topics.has(topic)) topics.set(topic, new Set());
        const clients = topics.get(topic)!;

        clients.add(client);

        c.req.raw.signal.addEventListener("abort", () => {
          clients.delete(client);
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  });
}

/* =========================
   🚀 INIT
========================= */

export function initFoNotify(app: any, redisUrl?: string) {
  if (initialized) return;

  // 🔴 Auto Redis setup if URL provided
  if (redisUrl) {
    setupRedis(redisUrl);
  }

  if (app?.use && app?.get) attachExpress(app);
  else if (app?.route && app?.get) attachFastify(app);
  else if (app?.fetch) attachHono(app);
  else throw new Error("Unsupported framework");

  // 🔥 heartbeat
  setInterval(() => {
    for (const subs of topics.values()) {
      subs.forEach((res) => res.write(":\n\n"));
    }
  }, 20000);

  initialized = true;
}

/* =========================
   🌐 CLIENT SUBSCRIBE
========================= */

function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return "http://" + url;
  }
  return url;
}

export function subscribe(
  baseURL: string,
  topic: string,
  handler: () => void
) {
  const url = normalizeUrl(baseURL);

  const es = new EventSource(
    `${url}/fono/subscribe/${topic}`
  );

  es.onmessage = () => handler();

  es.onerror = (err) => {
    console.error("FoNotify error:", err);
  };

  return {
    close: () => es.close(),
  };
}