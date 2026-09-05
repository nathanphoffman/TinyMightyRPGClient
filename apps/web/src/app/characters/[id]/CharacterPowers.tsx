"use client";

import type { Power, PowerCategory, PowerDiceType } from "@tmrpg/schemas";
import { type KeyboardEvent, useState } from "react";
import { cn } from "@/lib/utils";

const POWER_CATEGORY_LABELS: Record<PowerCategory, string> = {
  attack: "Attack",
  heal: "Heal",
  nonAttack: "Non-Attack",
};

const POWER_DICE_LABELS: Record<PowerDiceType, string> = {
  multiTarget: "Multi-Target (3d6)",
  directTarget: "Direct-Target (2d6)",
  areaOfEffect: "Area of Effect (1d6)",
};

const POWER_DICE_COUNT: Record<PowerDiceType, number> = {
  multiTarget: 3,
  directTarget: 2,
  areaOfEffect: 1,
};

interface CharacterPowersProps {
  powers: Power[];
  /** Roll `count` d6 (no modifier) for a power, labelled with its name. */
  onRollPower: (count: number, label: string) => void;
}

/**
 * Special powers list. Each power shows one checkbox per max use — checked means
 * that charge is spent. Boxes can be toggled by hand; clicking anywhere on a
 * rollable power spends its first free charge and rolls its dice. A power with
 * every charge spent is greyed out and does nothing on click.
 *
 * Charge state is local to this component (seeded from `usesUsed`) and is not
 * persisted — a reload starts the powers fresh.
 */
export function CharacterPowers({ powers, onRollPower }: CharacterPowersProps) {
  const [spent, setSpent] = useState<Record<string, boolean[]>>(() =>
    Object.fromEntries(
      powers.map((power) => [
        power.id,
        Array.from({ length: power.usesMax }, (_, i) => i < power.usesUsed),
      ]),
    ),
  );

  if (powers.length === 0) return null;

  const toggle = (powerId: string, index: number) => {
    setSpent((prev) => {
      const next = (prev[powerId] ?? []).slice();
      next[index] = !next[index];
      return { ...prev, [powerId]: next };
    });
  };

  const castPower = (power: Power) => {
    if (!power.diceType) return;
    const charges = spent[power.id] ?? [];
    const free = charges.findIndex((isSpent) => !isSpent);
    if (free === -1) return; // no charge to expend — refuse the roll
    toggle(power.id, free);
    onRollPower(POWER_DICE_COUNT[power.diceType], power.name);
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium">Powers</p>
      <div className="flex flex-col gap-2">
        {powers.map((power) => {
          const charges = spent[power.id] ?? [];
          const remaining = charges.filter((isSpent) => !isSpent).length;
          const rollable = Boolean(power.diceType);
          const canCast = rollable && remaining > 0;

          return (
            <div
              key={power.id}
              className={cn(
                "rounded-lg border border-border p-2 text-sm",
                rollable &&
                  "transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                canCast && "cursor-pointer hover:border-primary hover:bg-accent",
                rollable && !canCast && "opacity-50",
              )}
              {...(rollable
                ? {
                    role: "button",
                    tabIndex: 0,
                    "aria-disabled": !canCast,
                    onClick: () => castPower(power),
                    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        castPower(power);
                      }
                    },
                  }
                : {})}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{power.name}</p>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {POWER_CATEGORY_LABELS[power.category]}
                  {power.diceType && ` · ${POWER_DICE_LABELS[power.diceType]}`}
                </span>
              </div>

              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {remaining}/{charges.length} left
                </span>
                <span className="flex gap-1">
                  {charges.map((isSpent, index) => (
                    <input
                      // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length charge list, order stable
                      key={index}
                      type="checkbox"
                      checked={isSpent}
                      onChange={() => toggle(power.id, index)}
                      onClick={(event) => event.stopPropagation()}
                      aria-label={`${power.name} charge ${index + 1}${isSpent ? ", spent" : ""}`}
                      className="size-4 accent-primary"
                    />
                  ))}
                </span>
              </div>

              {power.description && (
                <p className="mt-1 text-xs text-muted-foreground">{power.description}</p>
              )}
              {power.restriction && (
                <p className="mt-1 text-xs italic text-muted-foreground">
                  Restriction: {power.restriction} — may reroll a single die (GM approval).
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
