import { Router, Request, Response } from 'express';
import { apiKeyService } from '../services/ApiKeyService';
import {
  successResponse,
  notFoundResponse,
  sendResponse,
  validationErrorResponse,
} from '../utils/response';
import { ErrorCode } from '../types/api';

const router = Router();

// GET /api/v1/api-keys - List API keys
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status = '', search = '' } = req.query;
    const { page = '1', limit = '50' } = req.query;
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

    const result = await apiKeyService.getApiKeys(userId, {
      status: (status as string) || undefined,
      search: (search as string) || undefined,
      skip,
      take: limitNum,
    });

    return sendResponse(res, {
      data: result.apiKeys.map((key) => ({
        id: key.id,
        name: key.name,
        prefix: key.prefix,
        suffix: key.suffix,
        lastUsed: key.lastUsed,
        usageCount: key.usageCount,
        status: key.status,
        expiresAt: key.expiresAt,
        createdAt: key.createdAt,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        totalPages: result.pages,
      },
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return sendResponse(
      res,
      {
        success: false,
        error: {
          message: 'Failed to fetch API keys',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
        },
      },
      500
    );
  }
});

// GET /api/v1/api-keys/:id/usage - Get API key usage
router.get('/:id/usage', async (req: Request, res: Response) => {
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

    const usage = await apiKeyService.getApiKeyUsage(id);

    return sendResponse(res, {
      data: {
        usageCount: usage.usageCount,
        lastUsed: usage.lastUsed,
      },
    });
  } catch (error: any) {
    if (error.message === 'API_KEY_NOT_FOUND') {
      return sendResponse(res, notFoundResponse('API Key', req.params.id), 404);
    }
    console.error('Error fetching API key usage:', error);
    return sendResponse(
      res,
      {
        success: false,
        error: {
          message: 'Failed to fetch API key usage',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
        },
      },
      500
    );
  }
});

// POST /api/v1/api-keys - Create API key
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

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
    if (!name || name.trim().length === 0) {
      return sendResponse(res, validationErrorResponse({ name: 'API key name is required' }), 400);
    }

    if (name.length > 100) {
      return sendResponse(
        res,
        validationErrorResponse({ name: 'API key name must be less than 100 characters' }),
        400
      );
    }

    const newKey = await apiKeyService.createApiKey({
      name: name.trim(),
      userId,
    });

    return sendResponse(
      res,
      {
        data: {
          id: newKey.id,
          name: newKey.name,
          prefix: newKey.prefix,
          suffix: newKey.suffix,
          key: newKey.key, // Only show once on creation
        },
        message: 'API key created successfully',
      },
      201
    );
  } catch (error) {
    console.error('Error creating API key:', error);
    return sendResponse(
      res,
      {
        success: false,
        error: {
          message: 'Failed to create API key',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
        },
      },
      500
    );
  }
});

// DELETE /api/v1/api-keys/:id - Revoke API key
router.delete('/:id', async (req: Request, res: Response) => {
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

    const revokedKey = await apiKeyService.revokeApiKey(userId, id);

    return sendResponse(
      res,
      {
        data: {
          id: revokedKey.id,
          name: revokedKey.name,
        },
        message: 'API key revoked successfully',
      },
      204
    );
  } catch (error: any) {
    if (error.message === 'API_KEY_NOT_FOUND') {
      return sendResponse(res, notFoundResponse('API Key', req.params.id), 404);
    }
    console.error('Error revoking API key:', error);
    return sendResponse(
      res,
      {
        success: false,
        error: {
          message: 'Failed to revoke API key',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
        },
      },
      500
    );
  }
});

export default router;
