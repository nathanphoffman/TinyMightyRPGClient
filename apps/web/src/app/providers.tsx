"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ApiError } from "@/lib/api/nest-client";
import { useAuthStore } from "@/lib/stores/auth-store";

/**
 * A 401 from the API means the token is gone for good — expired, or signed with a
 * secret the API no longer uses. Drop it so the next render sends the user to
 * /login instead of retrying with a credential that can't work.
 *
 * The auth routes are exempt: a 401 from /auth/login is a wrong password, not a
 * dead session, and it's already reported on the form.
 */
function handleApiError(error: unknown) {
  if (error instanceof ApiError && error.status === 401 && !error.path.startsWith("/auth/")) {
    useAuthStore.getState().expireSession();
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: handleApiError }),
        mutationCache: new MutationCache({ onError: handleApiError }),
      }),
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
