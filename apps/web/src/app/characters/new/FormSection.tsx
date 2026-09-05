import type * as React from "react";
import { cn } from "@/lib/utils";

// Each create-character section renders as its own bordered block so the
// sections stay readable when the form splits into side-by-side columns.
export function FormSection({
  title,
  description,
  action,
  error,
  className,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-card/50 p-4", className)}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="text-xl font-medium">{title}</p>
        {action}
      </div>
      {description && <p className="mb-3 text-sm text-muted-foreground">{description}</p>}
      {children}
      {error && <p className="mt-2 text-base text-destructive">{error}</p>}
    </section>
  );
}