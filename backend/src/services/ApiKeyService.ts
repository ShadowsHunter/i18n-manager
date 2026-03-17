/**
 * ApiKeyService - 使用 Supabase 客户端访问数据库
 * 提供完整的API密钥管理功能
 */

import { supabase, handleSupabaseError } from '../lib/supabase';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

export interface CreateApiKeyInput {
  name: string;
  userId: string;
  expiresAt?: Date;
}

export interface UpdateApiKeyInput {
  name?: string;
  expiresAt?: Date;
}

export interface ApiKeyFilters {
  status?: string;
  search?: string;
  skip?: number;
  take?: number;
}

export interface ApiKey {
  id: string;
  name: string;
  keyHash: string;
  prefix: string;
  suffix: string;
  lastUsed: string | null;
  usageCount: number;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  expiresAt: string | null;
  createdBy: string;
  createdAt: string;
  revokedAt: string | null;
}

export interface ApiKeyUsage {
  usageCount: number;
  lastUsed: string | null;
}

export interface PaginatedApiKeys {
  apiKeys: ApiKey[];
  total: number;
  pages: number;
  currentPage: number;
}

/**
 * Service for managing API keys
 */
export class ApiKeyService {
  private readonly KEY_PREFIX = 'mlm_';
  private readonly KEY_LENGTH = 32;

  /**
   * Get all API keys for a user
   */
  async getApiKeys(userId: string, filters?: ApiKeyFilters): Promise<PaginatedApiKeys> {
    const { status, search, skip = 0, take = 50 } = filters || {};

    let query = supabase.from('api_keys').select('*', { count: 'exact' });

    // Apply user filter
    query = query.eq('created_by', userId);

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply search filter
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Apply pagination
    query = query.order('created_at', { ascending: false }).range(skip, skip + take - 1);

    const { data: apiKeys, error, count } = await query;

    if (error) {
      handleSupabaseError(error);
    }

    return {
      apiKeys: apiKeys || [],
      total: count || 0,
      pages: Math.ceil((count || 0) / take),
      currentPage: Math.floor(skip / take) + 1,
    };
  }

  /**
   * Get a single API key by ID
   */
  async getApiKeyById(userId: string, id: string): Promise<ApiKey> {
    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('id', id)
      .eq('created_by', userId)
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    return {
      id: apiKey.id,
      name: apiKey.name,
      keyHash: apiKey.key_hash,
      prefix: apiKey.prefix,
      suffix: apiKey.suffix,
      lastUsed: apiKey.last_used,
      usageCount: apiKey.usage_count,
      status: apiKey.status,
      expiresAt: apiKey.expires_at,
      createdBy: apiKey.created_by,
      createdAt: apiKey.created_at,
      revokedAt: apiKey.revoked_at,
    };
  }

  /**
   * Get API key usage statistics
   */
  async getApiKeyUsage(id: string): Promise<ApiKeyUsage> {
    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .select('usage_count, last_used')
      .eq('id', id)
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    return {
      usageCount: apiKey.usage_count || 0,
      lastUsed: apiKey.last_used || null,
    };
  }

  /**
   * Create a new API key
   */
  async createApiKey(input: CreateApiKeyInput): Promise<ApiKey> {
    // Generate API key (32 bytes for security)
    const rawKey = crypto.randomBytes(this.KEY_LENGTH).toString('hex');
    const keyHash = await bcrypt.hash(rawKey, 10);

    // Create prefix and suffix for display
    const nameSlug = input.name.trim().toLowerCase().replace(/\s+/g, '_');
    const prefix = `${this.KEY_PREFIX}${nameSlug}_`;
    const suffix = rawKey.slice(-4);

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .insert([
        {
          name: input.name.trim(),
          key_hash: keyHash,
          prefix,
          suffix,
          last_used: null,
          usage_count: 0,
          status: 'ACTIVE',
          expires_at: input.expiresAt ? input.expiresAt.toISOString() : null,
          created_by: input.userId,
          revoked_at: null,
        },
      ])
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    return {
      id: apiKey.id,
      name: apiKey.name,
      keyHash: apiKey.key_hash,
      prefix: apiKey.prefix,
      suffix: apiKey.suffix,
      lastUsed: apiKey.last_used,
      usageCount: apiKey.usage_count,
      status: apiKey.status,
      expiresAt: apiKey.expires_at,
      createdBy: apiKey.created_by,
      createdAt: apiKey.created_at,
      revokedAt: apiKey.revoked_at,
      // Only show raw key on creation (user must copy it now!)
      rawKey: rawKey,
    };
  }

