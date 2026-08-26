import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { registerHelloRoute } from "./routes/hello.js";
import { registerSessionGateway } from "./ws/session-gateway.js";

const app = new Hono();
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app.use("*", cors());

app.get("/health", (c) => c.json({ status: "ok" }));

registerHelloRoute(app);
registerSessionGateway(app, upgradeWebSocket);

// HONO_PORT is set by scripts/dev.mjs, which allocates ports for every
// service together; PORT is the standalone fallback.
const port = Number(process.env.HONO_PORT ?? process.env.PORT ?? 3002);

const server = serve({ fetch: app.fetch, port }, (info) => {
  console.log(`api-hono listening on http://localhost:${info.port}`);
});

injectWebSocket(server);

export type AppType = typeof app;
