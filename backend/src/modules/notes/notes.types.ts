import type { z } from "zod";
import type { noteSchema, noteUpdateSchema } from "./notes.schema";

export type NoteInput = z.infer<typeof noteSchema>;
export type NoteUpdateInput = z.infer<typeof noteUpdateSchema>;

export type { INote } from "./notes.model";
