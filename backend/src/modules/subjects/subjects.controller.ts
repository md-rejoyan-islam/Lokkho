import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import * as service from "./subjects.service";

// GET /api/modules/:id/subjects (owner only)
export const listSubjects = asyncHandler(async (req, res) => {
  const subjects = await service.listSubjects((req.params.id as string), req.user._id);
  sendResponse(res, { data: { count: subjects.length, subjects } });
});

// POST /api/modules/:id/subjects
export const createSubject = asyncHandler(async (req, res) => {
  const subject = await service.createSubject((req.params.id as string), req.body, req.user._id);
  sendResponse(res, { statusCode: 201, data: { subject } });
});

// PUT /api/subjects/:id (owner only)
export const updateSubject = asyncHandler(async (req, res) => {
  const subject = await service.updateSubject((req.params.id as string), req.body, req.user._id);
  sendResponse(res, { data: { subject } });
});

// DELETE /api/subjects/:id (owner only) — cascades topics
export const deleteSubject = asyncHandler(async (req, res) => {
  await service.deleteSubject((req.params.id as string), req.user._id);
  sendResponse(res, { message: "Subject deleted" });
});
