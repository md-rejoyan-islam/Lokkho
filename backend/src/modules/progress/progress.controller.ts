import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import * as service from "./progress.service";

// GET /api/progress?moduleId=
export const listProgress = asyncHandler(async (req, res) => {
  const progress = await service.listProgress(req.user._id, req.query);
  sendResponse(res, { data: { count: progress.length, progress } });
});

// PUT /api/progress/:topicId (upsert personal progress)
export const upsertProgress = asyncHandler(async (req, res) => {
  const progress = await service.upsertProgress(req.user._id, (req.params.topicId as string), req.body);
  sendResponse(res, { data: { progress } });
});

// GET /api/progress/analytics?moduleId=
export const progressAnalytics = asyncHandler(async (req, res) => {
  const result = await service.progressAnalytics(req.user._id, req.query);
  sendResponse(res, { data: result });
});

// GET /api/subject-progress?moduleId=
export const listSubjectProgress = asyncHandler(async (req, res) => {
  const progress = await service.listSubjectProgress(req.user._id, req.query);
  sendResponse(res, { data: { count: progress.length, progress } });
});

// PUT /api/subject-progress/:subjectId (upsert personal status)
export const upsertSubjectProgress = asyncHandler(async (req, res) => {
  const progress = await service.upsertSubjectProgress(req.user._id, (req.params.subjectId as string), req.body);
  sendResponse(res, { data: { progress } });
});
