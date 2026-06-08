import { z } from "zod";
import { reqStr, optStr, optTags } from "../../utils/validators";

export const noteSchema = z.object({
  moduleId: optStr(100),
  subjectId: optStr(100),
  topicId: optStr(100),
  title: reqStr(1, 300, "Title"),
  content: optStr(50000),
  tags: optTags(),
});
export const noteUpdateSchema = noteSchema.partial();
