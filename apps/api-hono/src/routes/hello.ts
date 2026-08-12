import type { Hono } from "hono";

export function registerHelloRoute(app: Hono) {
  app.get("/hello", (c) => c.json({ message: "Hello, world!" }));
}
