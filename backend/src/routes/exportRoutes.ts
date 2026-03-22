import { Router, Request, Response } from 'express';
import { exportService } from '../services/ExportService';
import {
  successResponse,
  notFoundResponse,
  sendResponse,
  validationErrorResponse,
} from '../utils/response';
import { ErrorCode } from '../types/api';

const router = Router();

// GET /api/v1/projects/:projectId/exports - List exports
router.get('/:projectId/exports', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { page = '1', limit = '50', status = '' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get userId from authenticated user
    const userId = (req as any).user?.userId;
    if (!userId) {
      return sendResponse(
        res,
        {
          success: false,
          error: {
            message: 'Authentication required',
            code: ErrorCode.UNAUTHORIZED,
            statusCode: 401,
          },
        },
        401
      );
    }

    const result = await exportService.getExports(projectId, {
      status: (status as string) || undefined,
      skip,
      take: limitNum,
    });

    return sendResponse(res, {
      data: result.exports,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        totalPages: result.pages,
      },
    });
  } catch (error) {
    console.error('Error fetching exports:', error);
    return sendResponse(
      res,
      {
        success: false,
        error: {
          message: 'Failed to fetch exports',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
        },
      },
      500
    );
  }
});

// GET /api/v1/projects/:projectId/exports/:id - Get export details
router.get('/:projectId/exports/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return sendResponse(
        res,
        {
          success: false,
          error: {
            message: 'Authentication required',
            code: ErrorCode.UNAUTHORIZED,
            statusCode: 401,
          },
        },
        401
      );
    }

    const exportRecord = await exportService.getExportById(id);

    if (!exportRecord) {
      return sendResponse(res, notFoundResponse('Export', id), 404);
    }

    return sendResponse(res, {
      data: exportRecord,
    });
  } catch (error) {
    console.error('Error fetching export:', error);
    return sendResponse(
      res,
      {
        success: false,
        error: {
          message: 'Failed to fetch export',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
        },
      },
      500
    );
  }
});

// POST /api/v1/projects/:projectId/export - Create export
router.post('/:projectId/export', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { platforms, languages } = req.body;

    // Get userId from authenticated user
    const userId = (req as any).user?.userId;
    if (!userId) {
      return sendResponse(
        res,
        {
          success: false,
          error: {
            message: 'Authentication required',
            code: ErrorCode.UNAUTHORIZED,
            statusCode: 401,
          },
        },
        401
      );
    }

    // Validation
    if (!Array.isArray(platforms) || platforms.length === 0) {
      return sendResponse(
        res,
        validationErrorResponse({ platforms: 'Platforms array is required' }),
        400
      );
    }

    if (!Array.isArray(languages) || languages.length === 0) {
      return sendResponse(
        res,
        validationErrorResponse({ languages: 'Languages array is required' }),
        400
      );
    }

    // Validate platforms
    const validPlatforms = ['iOS', 'Android', 'Web', 'JSON', 'Excel', 'CSV'];
    const invalidPlatforms = platforms.filter((p: string) => !validPlatforms.includes(p));
    if (invalidPlatforms.length > 0) {
      return sendResponse(
        res,
        validationErrorResponse({
          platforms: `Invalid platforms: ${invalidPlatforms.join(', ')}. Valid options: ${validPlatforms.join(', ')}`,
        }),
        400
      );
    }

    // Validate languages
    const validLanguages = ['CN', 'EN', 'DE', 'ES', 'FI', 'FR', 'IT', 'NL', 'NO', 'PL', 'SE', 'DA'];
    const invalidLanguages = languages.filter(
      (l: string) => !validLanguages.includes(l.toUpperCase())
    );
    if (invalidLanguages.length > 0) {
      return sendResponse(
        res,
        validationErrorResponse({
          languages: `Invalid languages: ${invalidLanguages.join(', ')}. Valid options: ${validLanguages.join(', ')}`,
        }),
        400
      );
    }

    const newExport = await exportService.createExport({
      projectId,
      platforms: platforms.map((p: string) => p),
      languages: languages.map((l: string) => l.toUpperCase()),
      userId,
    });

    return sendResponse(
      res,
      {
        data: newExport,
        message: 'Export task created successfully',
      },
      201
    );
  } catch (error) {
    console.error('Error creating export:', error);
    return sendResponse(
      res,
      {
        success: false,
        error: {
          message: 'Failed to create export',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
        },
      },
      500
    );
  }
});

// DELETE /api/v1/projects/:projectId/exports/:id - Delete export
router.delete('/:projectId/exports/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return sendResponse(
        res,
        {
          success: false,
          error: {
            message: 'Authentication required',
            code: ErrorCode.UNAUTHORIZED,
            statusCode: 401,
          },
        },
        401
      );
    }

    await exportService.deleteExport(id);

    return sendResponse(
      res,
      {
        message: 'Export deleted successfully',
      },
      204
    );
  } catch (error) {
    console.error('Error deleting export:', error);
    return sendResponse(
      res,
      {
        success: false,
        error: {
          message: 'Failed to delete export',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
        },
      },
      500
    );
  }
});

export default router;
