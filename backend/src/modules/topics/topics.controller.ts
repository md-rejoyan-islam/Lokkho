import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import * as service from "./topics.service";

// GET /api/subjects/:id/topics (owner only)
export const listTopics = asyncHandler(async (req, res) => {
  const result = await service.listTopics((req.params.id as string), req.user._id, req.query);
  sendResponse(res, { data: result });
});

// GET /api/topics/:id (owner only)
export const getTopic = asyncHandler(async (req, res) => {
  const topic = await service.getTopic((req.params.id as string), req.user._id);
  sendResponse(res, { data: { topic } });
});

// POST /api/subjects/:id/topics
export const createTopic = asyncHandler(async (req, res) => {
  const topic = await service.createTopic((req.params.id as string), req.body, req.user._id);
  sendResponse(res, { statusCode: 201, data: { topic } });
});

// PUT /api/topics/:id (owner only)
export const updateTopic = asyncHandler(async (req, res) => {
  const topic = await service.updateTopic((req.params.id as string), req.body, req.user._id);
  sendResponse(res, { data: { topic } });
});

// DELETE /api/topics/:id (owner only)
export const deleteTopic = asyncHandler(async (req, res) => {
  await service.deleteTopic((req.params.id as string), req.user._id);
  sendResponse(res, { message: "Topic deleted" });
});
