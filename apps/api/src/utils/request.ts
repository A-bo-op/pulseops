import type { Request } from 'express';
import { AppError } from './app-error.js';

export function requireUser(req: Request) {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHENTICATED', 'Authentication is required');
  }

  return req.user;
}

export function getParam(req: Request, name: string) {
  const value = req.params[name];
  if (typeof value !== 'string' || !value) {
    throw new AppError(400, 'INVALID_ROUTE_PARAMETER', `${name} must be a valid identifier`);
  }
  return value;
}
