import { Inject, Injectable } from "@nestjs/common";
import type { PrismaClient } from "@tmrpg/db";
import type { CreateCampaignInput } from "@tmrpg/schemas";
import { PRISMA } from "../common/database/database.module.js";

@Injectable()
export class CampaignsService {
  constructor(@Inject(PRISMA) private readonly db: PrismaClient) {}

  listForGm(gmId: string) {
    return this.db.campaign.findMany({ where: { gmId } });
  }

  create(gmId: string, input: CreateCampaignInput) {
    return this.db.campaign.create({ data: { name: input.name, gmId } });
  }
}
