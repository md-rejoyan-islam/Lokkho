import { z } from "zod";
import { reqStr, optStr, optUrl } from "../../utils/validators";

export const bookSchema = z.object({
  title: reqStr(1, 200, "Title"),
  author: optStr(200),
  subject: optStr(200),
  examModuleId: optStr(100),
  description: optStr(5000),
  coverUrl: optUrl(),
  buyLink: optUrl(),
});
export const bookUpdateSchema = bookSchema.partial();
