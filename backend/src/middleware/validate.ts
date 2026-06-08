import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";
import { ApiError } from "../utils/ApiError";

// Validates req.body against a Zod schema and replaces it with the parsed value.
export const validate =
  (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return next(ApiError.badRequest("Validation failed", details));
    }
    req.body = result.data;
    next();
  };
