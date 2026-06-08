import type { Response } from "express";

export interface SendResponseOptions {
  // HTTP status code (defaults to 200).
  statusCode?: number;
  // Optional human-readable message.
  message?: string;
  // Extra payload keys spread into the response body (e.g. { user }, { jobs, total }).
  data?: Record<string, unknown>;
}

/**
 * Standard success-response helper.
 *
 * Every successful API response shares one shape:
 *   { success: true, message?, ...data }
 *
 * Usage:
 *   sendResponse(res, { data: { job } });
 *   sendResponse(res, { statusCode: 201, data: { user, accessToken } });
 *   sendResponse(res, { message: "Job deleted" });
 *   sendResponse(res, { data: result });            // result already has its own keys
 */
export function sendResponse(res: Response, options: SendResponseOptions = {}): Response {
  const { statusCode = 200, message, data } = options;
  return res.status(statusCode).json({
    success: true,
    ...(message !== undefined ? { message } : {}),
    ...(data ?? {}),
  });
}

export default sendResponse;
