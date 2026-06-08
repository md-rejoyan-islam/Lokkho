import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import * as service from "./study-plans.service";

// GET /api/study-plans?date=YYYY-MM-DD
export const listStudyPlans = asyncHandler(async (req, res) => {
  const result = await service.listStudyPlans(req.user._id, req.query);
  sendResponse(res, { data: result });
});

// POST /api/study-plans (upsert by date)
export const upsertStudyPlan = asyncHandler(async (req, res) => {
  const plan = await service.upsertStudyPlan(req.user._id, req.body.date, req.body.items);
  sendResponse(res, { statusCode: 201, data: { plan } });
});

// DELETE /api/study-plans/:id (owner only)
export const deleteStudyPlan = asyncHandler(async (req, res) => {
  await service.deleteStudyPlan((req.params.id as string), req.user._id);
  sendResponse(res, { message: "Study plan deleted" });
});
