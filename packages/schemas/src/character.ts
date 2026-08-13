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
  }),
  z.object({ type: z.literal("extraPowerUse") }),
]);
export type PowerOptionSelection = z.infer<typeof PowerOptionSelection>;

export const Power = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(80),
  description: z.string().max(300).default(""),
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
  bonusPowerUses: z.number().int().min(0).default(0),
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
