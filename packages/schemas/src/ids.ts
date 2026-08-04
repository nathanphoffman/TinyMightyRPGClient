import { z } from "zod";

export const UserId = z.uuid().brand<"UserId">();
export const CharacterId = z.uuid().brand<"CharacterId">();
export const CampaignId = z.uuid().brand<"CampaignId">();

export type UserId = z.infer<typeof UserId>;
export type CharacterId = z.infer<typeof CharacterId>;
export type CampaignId = z.infer<typeof CampaignId>;
