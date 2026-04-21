/**
 * FoNotify server runtime.
 */

type ClientRes = {
  write: (msg: string) => void;
};

const topics: Map<string, Set<ClientRes>> = new Map();

let initialized = false;

type RedisLike = {
  publish: (channel: string, message: string) => void;
  subscribe: (channel: string) => void;
  on: (event: "message", listener: (channel: string, topic: string) => void) => void;
};

let redisPub: RedisLike | null = null;
let redisSub: RedisLike | null = null;

export function notify(topic: string): void {
  if (redisPub) {
    redisPub.publish("fono", topic);
    return;
  }

  const clients = topics.get(topic);
  if (!clients || clients.size === 0) return;

  const msg = `data: ${JSON.stringify({ update: true })}\n\n`;
  clients.forEach((res) => res.write(msg));
}

async function setupRedis(redisUrl: string): Promise<void> {
  const imported = await import("ioredis");
  const RedisCtor = (imported.default ?? imported) as unknown as new (url: string) => RedisLike;

  redisPub = new RedisCtor(redisUrl);
  redisSub = new RedisCtor(redisUrl);

  redisSub.subscribe("fono");

  redisSub.on("message", (_channel, topic) => {
    const clients = topics.get(topic);
    if (!clients || clients.size === 0) return;

    const msg = `data: ${JSON.stringify({ update: true })}\n\n`;
    clients.forEach((res) => res.write(msg));
  });
}

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

function attachHono(app: any) {
  app.get("/fono/subscribe/:topic", (c: any) => {
    const topic = c.req.param("topic");

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        const client: ClientRes = {
          write: (msg) => controller.enqueue(encoder.encode(msg)),
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

export function initFoNotify(app: any, redisUrl?: string) {
  if (initialized) return;

  if (redisUrl) {
    void setupRedis(redisUrl).catch((err) => {
      console.error(
        "FoNotify: Redis mode requested but ioredis is unavailable or failed to initialize.",
        err
      );
    });
  }

  if (app?.use && app?.get) attachExpress(app);
  else if (app?.route && app?.get) attachFastify(app);
  else if (app?.fetch) attachHono(app);
  else throw new Error("Unsupported framework");

  setInterval(() => {
    for (const subs of topics.values()) {
      subs.forEach((res) => res.write(":\n\n"));
    }
  }, 20000);

  initialized = true;
}