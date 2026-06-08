import { z } from "zod";
import { reqStr, optStr, count } from "../../utils/validators";

export const subjectSchema = z.object({
  name: reqStr(1, 200, "Name"),
  marks: count().optional(),
  note: optStr(5000),
  order: z.number().int().min(0).max(100000).optional(),
});
export const subjectUpdateSchema = subjectSchema.partial();
