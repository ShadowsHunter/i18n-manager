import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { sendResponse, validationErrorResponse } from '../utils/response';
import { ErrorCode } from '../types/api';
import config from '../config';

// Multer configuration for Excel file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store in memory for faster processing
  limits: {
    fileSize: config.maxFileSize, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Only accept .xlsx files
    const allowedExtensions = ['.xlsx'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(fileExt)) {
      cb(new Error('Only .xlsx files are allowed'), false);
    }
    
    cb(null, true);
  },
});

// Middleware to handle file validation errors
export const handleFileUploadError = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendResponse(
        res,
        validationErrorResponse({
          file: `File size exceeds the limit of ${config.maxFileSize} bytes`,
        }),
        400
      );
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return sendResponse(
        res,
        validationErrorResponse({ file: 'File size exceeds the configured limit' }),
        400
      );
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return sendResponse(
        res,
        validationErrorResponse({ file: 'Only one file can be uploaded at a time' }),
        400
      );
    }
  }

  // Handle other multer errors
  return sendResponse(
    res,
    {
      success: false,
      error: {
        message: err.message || 'File upload failed',
        code: ErrorCode.FILE_PARSE_ERROR,
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    },
    400
  );
};

// Middleware to validate request has a file
export const validateFileUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file || Object.keys(req.file).length === 0) {
    return sendResponse(
      res,
      validationErrorResponse({ file: 'No file uploaded' }),
      400
    );
  }

  next();
};

export default upload;
