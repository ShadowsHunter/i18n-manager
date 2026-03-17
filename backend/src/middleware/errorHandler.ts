import { Request, Response, NextFunction } from 'express';
import { sendResponse, errorResponse } from '../utils/response';
import { ErrorCode } from '../types/api';
import logger from '../config/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return sendResponse(
      res,
      errorResponse('Record not found', ErrorCode.NOT_FOUND, 404, req.path),
      404
    );
  }

  if (err.name === 'PrismaClientUnknownRequestError') {
    return sendResponse(
      res,
      errorResponse('Invalid request', ErrorCode.VALIDATION_ERROR, 400, err.message),
      400
    );
  }

  if (err.name === 'PrismaClientRustPanicError') {
    return sendResponse(
      res,
      errorResponse('Database error', ErrorCode.INTERNAL_ERROR, 500, err.message),
      500
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendResponse(res, errorResponse('Invalid token', ErrorCode.TOKEN_INVALID, 401), 401);
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return sendResponse(
      res,
      errorResponse(err.message, ErrorCode.VALIDATION_ERROR, 400, err.message),
      400
    );
  }

  // Generic error
  const statusCode = (err as any).statusCode || 500;
  const message = err.message || 'Internal server error';

  return sendResponse(
    res,
    errorResponse(message, ErrorCode.INTERNAL_ERROR, statusCode, {
      stack: err.stack,
    }),
    statusCode
  );
};

export const notFoundHandler = (req: Request, res: Response) => {
  return sendResponse(
    res,
    {
      success: false,
      error: {
        message: 'Route not found',
        code: ErrorCode.NOT_FOUND,
        statusCode: 404,
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    },
    404
  );
};
