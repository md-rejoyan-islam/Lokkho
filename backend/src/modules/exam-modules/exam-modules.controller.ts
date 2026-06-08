import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import * as service from "./exam-modules.service";

// GET /api/modules
export const listModules = asyncHandler(async (req, res) => {
  const result = await service.listModules(req.user._id, req.query);
  sendResponse(res, { data: result });
});

// GET /api/modules/:id (owner only, with subjects)
export const getModule = asyncHandler(async (req, res) => {
  const { module, subjects } = await service.getModule((req.params.id as string), req.user._id);
  sendResponse(res, { data: { module, subjects } });
});

// POST /api/modules
export const createModule = asyncHandler(async (req, res) => {
  const module = await service.createModule(req.body, req.user._id);
  sendResponse(res, { statusCode: 201, data: { module } });
});

// PUT /api/modules/:id (owner only)
export const updateModule = asyncHandler(async (req, res) => {
  const module = await service.updateModule((req.params.id as string), req.body, req.user._id);
  sendResponse(res, { data: { module } });
});

// DELETE /api/modules/:id (owner only) — cascades subjects + topics
export const deleteModule = asyncHandler(async (req, res) => {
  await service.deleteModule((req.params.id as string), req.user._id);
  sendResponse(res, { message: "Module deleted" });
});
