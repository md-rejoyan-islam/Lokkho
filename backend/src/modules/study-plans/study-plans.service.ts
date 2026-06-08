import { ApiError } from "../../utils/ApiError";
import { parsePagination, paginated } from "../../utils/pagination";
import { StudyPlan } from "./study-plans.model";

export async function listStudyPlans(userId: any, query: any) {
  const filter: any = { userId };
  if (query.date) filter.date = query.date;

  const { pageNum, limitNum, skip } = parsePagination(query, 6);
  const [plans, total] = await Promise.all([
    StudyPlan.find(filter).populate("items.topicId", "title").sort({ date: -1 }).skip(skip).limit(limitNum),
    StudyPlan.countDocuments(filter),
  ]);
  return { ...paginated(plans, total, pageNum, limitNum), plans };
}

// One plan per user per date — upsert by date.
export async function upsertStudyPlan(userId: any, date: string, items: any[]) {
  if (!date) throw ApiError.badRequest("date is required (YYYY-MM-DD)");
  return StudyPlan.findOneAndUpdate(
    { userId, date },
    { $set: { items: items || [] }, $setOnInsert: { userId, date } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

export async function deleteStudyPlan(id: string, userId: any) {
  const plan = await StudyPlan.findOne({ _id: id, userId });
  if (!plan) throw ApiError.notFound("Study plan not found");
  await plan.deleteOne();
}
