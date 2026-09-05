import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthGate } from "./auth-gate";

const useAuth = vi.fn();
vi.mock("@/lib/stores/use-auth", () => ({ useAuth: () => useAuth() }));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

afterEach(() => useAuth.mockReset());

const child = (token: string) => <p>signed in as {token}</p>;

describe("AuthGate", () => {
  it("shows a neutral placeholder while the token is still being read", () => {
    useAuth.mockReturnValue({ token: null, ready: false });
    render(<AuthGate>{child}</AuthGate>);

    expect(screen.getByText("Loading…")).toBeInTheDocument();
    expect(screen.queryByText(/signed in/)).not.toBeInTheDocument();
  });

  it("prompts for login with the given message and a link when there is no token", () => {
    useAuth.mockReturnValue({ token: null, ready: true });
    render(<AuthGate message="Log in before editing a character.">{child}</AuthGate>);

    expect(screen.getByText("Log in before editing a character.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
    expect(screen.queryByText(/signed in/)).not.toBeInTheDocument();
  });

  it("renders children with the token once authenticated", () => {
    useAuth.mockReturnValue({ token: "tok-123", ready: true });
    render(<AuthGate>{child}</AuthGate>);

    expect(screen.getByText("signed in as tok-123")).toBeInTheDocument();
  });
});
