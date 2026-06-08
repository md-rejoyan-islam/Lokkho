import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password required").max(72),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must be at most 72 characters"),
});
