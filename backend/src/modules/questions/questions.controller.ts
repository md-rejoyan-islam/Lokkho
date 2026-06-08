import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import * as service from "./questions.service";

// GET /api/questions
export const listQuestions = asyncHandler(async (req, res) => {
  const result = await service.listQuestions(req.user._id, req.query);
  sendResponse(res, { data: result });
});

// POST /api/questions
export const createQuestion = asyncHandler(async (req, res) => {
  const question = await service.createQuestion(req.body, req.user._id);
  sendResponse(res, { statusCode: 201, data: { question } });
});

// PUT /api/questions/:id (owner only)
export const updateQuestion = asyncHandler(async (req, res) => {
  const question = await service.updateQuestion((req.params.id as string), req.body, req.user._id);
  sendResponse(res, { data: { question } });
});

// DELETE /api/questions/:id (owner only)
export const deleteQuestion = asyncHandler(async (req, res) => {
  await service.deleteQuestion((req.params.id as string), req.user._id);
  sendResponse(res, { message: "Question deleted" });
});
