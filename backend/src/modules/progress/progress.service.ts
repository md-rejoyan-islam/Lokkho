import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { UserTopicProgress, UserSubjectProgress } from "./progress.model";
import { Topic } from "../topics/topics.model";
import { Subject } from "../subjects/subjects.model";

// ---- Topic progress ----
export function listProgress(userId: any, query: any) {
  const filter: any = { userId };
  if (query.moduleId) filter.moduleId = query.moduleId;
  return UserTopicProgress.find(filter).populate("topicId", "title subjectId");
}

export async function upsertProgress(userId: any, topicId: string, body: any) {
  const topic = await Topic.findById(topicId);
  if (!topic) throw ApiError.notFound("Topic not found");

  const update: any = { moduleId: topic.moduleId, lastStudiedAt: new Date() };
  if (body.status) update.status = body.status;
  if (body.revisionDate !== undefined) update.revisionDate = body.revisionDate;

  return UserTopicProgress.findOneAndUpdate(
    { userId, topicId: topic._id },
    { $set: update, $setOnInsert: { userId, topicId: topic._id } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

export async function progressAnalytics(userId: any, query: any) {
  const match: any = { userId };
  if (query.moduleId) match.moduleId = new mongoose.Types.ObjectId(query.moduleId);

  const byStatus = await UserTopicProgress.aggregate([
    { $match: match },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const counts: Record<string, number> = byStatus.reduce((acc: Record<string, number>, r) => {
    acc[r._id] = r.count;
    return acc;
  }, {});

  const totalTracked = Object.values(counts).reduce((a, b) => a + b, 0);
  const completed = counts.completed || 0;
  const completionRate = totalTracked ? Math.round((completed / totalTracked) * 100) : 0;
  return { counts, totalTracked, completionRate };
}

// ---- Subject progress ----
export function listSubjectProgress(userId: any, query: any) {
  const filter: any = { userId };
  if (query.moduleId) filter.moduleId = query.moduleId;
  return UserSubjectProgress.find(filter);
}

export async function upsertSubjectProgress(userId: any, subjectId: string, body: any) {
  const subject = await Subject.findById(subjectId);
  if (!subject) throw ApiError.notFound("Subject not found");

  const update: any = { moduleId: subject.moduleId, lastStudiedAt: new Date() };
  if (body.status) update.status = body.status;
  if (body.revisionDate !== undefined) update.revisionDate = body.revisionDate;

  return UserSubjectProgress.findOneAndUpdate(
    { userId, subjectId: subject._id },
    { $set: update, $setOnInsert: { userId, subjectId: subject._id } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}
