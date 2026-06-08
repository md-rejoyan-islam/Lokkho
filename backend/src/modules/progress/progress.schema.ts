import { z } from "zod";
import { PROGRESS_STATUSES } from "./progress.model";

export const progressSchema = z.object({
  status: z.enum(PROGRESS_STATUSES).optional(),
  revisionDate: z.string().datetime().nullable().optional(),
});
