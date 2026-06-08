import { z } from "zod";
import { STAGE_STATUSES } from "./applications.model";
import { reqStr, optStr, optUrl } from "../../utils/validators";

const stageInput = z.object({
  name: reqStr(1, 200, "Stage name"),
  status: z.enum(STAGE_STATUSES).optional(),
});

// Accepts "YYYY-MM-DD" or ISO datetime; empty string becomes null.
const dateInput = z
  .string()
  .max(40)
  .nullable()
  .optional()
  .transform((v) => (v ? v : null));

export const applicationSchema = z.object({
  jobName: reqStr(1, 300, "Job name"),
  organization: optStr(200),
  isApplied: z.boolean().optional(),
  appliedDate: dateInput,
  examDate: dateInput,
  stages: z.array(stageInput).max(50).optional(),
  notes: optStr(10000),
  link: optUrl(),
});
export const applicationUpdateSchema = applicationSchema.partial();
