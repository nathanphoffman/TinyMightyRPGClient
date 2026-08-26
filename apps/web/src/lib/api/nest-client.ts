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

/**
 * `status` is undefined when the request never reached the API at all — the
 * dev server isn't running, the machine is offline, CORS rejected it. Callers
 * can tell that apart from a response the API actually sent.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly path: string,
    readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ApiError";
  }

  get isNetworkError() {
    return this.status === undefined;
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${env.NEXT_PUBLIC_NEST_API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (cause) {
    throw new ApiError(
      `Could not reach the API at ${env.NEXT_PUBLIC_NEST_API_URL}${path}`,
      path,
      undefined,
      { cause },
    );
  }

  if (!res.ok) {
    throw new ApiError(`Request to ${path} failed with ${res.status}`, path, res.status);
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
