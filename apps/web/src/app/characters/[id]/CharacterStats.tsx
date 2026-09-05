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
        value={
          <>
            {hitPoints.current}
            <span className="text-lg font-normal text-muted-foreground">/{hitPoints.max}</span>
          </>
        }
      />
      <StatBox label="Attack" value={`+${attackBonus}`} />
      <StatBox label="Defense" value={defense} />
    </div>
  );
}
