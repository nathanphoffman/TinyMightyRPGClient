import { Injectable } from "@nestjs/common";
import { Resend } from "resend";

@Injectable()
export class MailService {
  private readonly resend = new Resend(process.env.RESEND_API_KEY);

  async sendPasswordResetEmail(to: string, resetUrl: string) {
    await this.resend.emails.send({
      from: process.env.MAIL_FROM ?? "Tiny Mighty RPG <no-reply@example.com>",
      to,
      subject: "Reset your password",
      html: `<p>Someone requested a password reset for your Tiny Mighty RPG account.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`,
    });
  }
}
