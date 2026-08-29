import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  /**
   * False until `persist` has read localStorage, which happens after the first
   * render. Guards on `accessToken` alone would see `null` on that first pass
   * and bounce a logged-in user to /login.
   */
  hasHydrated: boolean;
  /** Set when a token is dropped for being expired or rejected, so /login can say why. */
  sessionExpired: boolean;
  setAccessToken: (token: string | null) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  expireSession: () => void;
  logout: () => void;
}

/** Reads `exp` out of a JWT without verifying it — the API is the only thing that can do that. */
function decodeExpiry(token: string): number | null {
  const payload = token.split(".")[1];
  if (!payload) {
    return null;
  }
  try {
    const claims = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof claims.exp === "number" ? claims.exp : null;
  } catch {
    return null;
  }
}

/** A token we can't parse is unusable, so treat it the same as an expired one. */
export function isTokenExpired(token: string): boolean {
  const exp = decodeExpiry(token);
  return exp === null || exp * 1000 <= Date.now();
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      hasHydrated: false,
      sessionExpired: false,
      setAccessToken: (accessToken) => set({ accessToken, sessionExpired: false }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      expireSession: () => set({ accessToken: null, sessionExpired: true }),
      logout: () => set({ accessToken: null, sessionExpired: false }),
    }),
    {
      name: "tmrpg-auth",
      // Only the token belongs in storage; the other two describe this tab.
      partialize: (state) => ({ accessToken: state.accessToken }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
