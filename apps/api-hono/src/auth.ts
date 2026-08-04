import { jwtVerify } from "jose";

// Shares JWT_SECRET with apps/api-nest so a token issued by the Nest
// domain API's /auth/login is also valid for authenticating this
// gateway's WebSocket connections.
const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret-change-me");

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, secret);
  return { sub: payload.sub as string, email: payload.email as string };
}
