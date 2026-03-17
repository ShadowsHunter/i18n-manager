import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { sendResponse } from '../utils/response';
import { ErrorCode } from '../types/api';
import config from '../config';

const rateLimitExceededHandler = (
  req: Request,
  res: Response,
  // next: NextFunction,
  options: any
) => {
  return sendResponse(
    res,
    {
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later.',
        code: ErrorCode.RATE_LIMIT_EXCEEDED,
        statusCode: 429,
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    },
    429
  );
};

// General rate limiter for API
export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitExceededHandler,
});

// More restrictive rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 login attempts per minute
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitExceededHandler,
});

// Rate limiter for file uploads
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Too many file uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitExceededHandler,
});
