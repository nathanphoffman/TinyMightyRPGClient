import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * All three are dark panels with light text. `default` (skills) is a flat gray;
 * `hp` and `steel` add a gentle top-to-bottom sheen so the HP / Attack / Defense
 * row reads as its own band above the skills.
 */
export type StatTone = "default" | "hp" | "steel";

const TONE_BOX: Record<StatTone, string> = {
  default: "border-zinc-700 bg-zinc-800 text-white",
  hp: "border-red-800 bg-linear-to-b from-red-600 to-red-700 text-white",
  steel: "border-zinc-700 bg-linear-to-b from-zinc-700 to-zinc-800 text-white",
};

const TONE_LABEL: Record<StatTone, string> = {
  default: "text-white/60",
  hp: "text-white/70",
  steel: "text-white/70",
};

/** Character-sheet style stat square: a small caps label over a large score. */
export function StatBox({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  tone?: StatTone;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 rounded-lg border p-3 text-center",
        TONE_BOX[tone],
      )}
    >
      <span className={cn("text-xs font-medium uppercase tracking-wide", TONE_LABEL[tone])}>
        {label}
      </span>
      <span className="text-3xl font-semibold tabular-nums">{value}</span>
    </div>
  );
}
