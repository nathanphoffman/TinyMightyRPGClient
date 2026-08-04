import { z } from "zod";
import { CampaignId, CharacterId, UserId } from "./ids.js";

// Discriminated union: the wire protocol for the Hono WebSocket gateway.
// Every event carries a literal `type` so both server and client can
// narrow with a switch and get full payload typing per event, and Zod
// can validate an incoming message against the exact right shape.

export const DiceRollEvent = z.object({
  type: z.literal("dice_roll"),
  campaignId: CampaignId,
  characterId: CharacterId,
  notation: z.string().min(1).max(20), // e.g. "1d20+5"
  result: z.number().int(),
  rolledAt: z.coerce.date(),
});
export type DiceRollEvent = z.infer<typeof DiceRollEvent>;

export const TurnChangeEvent = z.object({
  type: z.literal("turn_change"),
  campaignId: CampaignId,
  activeCharacterId: CharacterId,
});
export type TurnChangeEvent = z.infer<typeof TurnChangeEvent>;

export const ChatMessageEvent = z.object({
  type: z.literal("chat_message"),
  campaignId: CampaignId,
  senderId: UserId,
  body: z.string().min(1).max(2000),
  sentAt: z.coerce.date(),
});
export type ChatMessageEvent = z.infer<typeof ChatMessageEvent>;

export const PresenceEvent = z.object({
  type: z.literal("presence"),
  campaignId: CampaignId,
  userId: UserId,
  status: z.enum(["joined", "left"]),
});
export type PresenceEvent = z.infer<typeof PresenceEvent>;

export const RealtimeEvent = z.discriminatedUnion("type", [
  DiceRollEvent,
  TurnChangeEvent,
  ChatMessageEvent,
  PresenceEvent,
]);
export type RealtimeEvent = z.infer<typeof RealtimeEvent>;
