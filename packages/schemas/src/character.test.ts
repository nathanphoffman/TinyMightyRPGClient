import { describe, expect, it } from "vitest";
import { CreateCharacterInput } from "./character.js";
import { RealtimeEvent } from "./realtime-events.js";

describe("CreateCharacterInput", () => {
  it("accepts a valid character payload", () => {
    const result = CreateCharacterInput.safeParse({
      name: "Elowen",
      skills: {
        physique: 3,
        wits: 2,
        charm: 1,
        senses: 0,
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects an out-of-range skill value", () => {
    const result = CreateCharacterInput.safeParse({
      name: "Elowen",
      skills: {
        physique: 99,
        wits: 2,
        charm: 1,
        senses: 0,
      },
    });
    expect(result.success).toBe(false);
  });
});

describe("RealtimeEvent", () => {
  it("narrows a dice_roll event by its discriminant", () => {
    const event = RealtimeEvent.parse({
      type: "dice_roll",
      campaignId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      characterId: "3fa85f64-5717-4562-b3fc-2c963f66afa7",
      notation: "2d6+3",
      result: 9,
      rolledAt: new Date().toISOString(),
    });

    expect(event.type).toBe("dice_roll");
    if (event.type === "dice_roll") {
      expect(event.notation).toBe("2d6+3");
    }
  });
});
