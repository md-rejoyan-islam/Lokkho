import type { z } from "zod";
import type {
  importantSubjectSchema,
  importantSubjectUpdateSchema,
  subjectTopicSchema,
  importantTopicSchema,
  importantTopicUpdateSchema,
} from "./important-topics.schema";

export type ImportantSubjectInput = z.infer<typeof importantSubjectSchema>;
export type ImportantSubjectUpdateInput = z.infer<typeof importantSubjectUpdateSchema>;
export type SubjectTopicInput = z.infer<typeof subjectTopicSchema>;
export type ImportantTopicInput = z.infer<typeof importantTopicSchema>;
export type ImportantTopicUpdateInput = z.infer<typeof importantTopicUpdateSchema>;

export type {
  IImportantSubject,
  IImportantTopic,
  IUserImportantProgress,
} from "./important-topics.model";
