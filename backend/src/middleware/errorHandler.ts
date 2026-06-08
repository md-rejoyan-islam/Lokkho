import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

// 404 for unmatched routes
export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// Central error handler
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  let statusCode: number = err.statusCode || 500;
  let message: string = err.message || "Internal server error";
  let details = err.details;

  // Mongoose: bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose: duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field} already exists`;
  }

  // Mongoose: validation
  if (err.name === "ValidationError") {
    statusCode = 400;
    details = Object.values(err.errors).map((e: any) => e.message);
    message = "Validation failed";
  }

  if (statusCode >= 500) {
    console.error("🔥", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(env.isProd ? {} : { stack: err.stack }),
  });
}
