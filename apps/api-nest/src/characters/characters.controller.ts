import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CreateCharacterInput, UpdateCharacterInput } from "@tmrpg/schemas";
import { createZodDto } from "nestjs-zod";
import type { JwtPayload } from "../auth/jwt.strategy.js";
import { CurrentUser } from "../common/decorators/current-user.decorator.js";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard.js";
// biome-ignore lint/style/useImportType: constructor-injected provider, needs a runtime reference for Nest's decorator metadata
import { CharactersService } from "./characters.service.js";

class CreateCharacterDto extends createZodDto(CreateCharacterInput) {}
class UpdateCharacterDto extends createZodDto(UpdateCharacterInput) {}

@UseGuards(JwtAuthGuard)
@Controller("characters")
export class CharactersController {
  constructor(private readonly characters: CharactersService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.characters.listForUser(user.sub);
  }

  @Get(":id")
  get(@Param("id") id: string, @CurrentUser() user: JwtPayload) {
    return this.characters.getOwned(id, user.sub);
  }

  @Post()
  create(@Body() body: CreateCharacterDto, @CurrentUser() user: JwtPayload) {
    return this.characters.create(user.sub, body);
  }

  @Delete(":id")
  @HttpCode(204)
  async remove(@Param("id") id: string, @CurrentUser() user: JwtPayload) {
    await this.characters.remove(id, user.sub);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() body: UpdateCharacterDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.characters.update(id, user.sub, body);
  }
}
