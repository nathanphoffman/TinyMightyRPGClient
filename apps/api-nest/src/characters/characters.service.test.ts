import type { CreateCharacterInput } from "@tmrpg/schemas";
import { describe, expect, it, vi } from "vitest";
import { CharactersService } from "./characters.service.js";

// The service turns the three raw "power option" picks into concrete stats
// (attackBonus, defense) and power records (usesMax). Those derivations are
// the game rules from character-creation step 3, so they're worth pinning
// down independently of Prisma — the fake below just echoes the write back.
function makeService() {
  const create = vi.fn(({ data }: { data: Record<string, unknown> }) => ({
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    level: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...data,
  }));
  const service = new CharactersService({ character: { create } } as never);
  return { service, create };
}

function baseInput(overrides: Partial<CreateCharacterInput> = {}): CreateCharacterInput {
  return {
    name: "Elowen",
    skills: { physique: 3, wits: 2, charm: 1, senses: 0 },
    backstory: "",
    powerOptions: [],
    inventory: [],
    ...overrides,
  } as CreateCharacterInput;
}

const writtenData = (create: ReturnType<typeof vi.fn>) =>
  create.mock.calls[0][0].data as Record<string, unknown>;

describe("CharactersService.create — stat derivation", () => {
  it("adds +2 attack per pick and raises defense to 7 when the defense bonus is taken", async () => {
    const { service, create } = makeService();
    await service.create(
      "user-1",
      baseInput({
        powerOptions: [{ type: "attackBonus" }, { type: "attackBonus" }, { type: "defenseBonus" }],
      }),
    );
    expect(writtenData(create).attackBonus).toBe(4);
    expect(writtenData(create).defense).toBe(7);
  });

  it("leaves attack at 0 and defense at 5 when neither bonus is picked", async () => {
    const { service, create } = makeService();
    await service.create(
      "user-1",
      baseInput({
        powerOptions: [
          { type: "specialPower", name: "Fly", category: "nonAttack" },
          { type: "specialPower", name: "Swim", category: "nonAttack" },
          { type: "specialPower", name: "Dig", category: "nonAttack" },
        ],
      }),
    );
    expect(writtenData(create).attackBonus).toBe(0);
    expect(writtenData(create).defense).toBe(5);
  });

  it("starts each power at one use and adds a use per extraPowerUse aimed at it", async () => {
    const { service, create } = makeService();
    await service.create(
      "user-1",
      baseInput({
        powerOptions: [
          { type: "specialPower", name: "Fireball", category: "attack", diceType: "areaOfEffect" },
          { type: "extraPowerUse", targetPowerName: "Fireball" },
          { type: "specialPower", name: "Mend", category: "heal", diceType: "directTarget" },
        ],
      }),
    );
    const powers = writtenData(create).powers as Array<{
      name: string;
      usesMax: number;
      usesUsed: number;
    }>;
    expect(powers.map((power) => [power.name, power.usesMax])).toEqual([
      ["Fireball", 2],
      ["Mend", 1],
    ]);
    expect(powers.every((power) => power.usesUsed === 0)).toBe(true);
  });

  it("expands new inventory items to full records instead of trusting client fields", async () => {
    const { service, create } = makeService();
    await service.create(
      "user-1",
      baseInput({
        powerOptions: [{ type: "attackBonus" }, { type: "attackBonus" }, { type: "defenseBonus" }],
        inventory: [{ name: "Torch", quantity: 3 }],
      }),
    );
    const inventory = writtenData(create).inventory as Array<Record<string, unknown>>;
    expect(inventory[0]).toMatchObject({ name: "Torch", quantity: 3, weight: 0, equipped: false });
    expect(inventory[0].id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("seeds hit points at the starting value and copies skills and owner onto the row", async () => {
    const { service, create } = makeService();
    await service.create(
      "user-1",
      baseInput({
        powerOptions: [{ type: "attackBonus" }, { type: "attackBonus" }, { type: "defenseBonus" }],
      }),
    );
    expect(writtenData(create)).toMatchObject({
      ownerId: "user-1",
      hpCurrent: 15,
      hpMax: 15,
      physique: 3,
      wits: 2,
      charm: 1,
      senses: 0,
    });
  });
});
