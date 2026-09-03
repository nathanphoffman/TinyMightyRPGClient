import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// RTL only auto-registers cleanup when vitest runs with `globals: true`, which
// this project doesn't. Without it, renders leak across tests in the same file.
afterEach(cleanup);
