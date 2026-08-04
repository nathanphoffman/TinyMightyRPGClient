import type { AppType } from "api-hono";
import { hc } from "hono/client";
import { env } from "../env";

// hono/client infers every route's request/response types directly from
// api-hono's exported AppType — no OpenAPI spec or codegen step needed.
export const honoClient = hc<AppType>(env.NEXT_PUBLIC_HONO_API_URL);
