import { Router } from "express";

import authRoutes from "./auth/auth.routes";
import usersRoutes from "./users/users.routes";
import examModuleRoutes from "./exam-modules/exam-modules.routes";
import subjectRoutes from "./subjects/subjects.routes";
import topicRoutes from "./topics/topics.routes";
import progressRoutes from "./progress/progress.routes";
import questionRoutes from "./questions/questions.routes";
import noteRoutes from "./notes/notes.routes";
import studyPlanRoutes from "./study-plans/study-plans.routes";
import mockTestRoutes from "./mock-tests/mock-tests.routes";
import bookRoutes from "./books/books.routes";
import jobRoutes from "./jobs/jobs.routes";
import resourceRoutes from "./resources/resources.routes";
import importantTopicRoutes from "./important-topics/important-topics.routes";
import applicationRoutes from "./applications/applications.routes";

const router = Router();

router.get("/health", (_req, res) => res.json({ success: true, status: "ok" }));

// Each feature module owns its full route paths (relative to /api).
router.use(authRoutes);
router.use(usersRoutes);
router.use(examModuleRoutes);
router.use(subjectRoutes);
router.use(topicRoutes);
router.use(progressRoutes);
router.use(questionRoutes);
router.use(noteRoutes);
router.use(studyPlanRoutes);
router.use(mockTestRoutes);
router.use(bookRoutes);
router.use(jobRoutes);
router.use(resourceRoutes);
router.use(importantTopicRoutes);
router.use(applicationRoutes);

export default router;
