import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as questions from "./questions.controller";
import { questionSchema, questionUpdateSchema } from "./questions.schema";

const router = Router();

router.get("/questions", requireAuth, questions.listQuestions);
router.post("/questions", requireAuth, validate(questionSchema), questions.createQuestion);
router.put("/questions/:id", requireAuth, validate(questionUpdateSchema), questions.updateQuestion);
router.delete("/questions/:id", requireAuth, questions.deleteQuestion);

export default router;
