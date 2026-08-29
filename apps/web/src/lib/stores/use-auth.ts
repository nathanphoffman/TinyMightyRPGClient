"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isTokenExpired, useAuthStore } from "./auth-store";

interface Auth {
  /** The token, or null if there isn't one or it has already expired. */
  token: string | null;
  /** False until the persisted token has been read — render a placeholder, not a login prompt. */
  ready: boolean;
}

/**
 * Auth state for a screen that needs a token. An expired token is dropped and the
 * user is sent to /login with an explanation, rather than firing a request that
 * can only come back 401 and leave the page blank.
 */
export function useAuth(): Auth {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const expireSession = useAuthStore((state) => state.expireSession);

  const expired = accessToken !== null && isTokenExpired(accessToken);

  useEffect(() => {
    if (expired) {
      expireSession();
      router.replace("/login");
    }
  }, [expired, expireSession, router]);

  return { token: expired ? null : accessToken, ready: hasHydrated };
}
