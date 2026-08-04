import { defineConfig } from "vitest/config";

// No unit tests here yet — this package is Prisma re-exports and a
// client singleton, nothing worth unit testing on its own.
export default defineConfig({
  test: {
    passWithNoTests: true,
  },
});
