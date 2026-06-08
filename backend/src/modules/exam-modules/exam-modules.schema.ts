import { z } from "zod";
import { reqStr, optStr, count } from "../../utils/validators";

const patternRow = z.object({
  section: reqStr(1, 200, "Section"),
  marks: count().optional(),
  questionCount: count().optional(),
});

export const moduleSchema = z.object({
  title: reqStr(2, 200, "Title"),
  category: optStr(100),
  description: optStr(10000),
  totalMarks: count().optional(),
  durationMinutes: count().optional(),
  examPattern: z.array(patternRow).max(100).optional(),
  minCgpa: optStr(20),
  degree: optStr(200),
  eligibility: optStr(2000),
});
export const moduleUpdateSchema = moduleSchema.partial();
