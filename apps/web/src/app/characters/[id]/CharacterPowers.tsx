import type { Power } from "@tmrpg/schemas";

const POWER_CATEGORY_LABELS: Record<string, string> = {
  attack: "Attack",
  heal: "Heal",
  nonAttack: "Non-Attack",
};

const POWER_DICE_LABELS: Record<string, string> = {
  multiTarget: "Multi-Target (3d6)",
  directTarget: "Direct-Target (2d6)",
  areaOfEffect: "Area of Effect (1d6)",
};

/** Special powers list. Renders nothing when the character has no powers. */
export function CharacterPowers({ powers }: { powers: Power[] }) {
  if (powers.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-sm font-medium">Powers</p>
      <div className="flex flex-col gap-2">
        {powers.map((power) => (
          <div key={power.id} className="rounded-lg border border-border p-2 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium">{power.name}</p>
              <span className="text-xs text-muted-foreground">
                {POWER_CATEGORY_LABELS[power.category]}
                {power.diceType && ` · ${POWER_DICE_LABELS[power.diceType]}`}
                {` · ${power.usesUsed}/${power.usesMax} uses`}
              </span>
            </div>
            {power.description && (
              <p className="text-xs text-muted-foreground">{power.description}</p>
            )}
            {power.restriction && (
              <p className="mt-1 text-xs italic text-muted-foreground">
                Restriction: {power.restriction} — may reroll a single die (GM approval).
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
