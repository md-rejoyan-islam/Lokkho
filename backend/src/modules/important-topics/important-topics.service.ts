import { ApiError } from "../../utils/ApiError";
import { parsePagination, paginated } from "../../utils/pagination";
import { findOwnedOr403 } from "../../utils/ownership";
import { containsRegex } from "../../utils/regex";
import {
  ImportantSubject,
  ImportantTopic,
  UserImportantProgress,
} from "./important-topics.model";

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

// ---- Subjects ----
export async function listImportantSubjects(userId: any) {
  const subjects = await ImportantSubject.find({ createdBy: userId }).populate("createdBy", "name").sort({ createdAt: -1 });
  const counts = await ImportantTopic.aggregate([
    { $group: { _id: "$subjectId", count: { $sum: 1 } } },
  ]);
  const countMap: Record<string, number> = {};
  for (const c of counts) countMap[String(c._id)] = c.count;
  return subjects.map((s) => ({ ...s.toObject(), topicCount: countMap[String(s._id)] || 0 }));
}

export async function getImportantSubject(id: string, userId: any) {
  const subject = await ImportantSubject.findOne({ _id: id, createdBy: userId }).populate("createdBy", "name");
  if (!subject) throw ApiError.notFound("Subject not found");
  return subject;
}

export function createImportantSubject(data: any, userId: any) {
  return ImportantSubject.create({ name: data.name, note: data.note || "", createdBy: userId });
}

export async function updateImportantSubject(id: string, data: any, userId: any) {
  const subject = await findOwnedOr403(ImportantSubject, id, userId);
  if (data.name !== undefined) subject.name = data.name;
  if (data.note !== undefined) subject.note = data.note;
  await subject.save();
  return subject;
}

// Cascades its topics.
export async function deleteImportantSubject(id: string, userId: any) {
  const subject = await findOwnedOr403(ImportantSubject, id, userId);
  await Promise.all([
    ImportantTopic.deleteMany({ subjectId: subject._id }),
    subject.deleteOne(),
  ]);
}

// ---- Topics under a subject ----
export async function listSubjectTopics(subjectId: string, userId: any, query: any) {
  const filter: any = { subjectId, createdBy: userId };
  if (query.priority) filter.priority = query.priority;
  if (query.search) {
    filter.$or = [
      { title: containsRegex(query.search) },
      { note: containsRegex(query.search) },
    ];
  }
  const { pageNum, limitNum, skip } = parsePagination(query, 10);
  const [topics, total] = await Promise.all([
    ImportantTopic.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    ImportantTopic.countDocuments(filter),
  ]);
  topics.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  return { ...paginated(topics, total, pageNum, limitNum), topics };
}

export async function createSubjectTopic(subjectId: string, data: any, userId: any) {
  const subject = await ImportantSubject.findById(subjectId);
  if (!subject) throw ApiError.notFound("Subject not found");
  return ImportantTopic.create({
    subjectId: subject._id,
    title: data.title,
    priority: data.priority || "medium",
    note: data.note || "",
    createdBy: userId,
  });
}

// ---- Flat / legacy topic list + edit/delete ----
export async function listImportantTopics(userId: any, query: any) {
  const filter: any = { createdBy: userId };
  if (query.priority) filter.priority = query.priority;
  if (query.category) filter.category = query.category;
  if (query.search) {
    filter.$or = [
      { title: containsRegex(query.search) },
      { subject: containsRegex(query.search) },
    ];
  }
  const { pageNum, limitNum, skip } = parsePagination(query, 10);
  const [topics, total] = await Promise.all([
    ImportantTopic.find(filter).populate("createdBy", "name").sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    ImportantTopic.countDocuments(filter),
  ]);
  topics.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  return { ...paginated(topics, total, pageNum, limitNum), topics };
}

export async function updateImportantTopic(id: string, data: any, userId: any) {
  const topic = await findOwnedOr403(ImportantTopic, id, userId);
  Object.assign(topic, data);
  await topic.save();
  return topic;
}

export async function deleteImportantTopic(id: string, userId: any) {
  const topic = await findOwnedOr403(ImportantTopic, id, userId);
  await topic.deleteOne();
}

// ---- Personal progress ----
export function listImportantProgress(userId: any, query: any) {
  const filter: any = { userId };
  if (query.subjectId) filter.importantSubjectId = query.subjectId;
  return UserImportantProgress.find(filter);
}

export async function upsertImportantProgress(userId: any, topicId: string, status: string) {
  const topic = await ImportantTopic.findById(topicId);
  if (!topic) throw ApiError.notFound("Topic not found");
  return UserImportantProgress.findOneAndUpdate(
    { userId, importantTopicId: topic._id },
    {
      $set: { status, importantSubjectId: topic.subjectId },
      $setOnInsert: { userId, importantTopicId: topic._id },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}
