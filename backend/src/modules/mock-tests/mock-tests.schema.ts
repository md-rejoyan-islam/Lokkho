import { z } from "zod";
import { reqStr, optStr, count } from "../../utils/validators";

export const mockTestSchema = z.object({
  moduleId: reqStr(1, 100, "Module id"),
  total: count(10000).optional(),
  answers: z
    .array(
      z.object({
        questionId: optStr(100),
        selected: optStr(500),
        correct: z.boolean().optional(),
      })
    )
    .max(1000)
    .optional(),
});
