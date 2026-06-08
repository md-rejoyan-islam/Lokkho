import crypto from "crypto";
import { ApiError } from "../../utils/ApiError";
import { env } from "../../config/env";
import { sendMail } from "../../utils/mailer";
import { verificationEmail, resetPasswordEmail } from "../../utils/emailTemplates";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signEmailToken,
  verifyEmailToken,
  hashToken,
} from "../../utils/token";
import { User, IUser } from "../users/users.model";
import { RefreshToken } from "./auth.model";
import { cloneStarterData } from "../onboarding/onboarding.service";
import type { IssuedTokens, RegisterInput, LoginInput } from "./auth.types";

const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

// Issue access + refresh tokens; persist the refresh token's hash so it can be revoked.
export async function issueTokens(user: IUser): Promise<IssuedTokens> {
  const payload = { sub: user._id.toString(), email: user.email };
  const accessToken = signAccessToken(payload);
  // Unique jti so two tokens issued in the same second never collide.
  const refreshToken = signRefreshToken({ ...payload, jti: crypto.randomUUID() });
  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_MS),
  });
  return { accessToken, refreshToken };
}

// Email a verification link (logged to console in dev). Returns the link for dev exposure.
export async function sendVerificationEmail(user: IUser): Promise<string> {
  const token = signEmailToken({ sub: user._id.toString(), purpose: "verify" }, "1d");
  const link = `${env.clientUrl}/verify-email?token=${token}`;
  const tpl = verificationEmail(link);
  // Never let a misconfigured SMTP break the signup flow.
  try {
    await sendMail({ to: user.email, subject: tpl.subject, text: tpl.text, html: tpl.html });
  } catch (err) {
    console.error("✉️  Verification email failed:", (err as Error).message);
  }
  return link;
}

export async function registerUser({ name, email, password }: RegisterInput) {
  if (await User.findOne({ email })) throw ApiError.conflict("Email already registered");
  const user = new User({ name, email });
  await user.setPassword(password);
  await user.save();

  // Give the new user their own editable copy of the demo starter dataset.
  // Never let a clone failure break signup.
  try {
    await cloneStarterData(user._id);
  } catch (err) {
    console.error("⚠️  Starter-data clone failed:", (err as Error).message);
  }

  const tokens = await issueTokens(user);
  const verifyLink = await sendVerificationEmail(user);
  return { user, tokens, verifyLink };
}

export async function loginUser({ email, password }: LoginInput) {
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !(await user.comparePassword(password)))
    throw ApiError.unauthorized("Invalid email or password");
  const tokens = await issueTokens(user);
  return { user, tokens };
}

// Validates a refresh token against the DB and rotates it.
export async function rotateSession(token?: string): Promise<IssuedTokens> {
  if (!token) throw ApiError.unauthorized("Refresh token missing");
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }
  const stored = await RefreshToken.findOne({ tokenHash: hashToken(token) });
  if (!stored) throw ApiError.unauthorized("Session revoked. Please log in again.");
  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized("User no longer exists");
  await stored.deleteOne(); // rotate
  return issueTokens(user);
}

export async function revokeSession(token?: string): Promise<void> {
  if (token) await RefreshToken.deleteOne({ tokenHash: hashToken(token) });
}

// Always succeeds (no email enumeration). Returns the dev link if a user exists.
export async function requestPasswordReset(email: string): Promise<string | undefined> {
  const user = await User.findOne({ email });
  if (!user) return undefined;
  const token = signEmailToken({ sub: user._id.toString(), purpose: "reset" }, "1h");
  const link = `${env.clientUrl}/reset-password?token=${token}`;
  const tpl = resetPasswordEmail(link);
  try {
    await sendMail({ to: user.email, subject: tpl.subject, text: tpl.text, html: tpl.html });
  } catch (err) {
    console.error("✉️  Reset email failed:", (err as Error).message);
  }
  return link;
}

export async function resetUserPassword(token: string, password: string): Promise<void> {
  let payload;
  try {
    payload = verifyEmailToken(token);
  } catch {
    throw ApiError.badRequest("Invalid or expired reset link");
  }
  if (payload.purpose !== "reset") throw ApiError.badRequest("Invalid reset link");
  const user = await User.findById(payload.sub).select("+passwordHash");
  if (!user) throw ApiError.notFound("User not found");
  await user.setPassword(password);
  await user.save();
  await RefreshToken.deleteMany({ userId: user._id }); // log out everywhere
}

export async function verifyUserEmail(token: string): Promise<void> {
  let payload;
  try {
    payload = verifyEmailToken(token);
  } catch {
    throw ApiError.badRequest("Invalid or expired verification link");
  }
  if (payload.purpose !== "verify") throw ApiError.badRequest("Invalid verification link");
  await User.findByIdAndUpdate(payload.sub, { emailVerified: true });
}

export async function resendVerification(userId: any) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  if (user.emailVerified) return { alreadyVerified: true as const, link: undefined };
  const link = await sendVerificationEmail(user);
  return { alreadyVerified: false as const, link };
}
