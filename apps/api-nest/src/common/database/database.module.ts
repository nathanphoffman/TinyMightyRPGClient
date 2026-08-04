import { Global, Module } from "@nestjs/common";
import { prisma } from "@tmrpg/db";

export const PRISMA = Symbol("PRISMA");

@Global()
@Module({
  providers: [{ provide: PRISMA, useValue: prisma }],
  exports: [PRISMA],
})
export class DatabaseModule {}