  /**
   * Update an API key
   */
  async updateApiKey(userId: string, id: string, input: UpdateApiKeyInput): Promise<ApiKey> {
    // Verify API key exists and belongs to user
    const { data: existingKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('id, created_by')
      .eq('id', id)
      .eq('created_by', userId)
      .maybeSingle();

    if (fetchError) {
      handleSupabaseError(fetchError);
    }

    if (!existingKey) {
      throw new Error('API_KEY_NOT_FOUND');
    }

    // Prepare update data
    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.expiresAt !== undefined) updateData.expires_at = input.expiresAt.toISOString();

    // Update API key
    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .update(updateData)
      .eq('id', id)
      .eq('created_by', userId)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    return {
      id: apiKey.id,
      name: apiKey.name,
      keyHash: apiKey.key_hash,
      prefix: apiKey.prefix,
      suffix: apiKey.suffix,
      lastUsed: apiKey.last_used,
      usageCount: apiKey.usage_count,
      status: apiKey.status,
      expiresAt: apiKey.expires_at,
      createdBy: apiKey.created_by,
      createdAt: apiKey.created_at,
      revokedAt: apiKey.revoked_at,
    };
  }

  /**
   * Revoke (soft delete) an API key
   */
  async revokeApiKey(userId: string, id: string): Promise<ApiKey> {
    // Verify API key exists and belongs to user
    const { data: existingKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('id, created_by')
      .eq('id', id)
      .eq('created_by', userId)
      .maybeSingle();

    if (fetchError) {
      handleSupabaseError(fetchError);
    }

    if (!existingKey) {
      throw new Error('API_KEY_NOT_FOUND');
    }

    const now = new Date().toISOString();

    // Update API key
    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .update({ status: 'REVOKED', revoked_at: now })
      .eq('id', id)
      .eq('created_by', userId)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    return {
      id: apiKey.id,
      name: apiKey.name,
      keyHash: apiKey.key_hash,
      prefix: apiKey.prefix,
      suffix: apiKey.suffix,
      lastUsed: apiKey.last_used,
      usageCount: apiKey.usage_count,
      status: apiKey.status,
      expiresAt: apiKey.expires_at,
      createdBy: apiKey.created_by,
      createdAt: apiKey.created_at,
      revokedAt: apiKey.revoked_at,
    };
  }

  /**
   * Validate an API key by comparing hash
   */
  async validateApiKey(rawKey: string): Promise<{ userId: string; keyId: string } | null> {
    try {
      // Get all active keys
      const { data: apiKeys, error } = await supabase
        .from('api_keys')
        .select('id, created_by, key_hash')
        .eq('status', 'ACTIVE');

      if (error) {
        handleSupabaseError(error);
      }

      // Check each active key
      for (const apiKey of apiKeys || []) {
        const isValid = await bcrypt.compare(rawKey, apiKey.key_hash);
        if (isValid) {
          // Update usage statistics
          const now = new Date().toISOString();
          await supabase
            .from('api_keys')
            .update({
              last_used: now,
              usage_count: apiKey.usage_count + 1,
            })
            .eq('id', apiKey.id);

          return {
            userId: apiKey.created_by,
            keyId: apiKey.id,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error validating API key:', error);
      return null;
    }
  }

  /**
   * Clean up expired API keys
   */
  async cleanupExpiredKeys(): Promise<number> {
    const now = new Date().toISOString();

    const { data: expiredKeys, error } = await supabase
      .from('api_keys')
      .select('id')
      .eq('status', 'ACTIVE')
      .lt('expires_at', now);

    if (error) {
      handleSupabaseError(error);
    }

    if (!expiredKeys || expiredKeys.length === 0) {
      return 0;
    }

    const expiredIds = expiredKeys.map((k) => k.id);

    // Update all expired keys
    const { error: updateError } = await supabase
      .from('api_keys')
      .update({ status: 'EXPIRED' })
      .in('id', expiredIds);

    if (updateError) {
      handleSupabaseError(updateError);
    }

    return expiredIds.length;
  }

  /**
   * Get API key statistics for a user
   */
  async getApiKeyStats(userId: string): Promise<{
    total: number;
    active: number;
    revoked: number;
    expired: number;
    totalUsage: number;
  }> {
    const [totalResult, activeResult, revokedResult, expiredResult] = await Promise.all([
      supabase
        .from('api_keys')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId),
      supabase
        .from('api_keys')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId)
        .eq('status', 'ACTIVE'),
      supabase
        .from('api_keys')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId)
        .eq('status', 'REVOKED'),
      supabase
        .from('api_keys')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId)
        .eq('status', 'EXPIRED')
        .lt('expires_at', new Date().toISOString()),
    ]);

    const total = totalResult.count || 0;
    const active = activeResult.count || 0;
    const revoked = revokedResult.count || 0;
    const expired = expiredResult.count || 0;

    // Get total usage count
    const { data: usageResult } = await supabase
      .from('api_keys')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId);

    const totalUsage = usageResult?.count || 0;

    return {
      total,
      active,
      revoked,
      expired,
      totalUsage,
    };
  }
}

// Export singleton instance
export const apiKeyService = new ApiKeyService();
