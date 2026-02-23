// ================================================================
// src/middlewares/validate.middleware.ts
// ✅ Fixed: Uses Object.assign instead of direct reassignment
// ✅ Compatible with Zod v3 and v4
// ================================================================

import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

/**
 * Generic validate middleware — validates body, params, and/or query
 */
export function validate(schemas: {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            message: "Validation error",
            errors: formatErrors(result.error),
          });
        }
        req.body = result.data;
      }

      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) {
          return res.status(400).json({
            message: "Validation error",
            errors: formatErrors(result.error),
          });
        }
        Object.assign(req.params, result.data);
      }

      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) {
          return res.status(400).json({
            message: "Validation error",
            errors: formatErrors(result.error),
          });
        }
        // ✅ Don't reassign req.query — it's read-only in Express
        const parsed = result.data;
        for (const key of Object.keys(req.query)) {
          delete (req.query as any)[key];
        }
        Object.assign(req.query, parsed);
      }

      next();
    } catch (err: any) {
      return res.status(400).json({
        message: "Validation error",
        errors: [{ field: "unknown", message: err.message }],
      });
    }
  };
}

/**
 * Validate request body only
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: formatErrors(result.error),
      });
    }
    req.body = result.data;
    next();
  };
}

/**
 * Validate request params only
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: formatErrors(result.error),
      });
    }
    Object.assign(req.params, result.data);
    next();
  };
}

/**
 * Validate request query only
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: formatErrors(result.error),
      });
    }
    // ✅ FIX: Don't do req.query = result.data (read-only!)
    const parsed = result.data;
    for (const key of Object.keys(req.query)) {
      delete (req.query as any)[key];
    }
    Object.assign(req.query, parsed);
    next();
  };
}

/**
 * Format Zod errors — compatible with v3 and v4
 */
function formatErrors(error: any) {
  const issues = error?.issues || error?.errors || [];
  return issues.map((issue: any) => ({
    field: issue.path?.join(".") || "unknown",
    message: issue.message,
  }));
}
