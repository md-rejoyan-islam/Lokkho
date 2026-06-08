import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import * as service from "./important-topics.service";

// ---- Subjects ----
export const listImportantSubjects = asyncHandler(async (req, res) => {
  const subjects = await service.listImportantSubjects(req.user._id);
  sendResponse(res, { data: { count: subjects.length, subjects } });
});

export const getImportantSubject = asyncHandler(async (req, res) => {
  const subject = await service.getImportantSubject((req.params.id as string), req.user._id);
  sendResponse(res, { data: { subject } });
});

export const createImportantSubject = asyncHandler(async (req, res) => {
  const subject = await service.createImportantSubject(req.body, req.user._id);
  sendResponse(res, { statusCode: 201, data: { subject } });
});

export const updateImportantSubject = asyncHandler(async (req, res) => {
  const subject = await service.updateImportantSubject((req.params.id as string), req.body, req.user._id);
  sendResponse(res, { data: { subject } });
});

export const deleteImportantSubject = asyncHandler(async (req, res) => {
  await service.deleteImportantSubject((req.params.id as string), req.user._id);
  sendResponse(res, { message: "Subject deleted" });
});

// ---- Topics under a subject ----
export const listSubjectTopics = asyncHandler(async (req, res) => {
  const result = await service.listSubjectTopics((req.params.id as string), req.user._id, req.query);
  sendResponse(res, { data: result });
});

export const createSubjectTopic = asyncHandler(async (req, res) => {
  const topic = await service.createSubjectTopic((req.params.id as string), req.body, req.user._id);
  sendResponse(res, { statusCode: 201, data: { topic } });
});

// ---- Flat / legacy ----
export const listImportantTopics = asyncHandler(async (req, res) => {
  const result = await service.listImportantTopics(req.user._id, req.query);
  sendResponse(res, { data: result });
});

export const updateImportantTopic = asyncHandler(async (req, res) => {
  const topic = await service.updateImportantTopic((req.params.id as string), req.body, req.user._id);
  sendResponse(res, { data: { topic } });
});

export const deleteImportantTopic = asyncHandler(async (req, res) => {
  await service.deleteImportantTopic((req.params.id as string), req.user._id);
  sendResponse(res, { message: "Important topic deleted" });
});

// ---- Personal progress ----
export const listImportantProgress = asyncHandler(async (req, res) => {
  const progress = await service.listImportantProgress(req.user._id, req.query);
  sendResponse(res, { data: { count: progress.length, progress } });
});

export const upsertImportantProgress = asyncHandler(async (req, res) => {
  const progress = await service.upsertImportantProgress(req.user._id, (req.params.topicId as string), req.body.status);
  sendResponse(res, { data: { progress } });
});
