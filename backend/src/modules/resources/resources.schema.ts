import { z } from "zod";
import { RESOURCE_CATEGORIES } from "./resources.model";
import { reqStr, optStr, optUrl, optTags } from "../../utils/validators";

export const resourceSchema = z.object({
  title: reqStr(1, 300, "Title"),
  category: z.enum(RESOURCE_CATEGORIES).optional(),
  content: optStr(50000),
  link: optUrl(),
  tags: optTags(),
});
export const resourceUpdateSchema = resourceSchema.partial();
