import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import * as service from "./mock-tests.service";

// GET /api/mock-tests?moduleId=
export const listMockTests = asyncHandler(async (req, res) => {
  const attempts = await service.listMockTests(req.user._id, req.query);
  sendResponse(res, { data: { count: attempts.length, attempts } });
});

// POST /api/mock-tests
export const createMockTest = asyncHandler(async (req, res) => {
  const attempt = await service.createMockTest(req.user._id, req.body);
  sendResponse(res, { statusCode: 201, data: { attempt } });
});
