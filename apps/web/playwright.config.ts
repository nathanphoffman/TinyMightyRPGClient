import { defineConfig } from "@playwright/test";

// Follows the port scripts/dev.mjs allocated, so e2e still targets the right
// server when :3000 was taken and web had to move. Defaults to 3000 when the
// suite is run on its own.
const port = Number(process.env.WEB_PORT ?? 3000);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: "pnpm dev",
    url: baseURL,
    reuseExistingServer: true,
  },
  use: {
    baseURL,
  },
});
