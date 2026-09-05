import type { HitPoints } from "@tmrpg/schemas";
import { StatBox } from "./StatBox";

interface CharacterStatsProps {
  hitPoints: HitPoints;
  attackBonus: number;
  defense: number;
}

/** Top-of-sheet vitals: HP, attack bonus, defense. */
export function CharacterStats({ hitPoints, attackBonus, defense }: CharacterStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatBox
        label="HP"
        tone="hp"
        value={
          <>
            {hitPoints.current}
            <span className="text-lg font-normal text-white/60">/{hitPoints.max}</span>
          </>
        }
      />
      <StatBox label="Attack" tone="steel" value={`+${attackBonus}`} />
      <StatBox label="Defense" tone="steel" value={defense} />
    </div>
  );
}
