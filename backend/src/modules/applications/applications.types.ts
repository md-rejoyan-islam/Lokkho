import type { z } from "zod";
import type { applicationSchema, applicationUpdateSchema } from "./applications.schema";

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>;

export type { IJobApplication, Stage } from "./applications.model";
