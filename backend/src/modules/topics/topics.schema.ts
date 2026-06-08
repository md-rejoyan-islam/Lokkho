import { z } from "zod";
import { TOPIC_PRIORITIES, TOPIC_DIFFICULTIES } from "./topics.model";
import { reqStr } from "../../utils/validators";

export const topicSchema = z.object({
  title: reqStr(1, 300, "Title"),
  priority: z.enum(TOPIC_PRIORITIES).optional(),
  difficulty: z.enum(TOPIC_DIFFICULTIES).optional(),
  order: z.number().int().min(0).max(100000).optional(),
});
export const topicUpdateSchema = topicSchema.partial();
