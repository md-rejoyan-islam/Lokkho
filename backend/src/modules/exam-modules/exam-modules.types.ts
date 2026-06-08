import type { z } from "zod";
import type { moduleSchema, moduleUpdateSchema } from "./exam-modules.schema";

export type ModuleInput = z.infer<typeof moduleSchema>;
export type ModuleUpdateInput = z.infer<typeof moduleUpdateSchema>;

export type { IExamModule, PatternRow } from "./exam-modules.model";
