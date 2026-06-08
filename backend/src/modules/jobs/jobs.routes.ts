import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as jobs from "./jobs.controller";
import { jobSchema, jobUpdateSchema } from "./jobs.schema";

const router = Router();

router.get("/jobs", requireAuth, jobs.listJobs);
router.get("/jobs/:id", requireAuth, jobs.getJob);
router.post("/jobs", requireAuth, validate(jobSchema), jobs.createJob);
router.put("/jobs/:id", requireAuth, validate(jobUpdateSchema), jobs.updateJob);
router.delete("/jobs/:id", requireAuth, jobs.deleteJob);

export default router;
