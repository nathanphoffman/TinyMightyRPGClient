"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/lib/stores/use-auth";
import { StatusScreen } from "./status-screen";

interface AuthGateProps {
  /** Rendered only once a token exists; receives it already narrowed to a string. */
  children: (token: string) => ReactNode;
  /** Shown, with a link to /login, when there is no token. */
  message?: string;
}

/**
 * Wraps a screen that needs a signed-in user. While the persisted token is still
 * being read it shows a neutral placeholder rather than a login prompt; with no
 * token it shows `message` and a way to log in. This is the one place the
 * `!ready` / `!token` pair lives — pages inside the gate get a guaranteed token.
 */
export function AuthGate({ children, message = "Log in to continue." }: AuthGateProps) {
  const { token, ready } = useAuth();

  if (!ready) {
    return <StatusScreen>Loading…</StatusScreen>;
  }

  if (!token) {
    return <StatusScreen action={{ href: "/login", label: "Log in" }}>{message}</StatusScreen>;
  }

  return <>{children(token)}</>;
}
