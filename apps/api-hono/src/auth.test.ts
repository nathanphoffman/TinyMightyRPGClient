import { SignJWT } from "jose";
import { beforeAll, describe, expect, it } from "vitest";
import { verifyAccessToken } from "./auth.js";

const secret = new TextEncoder().encode("dev-secret-change-me");

describe("verifyAccessToken", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "dev-secret-change-me";
  });

  it("verifies a token signed with the shared secret", async () => {
    const token = await new SignJWT({ email: "gm@example.com" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("user-1")
      .setExpirationTime("1h")
      .sign(secret);

    const payload = await verifyAccessToken(token);
    expect(payload.sub).toBe("user-1");
    expect(payload.email).toBe("gm@example.com");
  });

  it("rejects a token signed with the wrong secret", async () => {
    const wrongSecret = new TextEncoder().encode("not-the-secret");
    const token = await new SignJWT({ email: "gm@example.com" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("user-1")
      .setExpirationTime("1h")
      .sign(wrongSecret);

    await expect(verifyAccessToken(token)).rejects.toThrow();
  });
});
