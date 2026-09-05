#!/usr/bin/env node
/**
 * Create or reset a login directly in the database, bypassing the API.
 *
 *   pnpm --filter api-nest exec node scripts/create-user.mjs <email> [password] [displayName]
 *
 * With no password argument a strong random one is generated and printed.
 * Safe to re-run: an existing account keeps its id but gets the new password
 * and has any pending password-reset token cleared.
 *
 * Lives under apps/api-nest so Node resolves bcryptjs and @tmrpg/db from this
 * workspace's node_modules; run it via `pnpm --filter api-nest exec`.
 */
import { randomBytes } from "node:crypto";
import * as bcrypt from "bcryptjs";
import { prisma } from "@tmrpg/db";

const PASSWORD_HASH_ROUNDS = 10; // matches UsersService

const [email, passwordArg, displayNameArg] = process.argv.slice(2);

if (!email) {
  console.error("usage: node scripts/create-user.mjs <email> [password] [displayName]");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. Copy apps/api-nest/.env.example to apps/api-nest/.env and start Postgres (pnpm db:up).",
  );
  process.exit(1);
}

const password = passwordArg ?? randomBytes(12).toString("base64url");
const displayName = displayNameArg ?? email.split("@")[0];
const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);

const existing = await prisma.user.findUnique({ where: { email } });
const user = existing
  ? await prisma.user.update({
      where: { email },
      data: { passwordHash, resetTokenHash: null, resetTokenExpiresAt: null },
    })
  : await prisma.user.create({ data: { email, displayName, passwordHash } });

await prisma.$disconnect();

console.log(`\n  ${existing ? "password reset" : "account created"}`);
console.log(`  email:    ${email}`);
console.log(`  password: ${password}`);
console.log(`  userId:   ${user.id}\n`);
