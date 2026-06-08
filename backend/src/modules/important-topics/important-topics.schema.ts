import { z } from "zod";
import { MODULE_CATEGORIES } from "../exam-modules/exam-modules.model";
import { IMPORTANT_PRIORITIES } from "./important-topics.model";
import { reqStr, optStr, optTags } from "../../utils/validators";

// ---- Important Subject (subject-wise grouping) ----
export const importantSubjectSchema = z.object({
  name: reqStr(1, 200, "Name"),
  note: optStr(5000),
});
export const importantSubjectUpdateSchema = importantSubjectSchema.partial();

// Topic created under a subject
export const subjectTopicSchema = z.object({
  title: reqStr(1, 300, "Title"),
  priority: z.enum(IMPORTANT_PRIORITIES).optional(),
  note: optStr(5000),
});

// ---- Important Topic (flat / legacy) ----
export const importantTopicSchema = z.object({
  title: reqStr(1, 300, "Title"),
  subject: optStr(200),
  category: z.enum(MODULE_CATEGORIES).optional(),
  priority: z.enum(IMPORTANT_PRIORITIES).optional(),
  note: optStr(5000),
  tags: optTags(),
});
export const importantTopicUpdateSchema = importantTopicSchema.partial();
