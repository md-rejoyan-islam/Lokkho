import { z } from "zod";
import { PLAN_ITEM_STATUSES } from "./study-plans.model";
import { optStr, count } from "../../utils/validators";

const planItem = z.object({
  topicId: optStr(100),
  text: optStr(1000),
  targetMinutes: count(10000).optional(),
  status: z.enum(PLAN_ITEM_STATUSES).optional(),
});

export const studyPlanSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  items: z.array(planItem).max(200).optional(),
});
