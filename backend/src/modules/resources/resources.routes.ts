import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as resources from "./resources.controller";
import { resourceSchema, resourceUpdateSchema } from "./resources.schema";

const router = Router();

router.get("/resources", requireAuth, resources.listResources);
router.post("/resources", requireAuth, validate(resourceSchema), resources.createResource);
router.put("/resources/:id", requireAuth, validate(resourceUpdateSchema), resources.updateResource);
router.delete("/resources/:id", requireAuth, resources.deleteResource);

export default router;
