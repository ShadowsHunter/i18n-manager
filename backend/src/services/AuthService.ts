/**
 * AuthService - 使用 Supabase 客户端访问数据库
 * 提供完整的认证和授权功能
 */

import { supabase, handleSupabaseError } from '../lib/supabase';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service for authentication and authorization
 */
export class AuthService {
  private readonly JWT_SECRET =
    process.env.JWT_SECRET || 'dev-secret-key-change-in-production-min-32-chars-long';
  private readonly JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d';
  private readonly REFRESH_TOKEN_EXPIRATION_DAYS = 30;
  private readonly SALT_ROUNDS = 10;

  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<{ user: User; tokens: AuthTokens }> {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', input.email.trim())
      .maybeSingle();

    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, this.SALT_ROUNDS);

    // Create user using Supabase
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          email: input.email.trim(),
          password: hashedPassword,
          name: input.name.trim(),
          active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    const user: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      active: newUser.active,
      createdAt: newUser.created_at,
      updatedAt: newUser.updated_at,
    };

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.name);

    return {
      user,
      tokens,
    };
  }

  /**
   * Login user
   */
  async login(input: LoginInput): Promise<{ user: User; tokens: AuthTokens }> {
    // Find user by email
    const { data: userResult, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', input.email.trim())
      .maybeSingle();

    if (error) {
      handleSupabaseError(error);
    }

    if (!userResult) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Check if user is active
    if (!userResult.active) {
      throw new Error('ACCOUNT_DISABLED');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(input.password, userResult.password);

    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const user: User = {
      id: userResult.id,
      email: userResult.email,
      name: userResult.name,
      active: userResult.active,
      createdAt: userResult.created_at,
      updatedAt: userResult.updated_at,
    };

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.name);

    return {
      user,
      tokens,
    };
  }

  /**
   * Generate JWT tokens
   */
  private async generateTokens(userId: string, email: string, name: string): Promise<AuthTokens> {
    const payload: JwtPayload = {
      userId,
      email,
      name,
    };

    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRATION,
    });

    const refreshToken = jwt.sign({ userId, email }, this.JWT_SECRET, {
      expiresIn: `${this.REFRESH_TOKEN_EXPIRATION_DAYS}d`,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JwtPayload;
    } catch (error) {
      throw new Error('INVALID_TOKEN');
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JwtPayload;
    } catch (error) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.verifyRefreshToken(refreshToken);

      // Get user from database
      const { data: userResult, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', payload.userId)
        .maybeSingle();

      if (error) {
        handleSupabaseError(error);
      }

      if (!userResult || !userResult.active) {
        throw new Error('USER_NOT_FOUND');
      }

      const user: User = {
        id: userResult.id,
        email: userResult.email,
        name: userResult.name,
        active: userResult.active,
        createdAt: userResult.created_at,
        updatedAt: userResult.updated_at,
      };

      // Generate new tokens
      return this.generateTokens(user.id, user.email, user.name);
    } catch (error) {
      throw new Error('REFRESH_TOKEN_FAILED');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    const { data: userResult, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      handleSupabaseError(error);
    }

    if (!userResult) {
      return null;
    }

    return {
      id: userResult.id,
      email: userResult.email,
      name: userResult.name,
      active: userResult.active,
      createdAt: userResult.created_at,
      updatedAt: userResult.updated_at,
    };
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updates: { name?: string }) {
    if (!updates.name) {
      throw new Error('NO_UPDATES_PROVIDED');
    }

    const { data: userResult, error } = await supabase
      .from('users')
      .update({
        name: updates.name.trim(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    return {
      id: userResult.id,
      email: userResult.email,
      name: userResult.name,
      active: userResult.active,
      createdAt: userResult.created_at,
      updatedAt: userResult.updated_at,
    };
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    // Get user
    const { data: userResult, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      handleSupabaseError(fetchError);
    }

    if (!userResult) {
      throw new Error('USER_NOT_FOUND');
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, userResult.password);

    if (!isPasswordValid) {
      throw new Error('INVALID_PASSWORD');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Update password
    const { error } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
      })
      .eq('id', userId);

    if (error) {
      handleSupabaseError(error);
    }

    return { success: true };
  }
}

// Export singleton instance
export const authService = new AuthService();
