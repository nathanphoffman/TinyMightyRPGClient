import { z } from "zod";
import { CharacterId, UserId } from "./ids.js";

export const AbilityScoreName = z.enum([
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
]);
export type AbilityScoreName = z.infer<typeof AbilityScoreName>;

export const AbilityScores = z.object({
  strength: z.number().int().min(1).max(30),
  dexterity: z.number().int().min(1).max(30),
  constitution: z.number().int().min(1).max(30),
  intelligence: z.number().int().min(1).max(30),
  wisdom: z.number().int().min(1).max(30),
  charisma: z.number().int().min(1).max(30),
});
export type AbilityScores = z.infer<typeof AbilityScores>;

export const CharacterClass = z.enum(["fighter", "wizard", "rogue", "cleric", "ranger", "bard"]);
export type CharacterClass = z.infer<typeof CharacterClass>;

export const InventoryItem = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(80),
  quantity: z.number().int().min(1).default(1),
  weight: z.number().min(0).default(0),
  equipped: z.boolean().default(false),
});
export type InventoryItem = z.infer<typeof InventoryItem>;

export const HitPoints = z.object({
  current: z.number().int().min(0),
  max: z.number().int().min(1),
});
export type HitPoints = z.infer<typeof HitPoints>;

export const CharacterSchema = z.object({
  id: CharacterId,
  ownerId: UserId,
  name: z.string().min(1).max(60),
  class: CharacterClass,
  level: z.number().int().min(1).max(20).default(1),
  abilityScores: AbilityScores,
  hitPoints: HitPoints,
  inventory: z.array(InventoryItem).default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Character = z.infer<typeof CharacterSchema>;

export const CreateCharacterInput = z.object({
  name: z.string().min(1).max(60),
  class: CharacterClass,
  abilityScores: AbilityScores,
});
export type CreateCharacterInput = z.infer<typeof CreateCharacterInput>;

export const UpdateCharacterInput = z.object({
  name: z.string().min(1).max(60).optional(),
  level: z.number().int().min(1).max(20).optional(),
  hitPoints: HitPoints.partial().optional(),
  inventory: z.array(InventoryItem).optional(),
});
export type UpdateCharacterInput = z.infer<typeof UpdateCharacterInput>;
