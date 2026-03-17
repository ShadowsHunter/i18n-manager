import { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import config from '../config';
import { RequestWithUser, JwtPayload } from '../types/api';
import { unauthorizedResponse, sendResponse } from '../utils/response';
import { ErrorCode } from '../types/api';

export const authenticate = (req: RequestWithUser, res: Response, next: NextFunction) => {
  // Check for API key in headers
  const apiKey = req.headers['x-api-key'];

  if (apiKey) {
    // API key authentication
    try {
      // In a real implementation, validate API key from database
      // For now, we'll allow the request and attach the key to req
      req.apiKey = typeof apiKey === 'string' ? apiKey : apiKey[0];
      return next();
    } catch (error) {
      return sendResponse(
        res,
        {
          success: false,
          error: {
            message: 'Invalid API key',
            code: ErrorCode.INVALID_API_KEY,
            statusCode: 401,
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        },
        401
      );
    }
  }

  // JWT token authentication
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendResponse(res, unauthorizedResponse(), 401);
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return sendResponse(res, unauthorizedResponse('Token expired'), 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return sendResponse(res, unauthorizedResponse('Invalid token'), 401);
    }
    return sendResponse(res, unauthorizedResponse(), 401);
  }
};

export const optionalAuthenticate = (req: RequestWithUser, res: Response, next: NextFunction) => {
  // Check for API key first
  const apiKey = req.headers['x-api-key'];
  if (apiKey) {
    req.apiKey = typeof apiKey === 'string' ? apiKey : apiKey[0];
    return next();
  }

  // Check for JWT token
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    // No authentication provided, continue without user
    return next();
  }

  if (!authHeader.startsWith('Bearer ')) {
    return sendResponse(res, unauthorizedResponse(), 401);
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return sendResponse(res, unauthorizedResponse('Token expired'), 401);
    }
    return sendResponse(res, unauthorizedResponse(), 401);
  }
};
