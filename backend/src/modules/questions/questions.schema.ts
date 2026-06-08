import { z } from "zod";
import { QUESTION_TYPES } from "./questions.model";
import { reqStr, optStr } from "../../utils/validators";

export const questionSchema = z.object({
  moduleId: reqStr(1, 100, "Module id"),
  subjectId: optStr(100),
  topicId: optStr(100),
  year: z.number().int().min(1900).max(2100).optional(),
  examName: optStr(300),
  type: z.enum(QUESTION_TYPES).optional(),
  questionText: reqStr(1, 10000, "Question"),
  options: z.array(z.string().trim().max(2000)).max(26).optional(),
  correctAnswer: optStr(2000),
  explanation: optStr(10000),
});
export const questionUpdateSchema = questionSchema.partial();
