import type { z } from "zod";
import type { progressSchema } from "./progress.schema";

export type ProgressInput = z.infer<typeof progressSchema>;

export type { IUserTopicProgress, IUserSubjectProgress } from "./progress.model";
