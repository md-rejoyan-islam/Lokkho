import { parsePagination, paginated } from "../../utils/pagination";
import { findOwnedOr403 } from "../../utils/ownership";
import { Question } from "./questions.model";

export async function listQuestions(userId: any, query: any) {
  const filter: any = { createdBy: userId };
  if (query.moduleId) filter.moduleId = query.moduleId;
  if (query.subjectId) filter.subjectId = query.subjectId;
  if (query.topicId) filter.topicId = query.topicId;
  if (query.year) filter.year = Number(query.year);
  if (query.type) filter.type = query.type;

  const { pageNum, limitNum, skip } = parsePagination(query, 10);
  const [questions, total] = await Promise.all([
    Question.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Question.countDocuments(filter),
  ]);
  return { ...paginated(questions, total, pageNum, limitNum), questions };
}

export function createQuestion(data: any, userId: any) {
  return Question.create({ ...data, createdBy: userId });
}

export async function updateQuestion(id: string, data: any, userId: any) {
  const question = await findOwnedOr403(Question, id, userId);
  Object.assign(question, data);
  await question.save();
  return question;
}

export async function deleteQuestion(id: string, userId: any) {
  const question = await findOwnedOr403(Question, id, userId);
  await question.deleteOne();
}
