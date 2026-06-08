import type { Model, Document } from "mongoose";
import { ApiError } from "./ApiError";

// Loads a document by id and (optionally) enforces that req.user owns it.
// `ownerField` is the field on the doc holding the owner's ObjectId.
export async function findOwnedOr403<T extends Document>(
  model: Model<T>,
  id: any,
  userId: unknown,
  ownerField = "createdBy"
): Promise<T> {
  const doc = await model.findById(id);
  if (!doc) throw ApiError.notFound(`${model.modelName} not found`);
  if (String((doc as any)[ownerField]) !== String(userId)) {
    throw ApiError.forbidden("You can only modify your own content");
  }
  return doc;
}
