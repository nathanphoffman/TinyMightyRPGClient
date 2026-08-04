import { z } from "zod";
import { CampaignId, CharacterId, UserId } from "./ids.js";

export const CampaignSchema = z.object({
  id: CampaignId,
  name: z.string().min(1).max(100),
  gmId: UserId,
  memberCharacterIds: z.array(CharacterId).default([]),
  createdAt: z.coerce.date(),
});
export type Campaign = z.infer<typeof CampaignSchema>;

export const CreateCampaignInput = z.object({
  name: z.string().min(1).max(100),
});
export type CreateCampaignInput = z.infer<typeof CreateCampaignInput>;
