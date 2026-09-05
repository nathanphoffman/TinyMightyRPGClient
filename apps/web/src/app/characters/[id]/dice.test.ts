import { afterEach, describe, expect, it, vi } from "vitest";
import { rollDice } from "./dice";

afterEach(() => vi.restoreAllMocks());

describe("rollDice", () => {
  it("rolls two d6 in range and totals them with no modifier", () => {
    const result = rollDice();

    expect(result.dice).toHaveLength(2);
    for (const die of result.dice) {
      expect(die).toBeGreaterThanOrEqual(1);
      expect(die).toBeLessThanOrEqual(6);
    }
    expect(result.modifier).toBe(0);
    expect(result.label).toBeNull();
    expect(result.total).toBe(result.dice.reduce((sum, die) => sum + die, 0));
  });

  it("adds the modifier to the total and keeps the label", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // each d6 -> 1

    const result = rollDice({ modifier: 2, label: "Wits" });

    expect(result.dice).toEqual([1, 1]);
    expect(result.modifier).toBe(2);
    expect(result.label).toBe("Wits");
    expect(result.total).toBe(4);
  });

  it("rolls the requested number of dice for a power", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // each d6 -> 1

    const result = rollDice({ count: 3, label: "Fireball" });

    expect(result.dice).toEqual([1, 1, 1]);
    expect(result.total).toBe(3);
    expect(result.label).toBe("Fireball");
  });

  it("gives each roll a fresh id", () => {
    expect(rollDice().id).not.toBe(rollDice().id);
  });
});
