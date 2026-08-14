import { createHash, randomBytes } from "node:crypto";
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
// biome-ignore lint/style/useImportType: constructor-injected provider, needs a runtime reference for Nest's decorator metadata
import { JwtService } from "@nestjs/jwt";
import type {
  CreateUserInput,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
} from "@tmrpg/schemas";
import * as bcrypt from "bcryptjs";
// biome-ignore lint/style/useImportType: constructor-injected provider, needs a runtime reference for Nest's decorator metadata
import { MailService } from "../mail/mail.service.js";
// biome-ignore lint/style/useImportType: constructor-injected provider, needs a runtime reference for Nest's decorator metadata
import { UsersService } from "../users/users.service.js";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
  ) {}

  async register(input: CreateUserInput) {
    const user = await this.users.create(input);
    return this.issueToken(user.id, user.email);
  }

  async login(input: LoginInput) {
    const user = await this.users.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.issueToken(user.id, user.email);
  }

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await this.users.findByEmail(input.email);
    // Always return the same response whether or not the email is
    // registered, so this endpoint can't be used to enumerate accounts.
    if (user) {
      const token = randomBytes(32).toString("hex");
      await this.users.setResetToken(
        user.id,
        hashToken(token),
        new Date(Date.now() + RESET_TOKEN_TTL_MS),
      );
      const resetUrl = `${process.env.APP_WEB_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
      await this.mail.sendPasswordResetEmail(user.email, resetUrl);
    }
    return { ok: true };
  }

  async resetPassword(input: ResetPasswordInput) {
    const user = await this.users.findByResetTokenHash(hashToken(input.token));
    if (!user?.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      throw new BadRequestException("This reset link is invalid or has expired");
    }

    await this.users.resetPassword(user.id, input.password);
    return { ok: true };
  }

  private issueToken(sub: string, email: string) {
    return { accessToken: this.jwt.sign({ sub, email }) };
  }
}
