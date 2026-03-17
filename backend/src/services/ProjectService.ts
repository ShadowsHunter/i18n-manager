/**
 * ProjectService - 使用 Supabase 客户端访问数据库
 * 提供项目管理功能
 */

import { supabase, handleSupabaseError } from '../lib/supabase';

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'DELETED';

export interface CreateProjectInput {
  name: string;
  description: string;
  languages: string[];
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  languages?: string[];
}

export interface ProjectFilters {
  status?: ProjectStatus;
  search?: string;
  skip?: number;
  take?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  languages: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithStats extends Project {
  entriesCount?: number;
  exportsCount?: number;
}

export interface PaginatedProjects {
  projects: Project[];
  total: number;
  pages: number;
  currentPage: number;
}

/**
 * Service for managing projects
 */
export class ProjectService {
  /**
   * Get all projects with optional filters and pagination
   */
  async getProjects(filters?: ProjectFilters): Promise<PaginatedProjects> {
    const { status, search, skip = 0, take = 50 } = filters || {};

    let query = supabase.from('projects').select('*', { count: 'exact' });

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }


    // Apply pagination
    query = query.range(skip, skip + take - 1);
    const { data: projects, error, count } = await query;

    if (error) {
      handleSupabaseError(error);
    }

    // Parse languages from JSON string to array
    const parsedProjects = (projects || []).map((project: any) => ({
      ...project,
      languages: Array.isArray(project.languages)
        ? project.languages
        : JSON.parse(project.languages || '[]'),
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    }));

    return {
      projects: parsedProjects,
      total: count || 0,
      pages: Math.ceil((count || 0) / take),
      currentPage: Math.floor(skip / take) + 1,
    };
  }

  /**
   * Get a project by ID
   */
  async getProjectById(id: string): Promise<Project> {
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      languages: Array.isArray(project.languages)
        ? project.languages
        : JSON.parse(project.languages || '[]'),
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };
  }

  /**
   * Get a project with entries and exports
   */
  async getProjectWithDetails(id: string) {
    const { data: project, error } = await supabase
      .from('projects')
      .select(
        `
        *,
        entries (id, key, status, created_at),
        exports (id, status, url, created_at, completed_at)
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      languages: Array.isArray(project.languages)
        ? project.languages
        : JSON.parse(project.languages || '[]'),
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      entries: project.entries || [],
      exports: project.exports || [],
    };
  }

  /**
   * Create a new project
   */
  async createProject(input: CreateProjectInput): Promise<Project> {
    const { data: project, error } = await supabase
      .from('projects')
      .insert([
        {
          name: input.name,
          description: input.description,
          languages: JSON.stringify(input.languages),
          status: 'ACTIVE',
        },
      ])
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      languages: input.languages,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };
  }

  /**
   * Update a project
   */
  async updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    // Check if project exists
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      handleSupabaseError(fetchError);
    }

    if (!existingProject) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    // Prepare update data
    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.languages !== undefined) updateData.languages = JSON.stringify(input.languages);

    // Update project
    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      languages:
        input.languages || Array.isArray(project.languages)
          ? project.languages
          : JSON.parse(project.languages || '[]'),
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };
  }

  /**
   * Delete a project (soft delete by setting status to DELETED)
   */
  async deleteProject(id: string): Promise<Project> {
    const { data: project, error } = await supabase
      .from('projects')
      .update({ status: 'DELETED' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      languages: Array.isArray(project.languages)
        ? project.languages
        : JSON.parse(project.languages || '[]'),
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };
  }

  /**
   * Archive a project
   */
  async archiveProject(id: string): Promise<Project> {
    const { data: project, error } = await supabase
      .from('projects')
      .update({ status: 'ARCHIVED' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      languages: Array.isArray(project.languages)
        ? project.languages
        : JSON.parse(project.languages || '[]'),
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };
  }

  /**
   * Get project statistics
   */
  async getProjectStats(id: string): Promise<ProjectWithStats> {
    // Get project
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id, name, description, status, languages, created_at, updated_at')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      handleSupabaseError(fetchError);
    }

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    // Get entries count
    const { count: entriesCount } = await supabase
      .from('entries')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', id);

    // Get exports count
    const { count: exportsCount } = await supabase
      .from('exports')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', id);

    return {
      id: project.id,
      name: project.name,
      description: project.description || '',
      status: project.status,
      languages: Array.isArray(project.languages)
        ? project.languages
        : JSON.parse(project.languages || '[]'),
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      entriesCount: entriesCount || 0,
      exportsCount: exportsCount || 0,
    };
  }
}

// Export singleton instance
export const projectService = new ProjectService();
