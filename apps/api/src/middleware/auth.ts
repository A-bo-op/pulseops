import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

interface JwtPayload {
  sub: string;
  email: string;
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.header('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return next(new AppError(401, 'UNAUTHENTICATED', 'Authentication is required'));
  }

  try {
    const payload = jwt.verify(authorization.slice(7), env.JWT_SECRET) as JwtPayload;
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return next(new AppError(401, 'INVALID_TOKEN', 'The access token is invalid or expired'));
  }
}
