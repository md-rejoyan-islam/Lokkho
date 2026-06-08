import type { z } from "zod";
import type { updateProfileSchema, changePasswordSchema } from "./users.schema";

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type { IUser } from "./users.model";
