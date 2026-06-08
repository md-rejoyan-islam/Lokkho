import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as mocks from "./mock-tests.controller";
import { mockTestSchema } from "./mock-tests.schema";

const router = Router();

router.get("/mock-tests", requireAuth, mocks.listMockTests);
router.post("/mock-tests", requireAuth, validate(mockTestSchema), mocks.createMockTest);

export default router;
