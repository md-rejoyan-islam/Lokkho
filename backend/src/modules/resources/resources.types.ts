import type { z } from "zod";
import type { resourceSchema, resourceUpdateSchema } from "./resources.schema";

export type ResourceInput = z.infer<typeof resourceSchema>;
export type ResourceUpdateInput = z.infer<typeof resourceUpdateSchema>;

export type { IResource } from "./resources.model";
