import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

// Nest relies on emitDecoratorMetadata for constructor-based DI, which
// esbuild (Vite/Vitest's default transform) doesn't support. Swapping
// in SWC's decorator transform keeps `reflect-metadata` working under test.
export default defineConfig({
  test: {
    root: "./",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  plugins: [swc.vite()],
});
