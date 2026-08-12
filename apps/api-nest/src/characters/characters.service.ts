import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { PrismaClient } from "@tmrpg/db";
import type { CreateCharacterInput, UpdateCharacterInput } from "@tmrpg/schemas";
import { PRISMA } from "../common/database/database.module.js";
import { toDomainCharacter } from "./characters.mapper.js";

const STARTING_HEALTH = 15;

@Injectable()
export class CharactersService {
  constructor(@Inject(PRISMA) private readonly db: PrismaClient) {}

  async listForUser(userId: string) {
    const rows = await this.db.character.findMany({ where: { ownerId: userId } });
    return rows.map(toDomainCharacter);
  }

  async getOwned(id: string, userId: string) {
    const row = await this.db.character.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException("Character not found");
    }
    if (row.ownerId !== userId) {
      throw new ForbiddenException();
    }
    return toDomainCharacter(row);
  }

  async create(userId: string, input: CreateCharacterInput) {
    const row = await this.db.character.create({
      data: {
        name: input.name,
        ownerId: userId,
        ...input.skills,
        hpCurrent: STARTING_HEALTH,
        hpMax: STARTING_HEALTH,
        inventory: [],
      },
    });
    return toDomainCharacter(row);
  }

  async update(id: string, userId: string, input: UpdateCharacterInput) {
    await this.getOwned(id, userId);
    const row = await this.db.character.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.level !== undefined && { level: input.level }),
        ...(input.hitPoints?.current !== undefined && { hpCurrent: input.hitPoints.current }),
        ...(input.hitPoints?.max !== undefined && { hpMax: input.hitPoints.max }),
        ...(input.inventory !== undefined && { inventory: input.inventory }),
      },
    });
    return toDomainCharacter(row);
  }
}
