import { Router, Request, Response } from 'express';
import { authService } from '../services/AuthService';
import {
  successResponse,
  sendResponse,
  validationErrorResponse,
  unauthorizedResponse,
} from '../utils/response';
import { ErrorCode } from '../types/api';

const router = Router();

// POST /api/v1/auth/register - Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !email.trim() || !email.includes('@')) {
      return sendResponse(
        res,
        validationErrorResponse({ email: 'Valid email address is required' }),
        400
      );
    }

    if (!password || password.length < 8) {
      return sendResponse(
        res,
        validationErrorResponse({ password: 'Password must be at least 8 characters' }),
        400
      );
    }

    if (!name || name.trim().length === 0) {
      return sendResponse(res, validationErrorResponse({ name: 'Name is required' }), 400);
    }

    const result = await authService.register({
      email: email.trim(),
      password,
      name: name.trim(),
    });

    return sendResponse(
      res,
      {
        data: {
          user: result.user,
          token: result.tokens.accessToken,
        },
        message: 'User registered successfully',
      },
      201
    );
  } catch (error: any) {
    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return sendResponse(
        res,
        {
          success: false,
          error: {
            message: 'User with this email already exists',
            code: ErrorCode.VALIDATION_ERROR,
            statusCode: 400,
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        },
        400
      );
    }

    console.error('Error registering user:', error);
    return sendResponse(
      res,
      {
        success: false,
        error: {
          message: 'Failed to register user',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
        },
      },
      500
    );
  }
});

// POST /api/v1/auth/login - Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !email.trim() || !email.includes('@')) {
      return sendResponse(
        res,
        validationErrorResponse({ email: 'Valid email address is required' }),
        400
      );
    }

    if (!password) {
      return sendResponse(res, validationErrorResponse({ password: 'Password is required' }), 400);
    }

    const result = await authService.login({
      email: email.trim(),
      password,
    });

    return sendResponse(res, {
      ...successResponse({
        token: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        user: result.user,
      }),
      message: 'Login successful',
    });
  } catch (error: any) {
    if (error.message === 'INVALID_CREDENTIALS' || error.message === 'ACCOUNT_DISABLED') {
      return sendResponse(
        res,
        {
          success: false,
          error: {
            message: 'Invalid credentials',
            code: ErrorCode.UNAUTHORIZED,
            statusCode: 401,
          },
        },
        401
      );
    }

    console.error('Error logging in user:', error);
    return sendResponse(
      res,
      {
        success: false,
        error: {
          message: 'Failed to login user',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
        },
      },
      500
    );
  }
});

// POST /api/v1/auth/refresh - Refresh access token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendResponse(
        res,
        validationErrorResponse({ refreshToken: 'Refresh token is required' }),
        400
      );
    }

    const tokens = await authService.refreshAccessToken(refreshToken);

    return sendResponse(res, {
      ...successResponse({
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }),
      message: 'Token refreshed successfully',
    });
  } catch (error: any) {
    if (error.message === 'INVALID_REFRESH_TOKEN' || error.message === 'REFRESH_TOKEN_FAILED') {
      return sendResponse(
        res,
        {
          success: false,
          error: {
            message: 'Invalid or expired refresh token',
            code: ErrorCode.UNAUTHORIZED,
            statusCode: 401,
          },
        },
        401
      );
    }

    console.error('Error refreshing token:', error);
    return sendResponse(
      res,
      {
        success: false,
        error: {
          message: 'Failed to refresh token',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
        },
      },
      500
    );
  }
});

// GET /api/v1/auth/me - Get current user
router.get('/me', async (req: Request, res: Response) => {
  try {
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

    const user = await authService.getUserById(userId);

    if (!user) {
      return sendResponse(
        res,
        {
          success: false,
          error: {
            message: 'User not found',
            code: ErrorCode.NOT_FOUND,
            statusCode: 404,
          },
        },
        404
      );
    }

    return sendResponse(res, {
      ...successResponse(user),
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return sendResponse(
      res,
      {
        success: false,
        error: {
          message: 'Failed to fetch user',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
        },
      },
      500
    );
  }
});

// PUT /api/v1/auth/profile - Update user profile
router.put('/profile', async (req: Request, res: Response) => {
  try {
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

    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return sendResponse(res, validationErrorResponse({ name: 'Name is required' }), 400);
    }

    const user = await authService.updateUser(userId, { name: name.trim() });

    return sendResponse(res, {
      ...successResponse(user),
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') {
      return sendResponse(
        res,
        {
          success: false,
          error: {
            message: 'User not found',
            code: ErrorCode.NOT_FOUND,
            statusCode: 404,
          },
        },
        404
      );
    }

    console.error('Error updating profile:', error);
    return sendResponse(
      res,
      {
        success: false,
        error: {
          message: 'Failed to update profile',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
        },
      },
      500
    );
  }
});

// PUT /api/v1/auth/password - Change password
router.put('/password', async (req: Request, res: Response) => {
  try {
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

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return sendResponse(
        res,
        validationErrorResponse({
          oldPassword: !oldPassword ? 'Old password is required' : undefined,
          newPassword: !newPassword ? 'New password is required' : undefined,
        }),
        400
      );
    }

    if (newPassword.length < 8) {
      return sendResponse(
        res,
        validationErrorResponse({ newPassword: 'Password must be at least 8 characters' }),
        400
      );
    }

    await authService.changePassword(userId, oldPassword, newPassword);

    return sendResponse(res, {
      ...successResponse(undefined),
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    if (error.message === 'INVALID_PASSWORD') {
      return sendResponse(
        res,
        {
          success: false,
          error: {
            message: 'Invalid old password',
            code: ErrorCode.UNAUTHORIZED,
            statusCode: 401,
          },
        },
        401
      );
    }

    console.error('Error changing password:', error);
    return sendResponse(
      res,
      {
        success: false,
        error: {
          message: 'Failed to change password',
          code: ErrorCode.INTERNAL_SERVER_ERROR,
        },
      },
      500
    );
  }
});

export default router;
