import type { z } from "zod";
import type { studyPlanSchema } from "./study-plans.schema";

export type StudyPlanInput = z.infer<typeof studyPlanSchema>;

export type { IStudyPlan, PlanItem } from "./study-plans.model";
