import type { z } from "zod";
import type { subjectSchema, subjectUpdateSchema } from "./subjects.schema";

export type SubjectInput = z.infer<typeof subjectSchema>;
export type SubjectUpdateInput = z.infer<typeof subjectUpdateSchema>;

export type { ISubject } from "./subjects.model";
