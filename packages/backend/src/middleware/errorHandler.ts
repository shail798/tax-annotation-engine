import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  error: AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error response
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details: unknown = undefined;

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid request data';
    details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
  }
  // Handle custom app errors
  else if (error.statusCode) {
    statusCode = error.statusCode;
    code = error.code || 'APP_ERROR';
    message = error.message;
  }
  // Handle known Node.js errors
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = error.message;
  }
  else if (error.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_DATA_FORMAT';
    message = 'Invalid data format provided';
  }
  else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    statusCode = 400;
    code = 'DATABASE_ERROR';
    message = 'Database operation failed';
  }

  // Log error for debugging (except in test environment)
  if (process.env.NODE_ENV !== 'test') {
    console.error('💥 Error occurred:', {
      statusCode,
      code,
      message: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
    });
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
    },
  });
};

// Custom error creator utility
export const createError = (
  message: string,
  statusCode: number = 500,
  code?: string
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  if (code !== undefined) {
    error.code = code;
  }
  return error;
}; 