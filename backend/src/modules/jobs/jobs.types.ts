import type { z } from "zod";
import type { jobSchema, jobUpdateSchema } from "./jobs.schema";

export type JobInput = z.infer<typeof jobSchema>;
export type JobUpdateInput = z.infer<typeof jobUpdateSchema>;

export type { IJob } from "./jobs.model";
