import type {
  Character,
  CreateCharacterInput,
  CreateUserInput,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  UpdateCharacterInput,
} from "@tmrpg/schemas";
import { env } from "../env";

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const res = await fetch(`${env.NEXT_PUBLIC_NEST_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Request to ${path} failed with ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// Hand-typed client keyed off the same Zod schemas the API validates
// against. Swappable later for an openapi-typescript generated client
// without touching call sites.
export const nestApi = {
  login: (input: LoginInput) =>
    request<{ accessToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  register: (input: CreateUserInput) =>
    request<{ accessToken: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  forgotPassword: (input: ForgotPasswordInput) =>
    request<{ ok: true }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  resetPassword: (input: ResetPasswordInput) =>
    request<{ ok: true }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  listCharacters: (token: string) => request<Character[]>("/characters", {}, token),
  getCharacter: (id: string, token: string) => request<Character>(`/characters/${id}`, {}, token),
  updateCharacter: (id: string, input: UpdateCharacterInput, token: string) =>
    request<Character>(
      `/characters/${id}`,
      { method: "PATCH", body: JSON.stringify(input) },
      token,
    ),
  createCharacter: (input: CreateCharacterInput, token: string) =>
    request<Character>("/characters", { method: "POST", body: JSON.stringify(input) }, token),
};
