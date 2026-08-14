import { ConflictException, Inject, Injectable } from "@nestjs/common";
import type { PrismaClient } from "@tmrpg/db";
import type { CreateUserInput } from "@tmrpg/schemas";
import * as bcrypt from "bcryptjs";
import { PRISMA } from "../common/database/database.module.js";

const PASSWORD_HASH_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(@Inject(PRISMA) private readonly db: PrismaClient) {}

  async create(input: CreateUserInput) {
    const existing = await this.db.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await bcrypt.hash(input.password, PASSWORD_HASH_ROUNDS);
    return this.db.user.create({
      data: { email: input.email, displayName: input.displayName, passwordHash },
    });
  }

  findByEmail(email: string) {
    return this.db.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.db.user.findUniqueOrThrow({ where: { id } });
  }

  findByResetTokenHash(resetTokenHash: string) {
    return this.db.user.findFirst({ where: { resetTokenHash } });
  }

  setResetToken(id: string, resetTokenHash: string, resetTokenExpiresAt: Date) {
    return this.db.user.update({
      where: { id },
      data: { resetTokenHash, resetTokenExpiresAt },
    });
  }

  async resetPassword(id: string, password: string) {
    const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
    await this.db.user.update({
      where: { id },
      data: { passwordHash, resetTokenHash: null, resetTokenExpiresAt: null },
    });
  }
}
