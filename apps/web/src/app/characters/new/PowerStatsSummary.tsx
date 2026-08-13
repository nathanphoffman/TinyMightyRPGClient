"use client";

import { useWatch } from "react-hook-form";
import type { CharacterFormControl } from "./types";

export function PowerStatsSummary({ control }: { control: CharacterFormControl }) {
  const powerOptions = useWatch({ control, name: "powerOptions" });
  const attackBonusPicks = powerOptions?.filter((o) => o.type === "attackBonus").length ?? 0;
  const defenseBonusPicks = powerOptions?.filter((o) => o.type === "defenseBonus").length ?? 0;
  const specialPowerPicks = powerOptions?.filter((o) => o.type === "specialPower").length ?? 0;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted p-2 text-center">
        <span className="text-xs text-muted-foreground">Attack bonus</span>
        <span className="text-lg font-semibold">+{attackBonusPicks * 2}</span>
      </div>
      <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted p-2 text-center">
        <span className="text-xs text-muted-foreground">Defense</span>
        <span className="text-lg font-semibold">{defenseBonusPicks > 0 ? 7 : 5}</span>
      </div>
      <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted p-2 text-center">
        <span className="text-xs text-muted-foreground">Powers</span>
        <span className="text-lg font-semibold">{specialPowerPicks}</span>
      </div>
    </div>
  );
}
