import { Injectable, UnauthorizedException } from "@nestjs/common";
// biome-ignore lint/style/useImportType: constructor-injected provider, needs a runtime reference for Nest's decorator metadata
import { JwtService } from "@nestjs/jwt";
import type { CreateUserInput, LoginInput } from "@tmrpg/schemas";
import * as bcrypt from "bcryptjs";
// biome-ignore lint/style/useImportType: constructor-injected provider, needs a runtime reference for Nest's decorator metadata
import { UsersService } from "../users/users.service.js";

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
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

  private issueToken(sub: string, email: string) {
    return { accessToken: this.jwt.sign({ sub, email }) };
  }
}
