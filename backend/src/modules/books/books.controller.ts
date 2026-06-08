import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import * as service from "./books.service";

// GET /api/books
export const listBooks = asyncHandler(async (req, res) => {
  const result = await service.listBooks(req.user._id, req.query);
  sendResponse(res, { data: result });
});

// POST /api/books
export const createBook = asyncHandler(async (req, res) => {
  const book = await service.createBook(req.body, req.user._id);
  sendResponse(res, { statusCode: 201, data: { book } });
});

// PUT /api/books/:id (owner only)
export const updateBook = asyncHandler(async (req, res) => {
  const book = await service.updateBook((req.params.id as string), req.body, req.user._id);
  sendResponse(res, { data: { book } });
});

// DELETE /api/books/:id (owner only)
export const deleteBook = asyncHandler(async (req, res) => {
  await service.deleteBook((req.params.id as string), req.user._id);
  sendResponse(res, { message: "Book deleted" });
});
