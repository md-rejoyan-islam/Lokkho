import { ApiError } from "../../utils/ApiError";
import { parsePagination, paginated } from "../../utils/pagination";
import { containsRegex } from "../../utils/regex";
import { JobApplication } from "./applications.model";

export async function listApplications(userId: any, query: any) {
  const filter: any = { userId };
  if (query.applied !== undefined && query.applied !== "") filter.isApplied = query.applied === "true";
  if (query.search) {
    filter.$or = [
      { jobName: containsRegex(query.search) },
      { organization: containsRegex(query.search) },
    ];
  }

  const { pageNum, limitNum, skip } = parsePagination(query, 10);
  const [applications, total] = await Promise.all([
    JobApplication.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limitNum),
    JobApplication.countDocuments(filter),
  ]);

  // Summary across ALL of the user's applications (not just this page).
  const all = await JobApplication.find({ userId }).select("isApplied");
  const appliedCount = all.filter((a) => a.isApplied).length;

  return {
    ...paginated(applications, total, pageNum, limitNum),
    summary: { all: all.length, applied: appliedCount, notApplied: all.length - appliedCount },
    applications,
  };
}

export function createApplication(data: any, userId: any) {
  return JobApplication.create({ ...data, userId });
}

export async function updateApplication(id: string, data: any, userId: any) {
  const application = await JobApplication.findOne({ _id: id, userId });
  if (!application) throw ApiError.notFound("Application not found");
  Object.assign(application, data);
  await application.save();
  return application;
}

export async function deleteApplication(id: string, userId: any) {
  const application = await JobApplication.findOneAndDelete({ _id: id, userId });
  if (!application) throw ApiError.notFound("Application not found");
}
