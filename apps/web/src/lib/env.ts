import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_NEST_API_URL: z.url().default("http://localhost:3001"),
    NEXT_PUBLIC_HONO_API_URL: z.url().default("http://localhost:3002"),
  },
  runtimeEnv: {
    NEXT_PUBLIC_NEST_API_URL: process.env.NEXT_PUBLIC_NEST_API_URL,
    NEXT_PUBLIC_HONO_API_URL: process.env.NEXT_PUBLIC_HONO_API_URL,
  },
});
