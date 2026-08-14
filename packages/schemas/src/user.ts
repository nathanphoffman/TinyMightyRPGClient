import { z } from "zod";
import { UserId } from "./ids.js";

export const UserSchema = z.object({
  id: UserId,
  email: z.email(),
  displayName: z.string().min(1).max(50),
  createdAt: z.coerce.date(),
});
export type User = z.infer<typeof UserSchema>;

export const CreateUserInput = z.object({
  email: z.email(),
  displayName: z.string().min(1).max(50),
  password: z.string().min(8).max(72),
});
export type CreateUserInput = z.infer<typeof CreateUserInput>;

export const LoginInput = z.object({
  email: z.email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginInput>;

export const ForgotPasswordInput = z.object({
  email: z.email(),
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInput>;

export const ResetPasswordInput = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(72),
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordInput>;
