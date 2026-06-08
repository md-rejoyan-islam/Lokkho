import { parsePagination, paginated } from "../../utils/pagination";
import { findOwnedOr403 } from "../../utils/ownership";
import { containsRegex } from "../../utils/regex";
import { Resource } from "./resources.model";

export async function listResources(userId: any, query: any) {
  const filter: any = { createdBy: userId };
  if (query.category) filter.category = query.category;
  if (query.search) {
    filter.$or = [
      { title: containsRegex(query.search) },
      { content: containsRegex(query.search) },
    ];
  }
  const { pageNum, limitNum, skip } = parsePagination(query, 8);
  const [resources, total] = await Promise.all([
    Resource.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Resource.countDocuments(filter),
  ]);
  return { ...paginated(resources, total, pageNum, limitNum), resources };
}

export function createResource(data: any, userId: any) {
  return Resource.create({ ...data, createdBy: userId });
}

export async function updateResource(id: string, data: any, userId: any) {
  const resource = await findOwnedOr403(Resource, id, userId);
  Object.assign(resource, data);
  await resource.save();
  return resource;
}

export async function deleteResource(id: string, userId: any) {
  const resource = await findOwnedOr403(Resource, id, userId);
  await resource.deleteOne();
}
