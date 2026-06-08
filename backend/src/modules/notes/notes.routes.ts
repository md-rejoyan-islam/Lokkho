import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as notes from "./notes.controller";
import { noteSchema, noteUpdateSchema } from "./notes.schema";

const router = Router();

router.get("/notes", requireAuth, notes.listNotes);
router.post("/notes", requireAuth, validate(noteSchema), notes.createNote);
router.put("/notes/:id", requireAuth, validate(noteUpdateSchema), notes.updateNote);
router.delete("/notes/:id", requireAuth, notes.deleteNote);

export default router;
