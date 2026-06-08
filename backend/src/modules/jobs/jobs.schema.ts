import { z } from "zod";
import { JOB_CATEGORIES } from "./jobs.model";
import { reqStr, optStr, optUrl, optTags } from "../../utils/validators";

export const jobSchema = z.object({
  title: reqStr(1, 200, "Title"),
  organization: optStr(200),
  category: z.enum(JOB_CATEGORIES).optional(),
  pensionIncluded: z.boolean().optional(),
  sector: optStr(200),
  qualification: optStr(500),
  ageLimit: optStr(100),
  salaryScale: optStr(100),
  description: optStr(10000),
  applyLink: optUrl(),
  source: optStr(300),
  deadline: z.string().datetime().optional(),
  tags: optTags(),
});
export const jobUpdateSchema = jobSchema.partial();
