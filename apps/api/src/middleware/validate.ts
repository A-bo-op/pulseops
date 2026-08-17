import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../utils/app-error.js';

export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(
        new AppError(400, 'VALIDATION_ERROR', 'Request validation failed', result.error.flatten()),
      );
    }

    req.body = result.data;
    return next();
  };
}
