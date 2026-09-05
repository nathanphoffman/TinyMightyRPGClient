import type { ReactNode } from "react";

/** Character-sheet style stat square: a small caps label over a large score. */
export function StatBox({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-muted p-3 text-center">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-3xl font-semibold tabular-nums">{value}</span>
    </div>
  );
}
