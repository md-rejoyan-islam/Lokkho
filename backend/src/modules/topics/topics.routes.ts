import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as topics from "./topics.controller";
import { topicSchema, topicUpdateSchema } from "./topics.schema";

const router = Router();

router.get("/subjects/:id/topics", requireAuth, topics.listTopics);
router.post("/subjects/:id/topics", requireAuth, validate(topicSchema), topics.createTopic);
router.get("/topics/:id", requireAuth, topics.getTopic);
router.put("/topics/:id", requireAuth, validate(topicUpdateSchema), topics.updateTopic);
router.delete("/topics/:id", requireAuth, topics.deleteTopic);

export default router;
