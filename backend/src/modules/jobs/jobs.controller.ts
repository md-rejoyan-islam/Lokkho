import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import * as service from "./jobs.service";

// GET /api/jobs
export const listJobs = asyncHandler(async (req, res) => {
  const result = await service.listJobs(req.user._id, req.query);
  sendResponse(res, { data: result });
});

// GET /api/jobs/:id (owner only)
export const getJob = asyncHandler(async (req, res) => {
  const job = await service.getJob((req.params.id as string), req.user._id);
  sendResponse(res, { data: { job } });
});

// POST /api/jobs
export const createJob = asyncHandler(async (req, res) => {
  const job = await service.createJob(req.body, req.user._id);
  sendResponse(res, { statusCode: 201, data: { job } });
});

// PUT /api/jobs/:id (owner only)
export const updateJob = asyncHandler(async (req, res) => {
  const job = await service.updateJob((req.params.id as string), req.body, req.user._id);
  sendResponse(res, { data: { job } });
});

// DELETE /api/jobs/:id (owner only)
export const deleteJob = asyncHandler(async (req, res) => {
  await service.deleteJob((req.params.id as string), req.user._id);
  sendResponse(res, { message: "Job deleted" });
});
