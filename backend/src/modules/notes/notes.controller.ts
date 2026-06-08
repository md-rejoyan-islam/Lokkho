import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import * as service from "./notes.service";

// GET /api/notes?topicId=&moduleId=
export const listNotes = asyncHandler(async (req, res) => {
  const notes = await service.listNotes(req.user._id, req.query);
  sendResponse(res, { data: { count: notes.length, notes } });
});

// POST /api/notes
export const createNote = asyncHandler(async (req, res) => {
  const note = await service.createNote(req.body, req.user._id);
  sendResponse(res, { statusCode: 201, data: { note } });
});

// PUT /api/notes/:id (owner only)
export const updateNote = asyncHandler(async (req, res) => {
  const note = await service.updateNote((req.params.id as string), req.body, req.user._id);
  sendResponse(res, { data: { note } });
});

// DELETE /api/notes/:id (owner only)
export const deleteNote = asyncHandler(async (req, res) => {
  await service.deleteNote((req.params.id as string), req.user._id);
  sendResponse(res, { message: "Note deleted" });
});
