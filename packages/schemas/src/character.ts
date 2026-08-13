import { z } from "zod";
import { CharacterId, UserId } from "./ids.js";

export const SkillName = z.enum(["physique", "wits", "charm", "senses"]);
export type SkillName = z.infer<typeof SkillName>;

export const Skills = z.object({
  physique: z.number().int().min(0).max(3),
  wits: z.number().int().min(0).max(3),
  charm: z.number().int().min(0).max(3),
  senses: z.number().int().min(0).max(3),
});
export type Skills = z.infer<typeof Skills>;

export const InventoryItem = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(80),
  quantity: z.number().int().min(1).default(1),
  weight: z.number().min(0).default(0),
  equipped: z.boolean().default(false),
});
export type InventoryItem = z.infer<typeof InventoryItem>;

export const NewInventoryItem = z.object({
  name: z.string().min(1).max(80),
  quantity: z.number().int().min(1).default(1),
});
export type NewInventoryItem = z.infer<typeof NewInventoryItem>;

export const HitPoints = z.object({
  current: z.number().int().min(0),
  max: z.number().int().min(1),
});
export type HitPoints = z.infer<typeof HitPoints>;

// Powers doing damage or healing roll one of the three dice patterns from
// the rules' Damage Guide; healing "uses the same dice as damage."
export const PowerDiceType = z.enum(["multiTarget", "directTarget", "areaOfEffect"]);
export type PowerDiceType = z.infer<typeof PowerDiceType>;

export const PowerCategory = z.enum(["attack", "heal", "nonAttack"]);
export type PowerCategory = z.infer<typeof PowerCategory>;

// Character creation step 3: "Choose 3 of these options, the same option
// can be picked multiple times, unless noted." Attack bonus tops out at
// +4 (two picks) and defense at 7 (one pick, since a single +2 already
// hits the cap); special powers and extra power uses are unlimited.
export const PowerOptionSelection = z.discriminatedUnion("type", [
  z.object({ type: z.literal("attackBonus") }),
  z.object({ type: z.literal("defenseBonus") }),
  z.object({
    type: z.literal("specialPower"),
    name: z.string().min(1).max(80),
    description: z.string().max(300).default(""),
    category: PowerCategory,
    diceType: PowerDiceType.optional(),
    // "Sometimes damage powers are more restrictive for thematic reasons...
    // If the GM approves, the player can reroll a single damage die."
    restriction: z.string().min(1).max(200).optional(),
  }),
  z.object({
    type: z.literal("extraPowerUse"),
    // "+1 more 'power use' (outline a checkbox)" — the extra use is a
    // checkbox on one specific power, so it must name a power already
    // picked elsewhere among the 3 selections.
    targetPowerName: z.string().min(1).max(80),
  }),
]);
export type PowerOptionSelection = z.infer<typeof PowerOptionSelection>;

export const Power = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(80),
  description: z.string().max(300).default(""),
  category: PowerCategory,
  diceType: PowerDiceType.optional(),
  restriction: z.string().min(1).max(200).optional(),
  // Base is "a one use (per rest) special power"; each "+1 more power
  // use" pick targeting this power raises usesMax by 1. usesUsed resets
  // to 0 on rest ("readying powers").
  usesMax: z.number().int().min(1).default(1),
  usesUsed: z.number().int().min(0).default(0),
});
export type Power = z.infer<typeof Power>;

export const CharacterSchema = z.object({
  id: CharacterId,
  ownerId: UserId,
  name: z.string().min(1).max(60),
  level: z.number().int().min(1).max(20).default(1),
  skills: Skills,
  backstory: z.string().max(2000).default(""),
  hitPoints: HitPoints,
  attackBonus: z.number().int().min(0).max(4).default(0),
  defense: z.number().int().min(5).max(7).default(5),
  powers: z.array(Power).default([]),
  inventory: z.array(InventoryItem).default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Character = z.infer<typeof CharacterSchema>;

export const CreateCharacterInput = z.object({
  name: z.string().min(1).max(60),
  skills: Skills,
  backstory: z.string().max(2000).default(""),
  powerOptions: z
    .array(PowerOptionSelection)
    .length(3, "Choose 3 power options")
    .superRefine((options, ctx) => {
      const attackPicks = options.filter((option) => option.type === "attackBonus").length;
      const defensePicks = options.filter((option) => option.type === "defenseBonus").length;
      if (attackPicks > 2) {
        ctx.addIssue({
          code: "custom",
          message: "Attack bonus can only be picked twice (max +4)",
        });
      }
      if (defensePicks > 1) {
        ctx.addIssue({
          code: "custom",
          message: "Defense bonus can only be picked once (max 7)",
        });
      }
      options.forEach((option, index) => {
        if (
          option.type === "specialPower" &&
          (option.category === "attack" || option.category === "heal") &&
          !option.diceType
        ) {
          ctx.addIssue({
            code: "custom",
            message: "Choose a dice type for attack or heal powers",
            path: [index, "diceType"],
          });
        }
        if (option.type === "extraPowerUse") {
          const targetsKnownPower = options.some(
            (other) => other.type === "specialPower" && other.name === option.targetPowerName,
          );
          if (!targetsKnownPower) {
            ctx.addIssue({
              code: "custom",
              message: "Select a power you've already specified",
              path: [index, "targetPowerName"],
            });
          }
        }
      });
    }),
  inventory: z.array(NewInventoryItem).default([]),
});
export type CreateCharacterInput = z.infer<typeof CreateCharacterInput>;

export const UpdateCharacterInput = z.object({
  name: z.string().min(1).max(60).optional(),
  level: z.number().int().min(1).max(20).optional(),
  backstory: z.string().max(2000).optional(),
  hitPoints: HitPoints.partial().optional(),
  inventory: z.array(InventoryItem).optional(),
});
export type UpdateCharacterInput = z.infer<typeof UpdateCharacterInput>;
