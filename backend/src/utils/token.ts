import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";

type Payload = Record<string, unknown>;

// SHA-256 hash for storing refresh tokens (never store raw tokens).
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Short-lived purpose tokens for email verification / password reset.
// Signed with a DEDICATED secret so they can never be presented as a Bearer
// access token (verifyAccessToken uses a different key and would reject them).
export function signEmailToken(payload: Payload, expiresIn: string = "1d"): string {
  return jwt.sign(payload, env.jwt.emailSecret, { expiresIn } as SignOptions);
}
export function verifyEmailToken(token: string): jwt.JwtPayload {
  return jwt.verify(token, env.jwt.emailSecret, { algorithms: ["HS256"] }) as jwt.JwtPayload;
}

export function signAccessToken(payload: Payload): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpires,
  } as SignOptions);
}

export function signRefreshToken(payload: Payload): string {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpires,
  } as SignOptions);
}

export function verifyAccessToken(token: string): jwt.JwtPayload {
  const payload = jwt.verify(token, env.jwt.accessSecret, {
    algorithms: ["HS256"],
  }) as jwt.JwtPayload;
  // Defense-in-depth: a genuine access token carries no `purpose` claim, so
  // reject anything that does (e.g. an email/reset token signed with the same
  // algorithm but the wrong secret would already fail above — this guards the
  // shape too).
  if ((payload as any).purpose) throw new Error("Non-access token presented");
  return payload;
}

export function verifyRefreshToken(token: string): jwt.JwtPayload {
  return jwt.verify(token, env.jwt.refreshSecret, { algorithms: ["HS256"] }) as jwt.JwtPayload;
}

// httpOnly cookie options for the refresh token
export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: (env.isProd ? "none" : "lax") as "none" | "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/api/auth",
  };
}
