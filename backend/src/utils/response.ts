import { Response } from 'express';
import { ApiResponse, ErrorCode } from '../types/api';

export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  ...(message && { message }),
});

export const errorResponse = (
  message: string,
  code: ErrorCode,
  statusCode = 400,
  details?: unknown,
  path?: string
): ApiResponse => ({
  success: false,
  error: {
    message,
    code,
    statusCode,
    details,
    timestamp: new Date().toISOString(),
    path: path || '',
  },
});

export const notFoundResponse = (resource: string, id?: string): ApiResponse => ({
  success: false,
  error: {
    message: `${resource}${id ? ` with ID ${id}` : ''} not found`,
    code: ErrorCode.NOT_FOUND,
    statusCode: 404,
    timestamp: new Date().toISOString(),
    path: '',
  },
});

export const unauthorizedResponse = (message = 'Unauthorized'): ApiResponse => ({
  success: false,
  error: {
    message,
    code: ErrorCode.UNAUTHORIZED,
    statusCode: 401,
    timestamp: new Date().toISOString(),
    path: '',
  },
});

export const forbiddenResponse = (message = 'Forbidden'): ApiResponse => ({
  success: false,
  error: {
    message,
    code: ErrorCode.FORBIDDEN,
    statusCode: 403,
    timestamp: new Date().toISOString(),
    path: '',
  },
});

export const validationErrorResponse = (errors: Record<string, string[]>): ApiResponse => ({
  success: false,
  error: {
    message: 'Validation failed',
    code: ErrorCode.VALIDATION_ERROR,
    statusCode: 400,
    details: errors,
    timestamp: new Date().toISOString(),
    path: '',
  },
});

export const sendResponse = <T>(res: Response, data: ApiResponse<T>, statusCode = 200) => {
  res.status(statusCode).json(data);
};
