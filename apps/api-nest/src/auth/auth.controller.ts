import { Body, Controller, Post } from "@nestjs/common";
import {
  CreateUserInput,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
} from "@tmrpg/schemas";
import { createZodDto } from "nestjs-zod";
// biome-ignore lint/style/useImportType: constructor-injected provider, needs a runtime reference for Nest's decorator metadata
import { AuthService } from "./auth.service.js";

class RegisterDto extends createZodDto(CreateUserInput) {}
class LoginDto extends createZodDto(LoginInput) {}
class ForgotPasswordDto extends createZodDto(ForgotPasswordInput) {}
class ResetPasswordDto extends createZodDto(ResetPasswordInput) {}

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

  @Post("forgot-password")
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.auth.forgotPassword(body);
  }

  @Post("reset-password")
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.auth.resetPassword(body);
  }
}
