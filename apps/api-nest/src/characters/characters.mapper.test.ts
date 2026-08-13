import { describe, expect, it } from "vitest";
import { toDomainCharacter } from "./characters.mapper.js";

describe("toDomainCharacter", () => {
  it("nests flat Prisma columns into skills and hitPoints", () => {
    const now = new Date();
    const domain = toDomainCharacter({
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      ownerId: "3fa85f64-5717-4562-b3fc-2c963f66afa7",
      name: "Elowen",
      level: 1,
      physique: 3,
      wits: 2,
      charm: 1,
      senses: 0,
      backstory: "",
      hpCurrent: 15,
      hpMax: 15,
      inventory: [],
      createdAt: now,
      updatedAt: now,
    });

    expect(domain.skills.wits).toBe(2);
    expect(domain.hitPoints).toEqual({ current: 15, max: 15 });
  });
});
