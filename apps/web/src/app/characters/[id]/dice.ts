export interface DiceRoll {
  /** Face value of each of the two d6. */
  dice: [number, number];
  /** Modifier added to the raw 2d6 — a skill score, or 0 for a plain roll. */
  modifier: number;
  /** What was rolled, e.g. "Wits". Null for a plain 2d6. */
  label: string | null;
  /** dice sum + modifier. */
  total: number;
  /** Increments per roll so the UI can re-trigger its animation on a repeat result. */
  id: number;
}

let rollCount = 0;

function d6(): number {
  return 1 + Math.floor(Math.random() * 6);
}

/** Roll 2d6, optionally adding a modifier and tagging what it was for. */
export function rollDice(modifier = 0, label: string | null = null): DiceRoll {
  const dice: [number, number] = [d6(), d6()];
  rollCount += 1;
  return {
    dice,
    modifier,
    label,
    total: dice[0] + dice[1] + modifier,
    id: rollCount,
  };
}
