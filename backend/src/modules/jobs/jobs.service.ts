import { ApiError } from "../../utils/ApiError";
import { parsePagination, paginated } from "../../utils/pagination";
import { findOwnedOr403 } from "../../utils/ownership";
import { containsRegex } from "../../utils/regex";
import { Job } from "./jobs.model";

export async function listJobs(userId: any, query: any) {
  const filter: any = { createdBy: userId };
  if (query.category) filter.category = query.category;
  if (query.pension !== undefined) filter.pensionIncluded = query.pension === "true";
  if (query.search) {
    filter.$or = [
      { title: containsRegex(query.search) },
      { organization: containsRegex(query.search) },
      { sector: containsRegex(query.search) },
    ];
  }
  const { pageNum, limitNum, skip } = parsePagination(query, 10);
  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ deadline: 1, createdAt: -1 }).skip(skip).limit(limitNum),
    Job.countDocuments(filter),
  ]);
  return { ...paginated(jobs, total, pageNum, limitNum), jobs };
}

export async function getJob(id: string, userId: any) {
  const job = await Job.findOne({ _id: id, createdBy: userId });
  if (!job) throw ApiError.notFound("Job not found");
  return job;
}

export function createJob(data: any, userId: any) {
  return Job.create({ ...data, createdBy: userId });
}

export async function updateJob(id: string, data: any, userId: any) {
  const job = await findOwnedOr403(Job, id, userId);
  Object.assign(job, data);
  await job.save();
  return job;
}

export async function deleteJob(id: string, userId: any) {
  const job = await findOwnedOr403(Job, id, userId);
  await job.deleteOne();
}
