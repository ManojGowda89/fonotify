
---

# 🚀 FoNotify

> **FoNotify = Fire Once, Notify Once**

A minimal, ultra-lightweight real-time notification system.

No queues. No storage. No retries.
Just one simple rule:

> **If client is connected → notify**
> **If not → forget**

---

## 📦 NPM

[https://www.npmjs.com/package/fonotify](https://www.npmjs.com/package/fonotify)

---

## ❓ Why FoNotify Exists

Most real-time systems today are **over-engineered**.

To send a simple update, developers often introduce:

* WebSockets
* Message queues (Kafka, RabbitMQ)
* Retry systems
* Persistent storage layers

But many applications don’t need all that.

---

### 🔴 The Real Problem

In most apps, the requirement is simple:

> “Something changed → notify client → client refreshes data”

Yet solving this often leads to **complex infrastructure, higher cost, and maintenance overhead**.

---

## ✅ The FoNotify Approach

FoNotify does **one thing only**:

> **Send a signal, not data**

```txt
Server → notify(userId) → Client → fetch latest data
```

FoNotify **does not transfer data**, it only tells the client:

> “Hey, something changed. You decide what to do.”

---

## 🧠 Core Philosophy

FoNotify is designed for systems where:

* You **don’t need guaranteed delivery**
* You only care about **active/connected users**
* You want **zero infrastructure overhead**
* You prefer **stateless architecture**

---

## ✨ Features

* Real-time notifications (instant)
* Zero memory (no storage, no queue)
* Fire-and-forget architecture
* Works with:

  * Express
  * Fastify
  * Hono
* Built-in lightweight client SDK
* Plug & play integration
* Optional Redis support for scaling
* Extremely low memory footprint

---

## 🔄 How It Works

```txt
Client connects
        ↓
Server triggers event
        ↓
notify(userId)
        ↓
If connected → notify
If not → ignore
```

---

## ⚡ Real Flow (Production Pattern)

```txt
Webhook / DB Change
        ↓
Server logic
        ↓
notify(userId)
        ↓
Client receives signal
        ↓
Client calls API (GET /data)
        ↓
UI updates
```

---

## 📦 Installation

```bash
npm install fonotify
```

---

## 🚀 Backend Usage

---

### Express

```js
import express from "express";
import { initFoNotify, notify } from "fonotify";

const app = express();

initFoNotify(app);

app.post("/update/:userId", (req, res) => {
  notify(req.params.userId);
  res.json({ success: true });
});

app.listen(4000);
```

---

### Fastify

```js
import Fastify from "fastify";
import { initFoNotify, notify } from "fonotify";

const app = Fastify();

initFoNotify(app);

app.post("/update/:userId", async (req) => {
  notify(req.params.userId);
  return { success: true };
});

app.listen({ port: 4000 });
```

---

### Hono

```js
import { Hono } from "hono";
import { initFoNotify, notify } from "fonotify";

const app = new Hono();

initFoNotify(app);

app.post("/update/:userId", (c) => {
  notify(c.req.param("userId"));
  return c.json({ success: true });
});

export default app;
```

---

## 🌐 Frontend Usage

```js
import { useEffect } from "react";
import { subscribe } from "fonotify";

useEffect(() => {
  const sub = subscribe("http://localhost:4000", "user-123", async () => {
    const res = await fetch("/api/data");
    const data = await res.json();
    console.log(data);
  });

  return () => {
    sub.close();
  };
}, []);
```

---

## 🎯 API Reference

---

### `initFoNotify(app, redisUrl?)`

```js
initFoNotify(app);
initFoNotify(app, "redis://localhost:6379");
```

* Initializes FoNotify on your server
* Must be called once
* Supports Express, Fastify, Hono
* Optional Redis URL enables multi-instance scaling

---

### `notify(topic)`

```js
notify("user-123");
```

* Sends `{ update: true }` signal
* If no client is connected → does nothing
* No retries, no storage

---

### `subscribe(url, topic, handler)`

```js
subscribe("http://localhost:4000", "user-123", () => {
  console.log("update received");
});
```

* Opens a live connection
* Triggers handler when notified
* Returns a subscription object with `.close()`

---

## ⚡ Redis Support (Horizontal Scaling)

FoNotify works out of the box in **single-instance mode**.

To scale across multiple servers:

```js
initFoNotify(app, "redis://localhost:6379");
```

### How it works:

```txt
Server 1 ─┐
          ├── Redis Pub/Sub ──► All servers ──► Clients
Server 2 ─┘
```

* Notifications are broadcast across instances
* Clients connected to any server receive updates
* Still stateless (no persistence)

---

## 📊 Behavior

| Scenario         | Result               |
| ---------------- | -------------------- |
| Client connected | Instant notification |
| Client offline   | Ignored              |
| Multiple notify  | Only live delivery   |
| Message storage  | None                 |
| Retry mechanism  | None                 |

---

## 🆚 Comparison

| Feature        | FoNotify | WebSockets | Polling |
| -------------- | -------- | ---------- | ------- |
| Complexity     | Low      | High       | Low     |
| Memory usage   | Low      | High       | High    |
| Infrastructure | Minimal  | Heavy      | Minimal |
| Use case       | Signals  | Streams    | Basic   |

---

## 🎯 When to Use FoNotify

Ideal for:

* Dashboards
* Admin panels
* Notification systems
* Webhook-driven updates
* Stateless APIs
* “Data changed → refresh UI” flows

---

## ⚠️ Limitations

* No persistence
* No delivery guarantees
* Not suitable for:

  * Chat apps
  * Streaming systems
  * Financial/critical systems

---

## 📄 License

MIT License © Manoj Gowda

---

## 🙌 Author

**Manoj Gowda B R**

* Full Stack Developer & DevOps
* Focused on lightweight, scalable systems

🌐 [https://manojgowda.in](https://manojgowda.in)
💻 [https://manojgowda.in/github](https://manojgowda.in/github)

---

## 💡 Final Thought

> Don’t send data.
> **Send signals. Let your APIs handle the rest.**

---
