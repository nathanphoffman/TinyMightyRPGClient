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
    expect(result.total).toBe(result.dice[0] + result.dice[1]);
  });

  it("adds the modifier to the total and keeps the label", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // each d6 -> 1

    const result = rollDice(2, "Wits");

    expect(result.dice).toEqual([1, 1]);
    expect(result.modifier).toBe(2);
    expect(result.label).toBe("Wits");
    expect(result.total).toBe(4);
  });

  it("gives each roll a fresh id", () => {
    expect(rollDice().id).not.toBe(rollDice().id);
  });
});
