import { describe, expect, it } from "vitest";
import { toDomainCharacter } from "./characters.mapper.js";

describe("toDomainCharacter", () => {
  it("nests flat Prisma columns into abilityScores and hitPoints", () => {
    const now = new Date();
    const domain = toDomainCharacter({
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      ownerId: "3fa85f64-5717-4562-b3fc-2c963f66afa7",
      name: "Elowen",
      class: "ranger",
      level: 1,
      strength: 12,
      dexterity: 16,
      constitution: 14,
      intelligence: 10,
      wisdom: 13,
      charisma: 8,
      hpCurrent: 10,
      hpMax: 10,
      inventory: [],
      createdAt: now,
      updatedAt: now,
    });

    expect(domain.abilityScores.dexterity).toBe(16);
    expect(domain.hitPoints).toEqual({ current: 10, max: 10 });
  });
});
