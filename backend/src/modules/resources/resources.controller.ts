import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import * as service from "./resources.service";

// GET /api/resources
export const listResources = asyncHandler(async (req, res) => {
  const result = await service.listResources(req.user._id, req.query);
  sendResponse(res, { data: result });
});

// POST /api/resources
export const createResource = asyncHandler(async (req, res) => {
  const resource = await service.createResource(req.body, req.user._id);
  sendResponse(res, { statusCode: 201, data: { resource } });
});

// PUT /api/resources/:id (owner only)
export const updateResource = asyncHandler(async (req, res) => {
  const resource = await service.updateResource((req.params.id as string), req.body, req.user._id);
  sendResponse(res, { data: { resource } });
});

// DELETE /api/resources/:id (owner only)
export const deleteResource = asyncHandler(async (req, res) => {
  await service.deleteResource((req.params.id as string), req.user._id);
  sendResponse(res, { message: "Resource deleted" });
});
