/**
 * ExportService - 使用 Supabase 客户端访问数据库
 * 提供完整的导出功能，支持多平台和多语言
 */

import { supabase, handleSupabaseError } from '../lib/supabase';

export type ExportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface CreateExportInput {
  projectId: string;
  platforms: string[];
  languages: string[];
  userId: string;
}

export interface UpdateExportInput {
  status?: ExportStatus;
  url?: string;
  errorMessage?: string;
}

export interface ExportFilters {
  status?: ExportStatus;
  search?: string;
  skip?: number;
  take?: number;
}

export interface Export {
  id: string;
  projectId: string;
  platforms: string[];
  languages: string[];
  url: string | null;
  status: ExportStatus;
  errorMessage: string | null;
  createdBy: string;
  createdAt: string;
  completedAt: string | null;
}

export interface PaginatedExports {
  exports: Export[];
  total: number;
  pages: number;
  currentPage: number;
}

export interface ExportWithDetails extends Export {
  project?: {
    id: string;
    name: string;
    status: string;
    languages: string[];
  };
  creator?: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Service for managing exports
 */
export class ExportService {
  /**
   * Get all exports for a project with filters and pagination
   */
  async getExports(projectId: string, filters?: ExportFilters): Promise<PaginatedExports> {
    const { status, skip = 0, take = 50 } = filters || {};

    let query = supabase.from('exports').select('*', { count: 'exact' });

    // Apply project filter
    query = query.eq('projectid', projectId);

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query.order('createdat', { ascending: false }).range(skip, skip + take - 1);

    const { data: exports, error, count } = await query;

    if (error) {
      handleSupabaseError(error);
    }

    // Map database fields to Export interface
    const mappedExports =
      exports?.map((exp) => ({
        id: exp.id,
        projectId: exp.projectid,
        platforms: exp.platforms,
        languages: exp.languages,
        url: exp.url,
        status: exp.status,
        errorMessage: exp.errormessage,
        createdBy: exp.createdby,
        createdAt: exp.createdat,
        completedAt: exp.completedat,
      })) || [];

    return {
      exports: mappedExports,
      total: count || 0,
      pages: Math.ceil((count || 0) / take),
      currentPage: Math.floor(skip / take) + 1,
    };
  }

  /**
   * Get a single export by ID with details
   */
  async getExportById(id: string): Promise<ExportWithDetails> {
    const { data: exp, error: fetchError } = await supabase
      .from('exports')
      .select(
        `
        *,
        project:projects(id, name, status, languages),
        creator:users(id, name, email)
      `
      )
      .eq('id', id)
      .single();

    if (fetchError) {
      handleSupabaseError(fetchError);
    }

    if (!exp) {
      throw new Error('EXPORT_NOT_FOUND');
    }

    return {
      ...exp,
      project: exp.project,
      creator: exp.creator,
    };
  }

  /**
   * Create a new export task
   */
  async createExport(input: CreateExportInput): Promise<Export> {
    // Verify project exists
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id, name, status, languages')
      .eq('id', input.projectId)
      .maybeSingle();

    if (fetchError) {
      handleSupabaseError(fetchError);
    }

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    // Check project status
    if (project.status !== 'ACTIVE') {
      throw new Error('PROJECT_NOT_ACTIVE');
    }

    // Create export task
    const { data: exp, error } = await supabase
      .from('exports')
      .insert([
        {
          projectid: input.projectId,
          platforms: input.platforms,
          languages: input.languages,
          status: 'PENDING',
          createdby: input.userId,
        },
      ])
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    return {
      id: exp.id,
      projectId: exp.projectid,
      platforms: exp.platforms,
      languages: exp.languages,
      url: exp.url,
      status: exp.status,
      errorMessage: exp.errormessage,
      createdBy: exp.createdby,
      createdAt: exp.createdat,
      completedAt: exp.completedat,
    };
  }

  /**
   * Update export status
   */
  async updateExportStatus(id: string, input: UpdateExportInput): Promise<Export> {
    // Prepare update data
    const updateData: any = {};

    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    if (input.url !== undefined) {
      updateData.url = input.url;
    }

    if (input.errorMessage !== undefined) {
      updateData.errormessage = input.errorMessage;
    }

    // If status is COMPLETED, set completed_at timestamp
    if (input.status === 'COMPLETED') {
      updateData.completedat = new Date().toISOString();
    }

    // Update export
    const { data: exp, error } = await supabase
      .from('exports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    return {
      id: exp.id,
      projectId: exp.projectid,
      platforms: exp.platforms,
      languages: exp.languages,
      url: exp.url,
      status: exp.status,
      errorMessage: exp.errormessage,
      createdBy: exp.createdby,
      createdAt: exp.createdat,
      completedAt: exp.completedat,
    };
  }

  /**
   * Delete an export
   */
  async deleteExport(id: string): Promise<void> {
    const { error } = await supabase.from('exports').delete().eq('id', id);

    if (error) {
      handleSupabaseError(error);
    }
  }

  /**
   * Get export statistics for a project
   */
  async getExportStats(projectId: string): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    // Get total count
    const { count: total } = await supabase
      .from('exports')
      .select('*', { count: 'exact', head: true })
      .eq('projectid', projectId);

    // Get status counts
    const { data: statusCounts } = await supabase
      .from('exports')
      .select('status, count')
      .eq('projectid', projectId);

    // Convert to Record format
    const stats: Record<string, number> = {};
    statusCounts?.forEach((item) => {
      if (item.status) {
        stats[item.status] = item.count;
      }
    });

    return {
      total: total || 0,
      pending: stats.PENDING || 0,
      processing: stats.PROCESSING || 0,
      completed: stats.COMPLETED || 0,
      failed: stats.FAILED || 0,
    };
  }

  /**
   * Get export statistics for all projects
   */
  async getGlobalExportStats(): Promise<{
    totalExports: number;
    totalProjects: number;
    activeExports: number;
    completedExports: number;
    failedExports: number;
  }> {
    // Get total counts by table
    const [exportsCount, projectsCount] = await Promise.all([
      supabase.from('exports').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
    ]);

    // Get active exports count
    const { count: activeExports } = await supabase
      .from('exports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING');

    // Get completed exports count
    const { count: completedExports } = await supabase
      .from('exports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'COMPLETED');

    // Get failed exports count
    const { count: failedExports } = await supabase
      .from('exports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'FAILED');

    return {
      totalExports: exportsCount?.count || 0,
      totalProjects: projectsCount?.count || 0,
      activeExports: activeExports?.count || 0,
      completedExports: completedExports?.count || 0,
      failedExports: failedExports?.count || 0,
    };
  }
}

// Export singleton instance
export const exportService = new ExportService();
