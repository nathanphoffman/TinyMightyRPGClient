import { describe, expect, it } from "vitest";
import { isTokenExpired } from "./auth-store";

/** Builds a token with the shape the API issues — only the `exp` claim matters here. */
function tokenExpiringAt(seconds: number) {
  const payload = btoa(JSON.stringify({ sub: "user-1", email: "a@b.c", exp: seconds }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `header.${payload}.signature`;
}

describe("isTokenExpired", () => {
  it("accepts a token that hasn't run out yet", () => {
    expect(isTokenExpired(tokenExpiringAt(Date.now() / 1000 + 3600))).toBe(false);
  });

  it("rejects a token past its exp", () => {
    expect(isTokenExpired(tokenExpiringAt(Date.now() / 1000 - 1))).toBe(true);
  });

  it("rejects a token with no exp claim, since it can't be checked", () => {
    const payload = btoa(JSON.stringify({ sub: "user-1" }));
    expect(isTokenExpired(`header.${payload}.signature`)).toBe(true);
  });

  it("rejects leftover junk from storage rather than sending it to the API", () => {
    expect(isTokenExpired("not-a-jwt")).toBe(true);
  });
});
