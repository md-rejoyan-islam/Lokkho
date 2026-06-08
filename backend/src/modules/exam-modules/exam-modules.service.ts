import { ApiError } from "../../utils/ApiError";
import { parsePagination, paginated } from "../../utils/pagination";
import { findOwnedOr403 } from "../../utils/ownership";
import { containsRegex } from "../../utils/regex";
import { ExamModule } from "./exam-modules.model";
import { Subject } from "../subjects/subjects.model";
import { Topic } from "../topics/topics.model";

export async function listModules(userId: any, query: any) {
  const filter: any = { createdBy: userId };
  if (query.category) filter.category = containsRegex(query.category);
  if (query.search) {
    filter.$or = [
      { title: containsRegex(query.search) },
      { description: containsRegex(query.search) },
    ];
  }
  const { pageNum, limitNum, skip } = parsePagination(query, 9);
  const [modules, total] = await Promise.all([
    ExamModule.find(filter).populate("createdBy", "name").sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    ExamModule.countDocuments(filter),
  ]);
  return { ...paginated(modules, total, pageNum, limitNum), modules };
}

export async function getModule(id: string, userId: any) {
  const module = await ExamModule.findOne({ _id: id, createdBy: userId }).populate("createdBy", "name");
  if (!module) throw ApiError.notFound("Module not found");
  const subjects = await Subject.find({ moduleId: module._id, createdBy: userId }).sort({ order: 1, createdAt: 1 });
  return { module, subjects };
}

export function createModule(data: any, userId: any) {
  return ExamModule.create({ ...data, createdBy: userId });
}

export async function updateModule(id: string, data: any, userId: any) {
  const module = await findOwnedOr403(ExamModule, id, userId);
  Object.assign(module, data);
  await module.save();
  return module;
}

// Cascades subjects + topics.
export async function deleteModule(id: string, userId: any) {
  const module = await findOwnedOr403(ExamModule, id, userId);
  await Promise.all([
    Subject.deleteMany({ moduleId: module._id }),
    Topic.deleteMany({ moduleId: module._id }),
    module.deleteOne(),
  ]);
}
