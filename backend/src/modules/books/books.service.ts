import { parsePagination, paginated } from "../../utils/pagination";
import { findOwnedOr403 } from "../../utils/ownership";
import { containsRegex } from "../../utils/regex";
import { Book } from "./books.model";

export async function listBooks(userId: any, query: any) {
  const filter: any = { recommendedBy: userId };
  if (query.subject) filter.subject = query.subject;
  if (query.examModuleId) filter.examModuleId = query.examModuleId;
  if (query.search) {
    filter.$or = [
      { title: containsRegex(query.search) },
      { author: containsRegex(query.search) },
    ];
  }
  const { pageNum, limitNum, skip } = parsePagination(query, 12);
  const [books, total] = await Promise.all([
    Book.find(filter).populate("recommendedBy", "name").sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Book.countDocuments(filter),
  ]);
  return { ...paginated(books, total, pageNum, limitNum), books };
}

export function createBook(data: any, userId: any) {
  return Book.create({ ...data, recommendedBy: userId });
}

export async function updateBook(id: string, data: any, userId: any) {
  const book = await findOwnedOr403(Book, id, userId, "recommendedBy");
  Object.assign(book, data);
  await book.save();
  return book;
}

export async function deleteBook(id: string, userId: any) {
  const book = await findOwnedOr403(Book, id, userId, "recommendedBy");
  await book.deleteOne();
}
