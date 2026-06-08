import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as books from "./books.controller";
import { bookSchema, bookUpdateSchema } from "./books.schema";

const router = Router();

router.get("/books", requireAuth, books.listBooks);
router.post("/books", requireAuth, validate(bookSchema), books.createBook);
router.put("/books/:id", requireAuth, validate(bookUpdateSchema), books.updateBook);
router.delete("/books/:id", requireAuth, books.deleteBook);

export default router;
