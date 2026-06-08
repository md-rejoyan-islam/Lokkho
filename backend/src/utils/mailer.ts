import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env";

interface MailInput {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// If SMTP is configured, send a real email; otherwise log to console (dev).
let transporter: Transporter | null = null;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

export async function sendMail({ to, subject, text, html }: MailInput): Promise<{ delivered: boolean }> {
  if (transporter) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "Lokkho <no-reply@lokkho.local>",
      to,
      subject,
      text,
      html,
    });
    return { delivered: true };
  }
  // Dev fallback: log so the flow is testable without an email service.
  console.log("\n📧 [DEV EMAIL] To:", to);
  console.log("   Subject:", subject);
  console.log("   " + (text || "").replace(/\n/g, "\n   "));
  console.log("");
  return { delivered: false };
}

// Whether to expose action links in API responses (dev only — never in prod).
export const exposeDevLinks = !env.isProd;
