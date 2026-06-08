import { findOwnedOr403 } from "../../utils/ownership";
import { Note } from "./notes.model";

export function listNotes(userId: any, query: any) {
  const filter: any = { userId };
  if (query.topicId) filter.topicId = query.topicId;
  if (query.moduleId) filter.moduleId = query.moduleId;
  return Note.find(filter).sort({ updatedAt: -1 });
}

export function createNote(data: any, userId: any) {
  return Note.create({ ...data, userId });
}

export async function updateNote(id: string, data: any, userId: any) {
  const note = await findOwnedOr403(Note, id, userId, "userId");
  Object.assign(note, data);
  await note.save();
  return note;
}

export async function deleteNote(id: string, userId: any) {
  const note = await findOwnedOr403(Note, id, userId, "userId");
  await note.deleteOne();
}
