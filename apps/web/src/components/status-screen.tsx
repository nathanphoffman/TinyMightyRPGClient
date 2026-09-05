import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface StatusScreenAction {
  href: Route;
  label: string;
  /** Defaults to the primary button style. */
  variant?: "default" | "outline";
}

/**
 * Full-height centered message shown while a page can't render its real content
 * yet — auth still hydrating, logged out, loading, or failed to load. The
 * optional action renders a link-styled button beneath the message.
 */
export function StatusScreen({
  children,
  action,
}: {
  children: ReactNode;
  action?: StatusScreenAction;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-16">
      <p className="text-muted-foreground">{children}</p>
      {action && (
        <Button asChild variant={action.variant}>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </main>
  );
}
