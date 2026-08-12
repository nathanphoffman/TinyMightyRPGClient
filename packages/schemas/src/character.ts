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

export const HitPoints = z.object({
  current: z.number().int().min(0),
  max: z.number().int().min(1),
});
export type HitPoints = z.infer<typeof HitPoints>;

export const CharacterSchema = z.object({
  id: CharacterId,
  ownerId: UserId,
  name: z.string().min(1).max(60),
  level: z.number().int().min(1).max(20).default(1),
  skills: Skills,
  hitPoints: HitPoints,
  inventory: z.array(InventoryItem).default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Character = z.infer<typeof CharacterSchema>;

export const CreateCharacterInput = z.object({
  name: z.string().min(1).max(60),
  skills: Skills,
});
export type CreateCharacterInput = z.infer<typeof CreateCharacterInput>;

export const UpdateCharacterInput = z.object({
  name: z.string().min(1).max(60).optional(),
  level: z.number().int().min(1).max(20).optional(),
  hitPoints: HitPoints.partial().optional(),
  inventory: z.array(InventoryItem).optional(),
});
export type UpdateCharacterInput = z.infer<typeof UpdateCharacterInput>;
