import { z } from "zod";
import { email, token } from "../../utils/validators";

// bcrypt only uses the first 72 bytes, so cap the password there to avoid a
// silently-truncated-password footgun.
const password = (min: number) =>
  z
    .string()
    .min(min, `Password must be at least ${min} characters`)
    .max(72, "Password must be at most 72 characters");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: email(),
  password: password(6),
});

export const loginSchema = z.object({
  email: email(),
  password: z.string().min(1, "Password required").max(72),
});

export const forgotPasswordSchema = z.object({
  email: email(),
});

export const resetPasswordSchema = z.object({
  token: token(),
  password: password(6),
});

export const verifyEmailSchema = z.object({
  token: token(),
});
