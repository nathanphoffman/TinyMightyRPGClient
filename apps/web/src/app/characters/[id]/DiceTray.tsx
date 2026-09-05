"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DiceRoll } from "./dice";

/** 3×3 pip positions (0 = top-left … 8 = bottom-right) lit for each face. */
const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function Die({ value }: { value: number }) {
  const lit = PIPS[value] ?? [];
  return (
    <span className="grid size-8 grid-cols-3 grid-rows-3 gap-0.5 rounded-md border border-zinc-700 bg-zinc-800 p-1">
      {Array.from({ length: 9 }, (_, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed 9-cell grid, order never changes
          key={i}
          className={cn("rounded-full", lit.includes(i) ? "bg-white" : "bg-transparent")}
        />
      ))}
    </span>
  );
}

interface DiceTrayProps {
  roll: DiceRoll | null;
  /** Roll a plain 2d6 (the button). Skill rolls come in via the `roll` prop. */
  onRoll: () => void;
}

/** A 2d6 roller: the "Roll" button plus a readout of the most recent result. */
export function DiceTray({ roll, onRoll }: DiceTrayProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted p-3">
      {roll ? (
        <div
          key={roll.id}
          className="flex items-center gap-3 duration-200 animate-in fade-in slide-in-from-left-1"
        >
          <span className="flex gap-1.5">
            <Die value={roll.dice[0]} />
            <Die value={roll.dice[1]} />
          </span>
          <span className="text-sm tabular-nums text-muted-foreground">
            {roll.dice[0]} + {roll.dice[1]}
            {roll.modifier !== 0 &&
              ` ${roll.modifier > 0 ? "+" : "−"} ${Math.abs(roll.modifier)}`}
            {roll.label && <span className="not-tabular-nums"> · {roll.label}</span>}
          </span>
          <span className="text-2xl font-semibold tabular-nums">= {roll.total}</span>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Roll 2d6, or tap a skill to add its modifier.
        </p>
      )}
      <Button size="sm" onClick={onRoll}>
        Roll
      </Button>
    </div>
  );
}
