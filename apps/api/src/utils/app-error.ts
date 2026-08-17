export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const notFound = (code: string, message: string) =>
  new AppError(404, code, message);

export const forbidden = (code: string, message: string) =>
  new AppError(403, code, message);
