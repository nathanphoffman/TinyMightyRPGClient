import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CreateCampaignInput } from "@tmrpg/schemas";
import { createZodDto } from "nestjs-zod";
import type { JwtPayload } from "../auth/jwt.strategy.js";
import { CurrentUser } from "../common/decorators/current-user.decorator.js";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard.js";
// biome-ignore lint/style/useImportType: constructor-injected provider, needs a runtime reference for Nest's decorator metadata
import { CampaignsService } from "./campaigns.service.js";

class CreateCampaignDto extends createZodDto(CreateCampaignInput) {}

@UseGuards(JwtAuthGuard)
@Controller("campaigns")
export class CampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.campaigns.listForGm(user.sub);
  }

  @Post()
  create(@Body() body: CreateCampaignDto, @CurrentUser() user: JwtPayload) {
    return this.campaigns.create(user.sub, body);
  }
}
