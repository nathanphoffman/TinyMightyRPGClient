import { Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend = new Resend(process.env.RESEND_API_KEY);

  /**
   * Returns whether the send actually succeeded. The Resend SDK reports API
   * failures (bad key, unverified sending domain, sandbox recipient limits)
   * on the `error` field rather than by throwing, so an unchecked call looks
   * identical to a successful one.
   */
  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
    const { error } = await this.resend.emails.send({
      from: process.env.MAIL_FROM ?? "Tiny Mighty RPG <no-reply@example.com>",
      to,
      subject: "Reset your password",
      html: `<p>Someone requested a password reset for your Tiny Mighty RPG account.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`,
    });

    if (error) {
      // Deliberately logged rather than thrown: the caller must answer
      // identically for registered and unregistered emails, and a 500 that
      // only ever fires for real accounts would leak which ones exist.
      this.logger.error(
        `Password reset email failed (${error.name}${
          error.statusCode ? ` ${error.statusCode}` : ""
        }): ${error.message}`,
      );
      return false;
    }

    return true;
  }
}
