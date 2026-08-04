import { Body, Controller, Post } from "@nestjs/common";
import { CreateUserInput, LoginInput } from "@tmrpg/schemas";
import { createZodDto } from "nestjs-zod";
// biome-ignore lint/style/useImportType: constructor-injected provider, needs a runtime reference for Nest's decorator metadata
import { AuthService } from "./auth.service.js";

class RegisterDto extends createZodDto(CreateUserInput) {}
class LoginDto extends createZodDto(LoginInput) {}

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  register(@Body() body: RegisterDto) {
    return this.auth.register(body);
  }

  @Post("login")
  login(@Body() body: LoginDto) {
    return this.auth.login(body);
  }
}
