import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import * as service from "./applications.service";

// GET /api/applications?applied=true|false&search=
export const listApplications = asyncHandler(async (req, res) => {
  const result = await service.listApplications(req.user._id, req.query);
  sendResponse(res, { data: result });
});

// POST /api/applications
export const createApplication = asyncHandler(async (req, res) => {
  const application = await service.createApplication(req.body, req.user._id);
  sendResponse(res, { statusCode: 201, data: { application } });
});

// PUT /api/applications/:id (owner only)
export const updateApplication = asyncHandler(async (req, res) => {
  const application = await service.updateApplication((req.params.id as string), req.body, req.user._id);
  sendResponse(res, { data: { application } });
});

// DELETE /api/applications/:id (owner only)
export const deleteApplication = asyncHandler(async (req, res) => {
  await service.deleteApplication((req.params.id as string), req.user._id);
  sendResponse(res, { message: "Application deleted" });
});
