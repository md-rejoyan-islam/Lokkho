import { ApiError } from "../../utils/ApiError";
import { findOwnedOr403 } from "../../utils/ownership";
import { Subject } from "./subjects.model";
import { ExamModule } from "../exam-modules/exam-modules.model";
import { Topic } from "../topics/topics.model";

export function listSubjects(moduleId: string, userId: any) {
  return Subject.find({ moduleId, createdBy: userId }).sort({ order: 1, createdAt: 1 });
}

export async function createSubject(moduleId: string, data: any, userId: any) {
  const module = await ExamModule.findById(moduleId);
  if (!module) throw ApiError.notFound("Module not found");
  return Subject.create({ ...data, moduleId: module._id, createdBy: userId });
}

export async function updateSubject(id: string, data: any, userId: any) {
  const subject = await findOwnedOr403(Subject, id, userId);
  Object.assign(subject, data);
  await subject.save();
  return subject;
}

// Cascades topics.
export async function deleteSubject(id: string, userId: any) {
  const subject = await findOwnedOr403(Subject, id, userId);
  await Promise.all([Topic.deleteMany({ subjectId: subject._id }), subject.deleteOne()]);
}
