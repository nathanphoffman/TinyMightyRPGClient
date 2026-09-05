export interface DiceRoll {
  /** One entry per d6 rolled — 2 for a skill/attack check, 1–3 for a power. */
  dice: number[];
  /** Modifier added to the raw dice — a skill/attack score, or 0. */
  modifier: number;
  /** What was rolled, e.g. "Wits" or a power name. Null for a plain 2d6. */
  label: string | null;
  /** dice sum + modifier. */
  total: number;
  /** Increments per roll so the UI can re-trigger its animation on a repeat result. */
  id: number;
}

interface RollOptions {
  /** How many d6 to roll. Defaults to 2. */
  count?: number;
  modifier?: number;
  label?: string | null;
}

let rollCount = 0;

function d6(): number {
  return 1 + Math.floor(Math.random() * 6);
}

/** Roll some d6 (2 by default), optionally adding a modifier and a label. */
export function rollDice({ count = 2, modifier = 0, label = null }: RollOptions = {}): DiceRoll {
  const dice = Array.from({ length: count }, d6);
  rollCount += 1;
  return {
    dice,
    modifier,
    label,
    total: dice.reduce((sum, die) => sum + die, 0) + modifier,
    id: rollCount,
  };
}
