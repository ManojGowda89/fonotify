# 🚀 FoNotify

> **FoNotify = Fire Once, Notify Once**

A minimal, ultra-lightweight real-time notification system.

No queues. No storage. No retries.
Just one simple rule:

> **If client is connected → notify
> If not → forget**

---

## 📦 NPM

[![npm version](https://img.shields.io/npm/v/fonotify.svg)](https://www.npmjs.com/package/fonotify)
[![npm downloads](https://img.shields.io/npm/dw/fonotify.svg)](https://www.npmjs.com/package/fonotify)
[![license](https://img.shields.io/npm/l/fonotify.svg)](./LICENSE)

---

## ✨ Features

* Real-time notifications
* Zero memory (no storage, no queue)
* Fire-and-forget architecture
* Works with **Express**, **Fastify**, **Hono**
* Built-in client SDK
* Extremely lightweight
* Plug & play

---

## 🧠 Philosophy

FoNotify is designed for **pure notification systems**, where:

* You don’t need delivery guarantees
* You only care about active users
* You want minimum infrastructure cost

---

## 📦 Installation

```bash
npm install fonotify
```

---

## 🚀 Usage

---

### 🔥 Backend Setup

#### Express

```js
import express from "express";
import { initFoNotify, notify } from "fonotify";

const app = express();

initFoNotify(app);

app.post("/update/:userId", (req, res) => {
  const { userId } = req.params;

  notify(userId);

  res.json({ success: true });
});

app.listen(4000);
```

---

#### Fastify

```js
import Fastify from "fastify";
import { initFoNotify, notify } from "fonotify";

const app = Fastify();

initFoNotify(app);

app.post("/update/:userId", async (req) => {
  const { userId } = req.params;

  notify(userId);

  return { success: true };
});

app.listen({ port: 4000 });
```

---

#### Hono

```js
import { Hono } from "hono";
import { initFoNotify, notify } from "fonotify";

const app = new Hono();

initFoNotify(app);

app.post("/update/:userId", (c) => {
  const userId = c.req.param("userId");

  notify(userId);

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
  const sub = subscribe("localhost:4000", "user-123", () => {
    console.log("update received");
  });

  return () => {
    sub.close();
  };
}, []);
```

---

## 🎯 API Reference

---

### `initFoNotify(app)`

```js
initFoNotify(app);
```

* Supports: Express, Fastify, Hono
* Must be called once

---

### `notify(topic)`

```js
notify("user-123");
```

* Sends `{ update: true }`
* No-op if no client is connected

---

### `subscribe(url, topic, handler)`

```js
subscribe("http://localhost:4000", "user-123", () => {
  console.log("update received");
});
```

---

## 🔄 How It Works

```txt
Client connects
        ↓
Server triggers update
        ↓
notify(userId)
        ↓
If connected → notify
If not → ignore
```

---

## 📊 Behavior

| Scenario         | Result               |
| ---------------- | -------------------- |
| Client connected | Instant notification |
| Client offline   | Ignored              |
| Multiple notify  | Live only            |
| Message storage  | None                 |
| Retry mechanism  | None                 |

---

## ⚠️ Limitations

* No persistence
* No delivery guarantee
* Not suitable for critical systems
* Single-instance (in-memory)

---

## 📄 License

MIT License © Manoj Gowda

---

## 🙌 Author

**Manoj Gowda B R**

* Full Stack Developer and Devops 
* Focused on lightweight, scalable systems

🌐 Website: https://manojgowda.in
💻 GitHub: https://manojgowda.in/github

---
