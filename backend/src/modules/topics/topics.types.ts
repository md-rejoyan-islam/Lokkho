import type { z } from "zod";
import type { topicSchema, topicUpdateSchema } from "./topics.schema";

export type TopicInput = z.infer<typeof topicSchema>;
export type TopicUpdateInput = z.infer<typeof topicUpdateSchema>;

export type { ITopic } from "./topics.model";
