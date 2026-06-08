import { ApiError } from "../../utils/ApiError";
import { parsePagination, paginated } from "../../utils/pagination";
import { findOwnedOr403 } from "../../utils/ownership";
import { Topic } from "./topics.model";
import { Subject } from "../subjects/subjects.model";
import { UserTopicProgress } from "../progress/progress.model";

export async function listTopics(subjectId: string, userId: any, query: any) {
  const filter = { subjectId, createdBy: userId };
  const { pageNum, limitNum, skip } = parsePagination(query, 10, 200);
  const [topics, total] = await Promise.all([
    Topic.find(filter).sort({ order: 1, createdAt: 1 }).skip(skip).limit(limitNum),
    Topic.countDocuments(filter),
  ]);
  return { ...paginated(topics, total, pageNum, limitNum), topics };
}

export async function getTopic(id: string, userId: any) {
  const topic = await Topic.findOne({ _id: id, createdBy: userId });
  if (!topic) throw ApiError.notFound("Topic not found");
  return topic;
}

export async function createTopic(subjectId: string, data: any, userId: any) {
  const subject = await Subject.findById(subjectId);
  if (!subject) throw ApiError.notFound("Subject not found");
  return Topic.create({ ...data, subjectId: subject._id, moduleId: subject.moduleId, createdBy: userId });
}

export async function updateTopic(id: string, data: any, userId: any) {
  const topic = await findOwnedOr403(Topic, id, userId);
  Object.assign(topic, data);
  await topic.save();
  return topic;
}

export async function deleteTopic(id: string, userId: any) {
  const topic = await findOwnedOr403(Topic, id, userId);
  await Promise.all([UserTopicProgress.deleteMany({ topicId: topic._id }), topic.deleteOne()]);
}
