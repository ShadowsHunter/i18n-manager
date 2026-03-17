import { Request, Response, NextFunction } from 'express';
import { optionalAuthenticate } from '../middleware/auth';
import upload, { handleFileUploadError, validateFileUpload } from '../middleware/fileUpload';
import { parseExcelFile } from '../utils/excelParser';
import { successResponse, sendResponse } from '../utils/response';
import { ErrorCode } from '../types/api';

export const uploadExcelHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Apply optional authentication (API key or JWT)
  optionalAuthenticate(req, res, next);

  // Validate request has file
  validateFileUpload(req, res, () => {});

  // Handle file upload with error handling
  upload.single('file')(req, res, (err) => {
    if (err) {
      return handleFileUploadError(err, req, res, () => {});
    }
  });

  // Get project ID from params
  const { projectId } = req.params;

  if (!req.file) {
    return sendResponse(res, {
      success: false,
      error: {
        message: 'No file uploaded',
        code: ErrorCode.VALIDATION_ERROR,
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    }, 400);
  }

  // Parse Excel file
  const result = parseExcelFile(req.file.buffer, projectId);

  if (!result.success) {
    return sendResponse(res, {
      success: false,
      error: {
        message: result.error || 'Failed to parse Excel file',
        code: ErrorCode.FILE_PARSE_ERROR,
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    }, 400);
  }

  // In production, save entries to database using Prisma
  // For now, we'll just log the parsed entries
  console.log(`Parsed ${result.data.rowCount} entries from Excel file`);
  console.log(`Project ID: ${projectId}`);
  console.log(`Entries:`, result.data.entries);
  console.log(`Errors:`, result.data.errors);

  return sendResponse(res, {
    success: true,
    data: {
      entries: result.data.entries,
      errors: result.data.errors,
      rowCount: result.data.rowCount,
      errorCount: result.data.errors.length,
    },
    message: `Successfully processed ${result.data.rowCount} entries`,
  });
};
