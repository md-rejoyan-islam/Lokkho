import type { z } from "zod";
import type { questionSchema, questionUpdateSchema } from "./questions.schema";

export type QuestionInput = z.infer<typeof questionSchema>;
export type QuestionUpdateInput = z.infer<typeof questionUpdateSchema>;

export type { IQuestion } from "./questions.model";
