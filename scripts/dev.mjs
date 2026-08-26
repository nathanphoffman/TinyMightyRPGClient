#!/usr/bin/env node
import { spawn } from "node:child_process";
import { allocatePorts, SERVICES } from "./dev-ports.mjs";

/**
 * Resolves every service's port up front, then starts Turborepo with the whole
 * map in the environment. Each app reads its own port *and* the addresses of
 * the others from the same source, so a service that had to move is still
 * reachable by everything that talks to it.
 *
 * This is allocation-before-start, not runtime renegotiation: the ports are
 * fixed for the life of the run. If an app crashes and you restart it by hand
 * on a different port, nothing re-propagates — restart `pnpm dev` instead.
 */
const ports = await allocatePorts();

const urls = {
  web: `http://localhost:${ports.web.port}`,
  nest: `http://localhost:${ports.nest.port}`,
  hono: `http://localhost:${ports.hono.port}`,
};

const moved = Object.values(ports).filter((service) => service.moved);

console.log("");
for (const { key } of SERVICES) {
  const service = ports[key];
  const note = service.moved ? `  ← :${service.preferred} was taken` : "";
  console.log(`  ${service.label.padEnd(9)} ${`:${service.port}`.padEnd(6)}${note}`);
}
if (moved.length > 0) {
  console.log(
    `\n  ${moved.length} service${moved.length > 1 ? "s" : ""} moved. Every app has been told the new addresses.`,
  );
}
console.log("");

const child = spawn("pnpm", ["exec", "turbo", "run", "dev", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: {
    ...process.env,
    WEB_PORT: String(ports.web.port),
    NEST_PORT: String(ports.nest.port),
    HONO_PORT: String(ports.hono.port),
    // Baked into the browser bundle, so the client calls the right API even
    // when one of them moved.
    NEXT_PUBLIC_NEST_API_URL: urls.nest,
    NEXT_PUBLIC_HONO_API_URL: urls.hono,
    // Nest builds password-reset links with this.
    APP_WEB_URL: urls.web,
  },
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
