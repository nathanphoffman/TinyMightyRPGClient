import { createHash } from "node:crypto";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "./auth.service.js";

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

// AuthService only constructor-injects three collaborators, so it can be
// built by hand with fakes — no Nest testing module required.
describe("AuthService", () => {
  let users: {
    findByEmail: ReturnType<typeof vi.fn>;
    setResetToken: ReturnType<typeof vi.fn>;
    findByResetTokenHash: ReturnType<typeof vi.fn>;
    resetPassword: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let jwt: { sign: ReturnType<typeof vi.fn> };
  let mail: { sendPasswordResetEmail: ReturnType<typeof vi.fn> };
  let service: AuthService;

  let passwordHash: string;
  beforeAll(async () => {
    passwordHash = await bcrypt.hash("correct-horse-battery", 10);
  });

  beforeEach(() => {
    users = {
      findByEmail: vi.fn(),
      setResetToken: vi.fn().mockResolvedValue(undefined),
      findByResetTokenHash: vi.fn(),
      resetPassword: vi.fn().mockResolvedValue(undefined),
      create: vi.fn(),
    };
    jwt = { sign: vi.fn().mockReturnValue("signed.jwt.token") };
    mail = { sendPasswordResetEmail: vi.fn().mockResolvedValue(true) };
    service = new AuthService(users as never, jwt as never, mail as never);
  });

  describe("login", () => {
    it("rejects an unknown email without revealing it's unregistered", async () => {
      users.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: "ghost@example.com", password: "whatever" }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it("rejects a wrong password", async () => {
      users.findByEmail.mockResolvedValue({ id: "user-1", email: "gm@example.com", passwordHash });
      await expect(
        service.login({ email: "gm@example.com", password: "wrong" }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it("issues a token when the password matches", async () => {
      users.findByEmail.mockResolvedValue({ id: "user-1", email: "gm@example.com", passwordHash });
      const result = await service.login({
        email: "gm@example.com",
        password: "correct-horse-battery",
      });
      expect(result).toEqual({ accessToken: "signed.jwt.token" });
      expect(jwt.sign).toHaveBeenCalledWith({ sub: "user-1", email: "gm@example.com" });
    });
  });

  describe("forgotPassword", () => {
    it("never issues a token or sends mail for an unregistered email", async () => {
      users.findByEmail.mockResolvedValue(null);
      await expect(service.forgotPassword({ email: "ghost@example.com" })).resolves.toEqual({
        ok: true,
      });
      expect(users.setResetToken).not.toHaveBeenCalled();
      expect(mail.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("stores only the hash of the token it emails, with a future expiry", async () => {
      users.findByEmail.mockResolvedValue({ id: "user-1", email: "gm@example.com" });

      await expect(service.forgotPassword({ email: "gm@example.com" })).resolves.toEqual({
        ok: true,
      });

      const [, resetUrl] = mail.sendPasswordResetEmail.mock.calls[0];
      const emailedToken = new URL(resetUrl).searchParams.get("token") ?? "";
      expect(emailedToken).toMatch(/^[a-f0-9]{64}$/);

      const [userId, storedHash, expiresAt] = users.setResetToken.mock.calls[0];
      expect(userId).toBe("user-1");
      expect(storedHash).toBe(sha256(emailedToken));
      expect(storedHash).not.toBe(emailedToken); // the raw token must not reach the DB
      expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe("resetPassword", () => {
    it("rejects an unknown token and leaves the password untouched", async () => {
      users.findByResetTokenHash.mockResolvedValue(null);
      await expect(
        service.resetPassword({ token: "nope", password: "new-password-123" }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(users.resetPassword).not.toHaveBeenCalled();
    });

    it("rejects an expired token and leaves the password untouched", async () => {
      users.findByResetTokenHash.mockResolvedValue({
        id: "user-1",
        resetTokenExpiresAt: new Date(Date.now() - 1_000),
      });
      await expect(
        service.resetPassword({ token: "stale", password: "new-password-123" }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(users.resetPassword).not.toHaveBeenCalled();
    });

    it("looks the token up by hash, never by its raw value", async () => {
      users.findByResetTokenHash.mockResolvedValue({
        id: "user-1",
        resetTokenExpiresAt: new Date(Date.now() + 60_000),
      });
      await service.resetPassword({ token: "raw-token", password: "new-password-123" });
      expect(users.findByResetTokenHash).toHaveBeenCalledWith(sha256("raw-token"));
    });

    it("sets the new password for a valid, unexpired token", async () => {
      users.findByResetTokenHash.mockResolvedValue({
        id: "user-1",
        resetTokenExpiresAt: new Date(Date.now() + 60_000),
      });
      await expect(
        service.resetPassword({ token: "good", password: "new-password-123" }),
      ).resolves.toEqual({ ok: true });
      expect(users.resetPassword).toHaveBeenCalledWith("user-1", "new-password-123");
    });
  });
});
