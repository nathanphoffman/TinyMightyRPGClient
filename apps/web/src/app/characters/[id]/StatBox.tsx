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

interface StatBoxProps {
  label: string;
  value: ReactNode;
  tone?: StatTone;
  /** When set, the box becomes a button — used for stats you can roll against. */
  onClick?: () => void;
}

/** Character-sheet style stat square: a small caps label over a large score. */
export function StatBox({ label, value, tone = "default", onClick }: StatBoxProps) {
  const box = cn(
    "flex flex-col items-center gap-1 rounded-lg border p-3 text-center",
    TONE_BOX[tone],
  );

  const content = (
    <>
      <span className={cn("text-xs font-medium uppercase tracking-wide", TONE_LABEL[tone])}>
        {label}
      </span>
      <span className="text-3xl font-semibold tabular-nums">{value}</span>
    </>
  );

  if (!onClick) {
    return <div className={box}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        box,
        "transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]",
      )}
    >
      {content}
    </button>
  );
}
