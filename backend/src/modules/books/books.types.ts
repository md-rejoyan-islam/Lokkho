import type { z } from "zod";
import type { bookSchema, bookUpdateSchema } from "./books.schema";

export type BookInput = z.infer<typeof bookSchema>;
export type BookUpdateInput = z.infer<typeof bookUpdateSchema>;

export type { IBook } from "./books.model";
