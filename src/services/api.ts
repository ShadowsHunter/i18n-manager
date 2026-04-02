import apiClient, {
  ApiResponse,
  PaginatedResponse,
  User,
  LoginResponse,
  Project,
  Entry,
  ApiKey,
  Export,
} from './apiClient';

/**
 * 认证相关API
 */
export const authApi = {
  /**
   * 用户登录
   */
  login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  /**
   * 用户注册
   */
  register: async (
    email: string,
    password: string,
    name: string
  ): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/register',
      {
        email,
        password,
        name,
      }
    );
    return response.data;
  },

  /**
   * 获取当前用户信息
   */
  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  /**
   * 刷新访问令牌
   */
  refreshToken: async (
    refreshToken: string
  ): Promise<ApiResponse<{ token: string; refreshToken: string }>> => {
    const response = await apiClient.post<ApiResponse<{ token: string; refreshToken: string }>>(
      '/auth/refresh',
      {
        refreshToken,
      }
    );
    return response.data;
  },

  /**
   * 更新用户资料
   */
  updateProfile: async (name: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>('/auth/profile', { name });
    return response.data;
  },

  /**
   * 修改密码
   */
  changePassword: async (oldPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.put<ApiResponse<void>>('/auth/password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },
};

/**
 * 项目相关API
 */
export const projectApi = {
  /**
   * 获取项目列表
   */
  getProjects: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Project>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Project>>>('/projects', {
      params,
    });
    return response.data;
  },

  /**
   * 获取项目详情
   */
  getProject: async (id: string): Promise<ApiResponse<Project>> => {
    const response = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data;
  },

  /**
   * 创建项目
   */
  createProject: async (data: {
    name: string;
    description: string;
    languages: string[];
  }): Promise<ApiResponse<Project>> => {
    const response = await apiClient.post<ApiResponse<Project>>('/projects', data);
    return response.data;
  },

  /**
   * 更新项目
   */
  updateProject: async (
    id: string,
    data: {
      name?: string;
      description?: string;
      status?: 'ACTIVE' | 'ARCHIVED';
      languages?: string[];
    }
  ): Promise<ApiResponse<Project>> => {
    const response = await apiClient.put<ApiResponse<Project>>(`/projects/${id}`, data);
    return response.data;
  },

  /**
   * 删除项目
   */
  deleteProject: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/projects/${id}`);
    return response.data;
  },

  /**
   * 获取项目统计
   */
  getProjectStats: async (
    id: string
  ): Promise<
    ApiResponse<{
      totalEntries: number;
      completedEntries: number;
      inProgressEntries: number;
      notStartedEntries: number;
    }>
  > => {
    const response = await apiClient.get<
      ApiResponse<{
        totalEntries: number;
        completedEntries: number;
        inProgressEntries: number;
        notStartedEntries: number;
      }>
    >(`/projects/${id}/stats`);
    return response.data;
  },
};

/**
 * 条目相关API
 */
export const entryApi = {
  /**
   * 获取条目列表
   */
  getEntries: async (
    projectId: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      filter?: string;
    }
  ): Promise<ApiResponse<PaginatedResponse<Entry>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Entry>>>(
      `/projects/${projectId}/entries`,
      { params }
    );
    return response.data;
  },

  /**
   * 获取项目的全部条目（无分页限制，通过后端分页循环获取所有数据）
   */
  getAllEntries: async (
    projectId: string
  ): Promise<ApiResponse<{ entries: Entry[]; total: number }>> => {
    const response = await apiClient.get<ApiResponse<{ entries: Entry[]; total: number }>>(
      `/projects/${projectId}/entries/all`
    );
    return response.data;
  },

  /**
   * 获取条目详情
   */
  getEntry: async (projectId: string, id: string): Promise<ApiResponse<Entry>> => {
    const response = await apiClient.get<ApiResponse<Entry>>(
      `/projects/${projectId}/entries/${id}`
    );
    return response.data;
  },

  /**
   * 创建条目
   */
  createEntry: async (
    projectId: string,
    data: {
      key: string;
      cn?: string;
      en?: string;
      de?: string;
      es?: string;
      fi?: string;
      fr?: string;
      it?: string;
      nl?: string;
      no?: string;
      pl?: string;
      se?: string;
    }
  ): Promise<ApiResponse<Entry>> => {
    const response = await apiClient.post<ApiResponse<Entry>>(
      `/projects/${projectId}/entries`,
      data
    );
    return response.data;
  },

  /**
   * 更新条目
   */
  updateEntry: async (
    projectId: string,
    id: string,
    data: Partial<Entry>
  ): Promise<ApiResponse<Entry>> => {
    const response = await apiClient.put<ApiResponse<Entry>>(
      `/projects/${projectId}/entries/${id}`,
      data
    );
    return response.data;
  },

  /**
   * 删除条目
   */
  deleteEntry: async (projectId: string, id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/projects/${projectId}/entries/${id}`
    );
    return response.data;
  },

  /**
   * 批量更新条目
   */
  bulkUpdateEntries: async (
    projectId: string,
    data: {
      ids: string[];
      updates: Partial<Entry>;
    }
  ): Promise<ApiResponse<{ updatedCount: number; ids: string[] }>> => {
    const response = await apiClient.post<ApiResponse<{ updatedCount: number; ids: string[] }>>(
      `/projects/${projectId}/entries/bulk`,
      data
    );
    return response.data;
  },

  /**
   * 批量删除条目
   */
  bulkDeleteEntries: async (
    projectId: string,
    data: {
      ids: string[];
    }
  ): Promise<ApiResponse<{ deletedCount: number; ids: string[] }>> => {
    const response = await apiClient.post<ApiResponse<{ deletedCount: number; ids: string[] }>>(
      `/projects/${projectId}/entries/bulk-delete`,
      data
    );
    return response.data;
  },

  /**
   * 上传Excel文件
   */
  uploadExcel: async (
    projectId: string,
    file: File
  ): Promise<
    ApiResponse<{
      success: boolean;
      imported: number;
      updated: number;
      failed: number;
      errors: string[];
    }>
  > => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<
      ApiResponse<{
        success: boolean;
        imported: number;
        updated: number;
        failed: number;
        errors: string[];
      }>
    >(`/projects/${projectId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

/**
 * API密钥相关API
 */
export const apiKeyApi = {
  /**
   * 获取API密钥列表
   */
  getApiKeys: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<ApiKey>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ApiKey>>>('/api-keys', {
      params,
    });
    return response.data;
  },

  /**
   * 创建API密钥
   */
  createApiKey: async (data: { name: string }): Promise<ApiResponse<ApiKey & { key: string }>> => {
    const response = await apiClient.post<ApiResponse<ApiKey & { key: string }>>('/api-keys', data);
    return response.data;
  },

  /**
   * 删除API密钥
   */
  deleteApiKey: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api-keys/${id}`);
    return response.data;
  },

  /**
   * 获取API密钥使用统计
   */
  getApiKeyUsage: async (
    id: string
  ): Promise<
    ApiResponse<{
      usageCount: number;
      lastUsed: string | null;
    }>
  > => {
    const response = await apiClient.get<
      ApiResponse<{
        usageCount: number;
        lastUsed: string | null;
      }>
    >(`/api-keys/${id}/usage`);
    return response.data;
  },
};

/**
 * 导出相关API
 */
export const exportApi = {
  /**
   * 获取导出列表
   */
  getExports: async (
    projectId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
    }
  ): Promise<ApiResponse<PaginatedResponse<Export>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Export>>>(
      `/projects/${projectId}/exports`,
      { params }
    );
    return response.data;
  },

  /**
   * 创建导出任务
   */
  createExport: async (
    projectId: string,
    data: {
      platforms: ('iOS' | 'Android' | 'Web' | 'JSON' | 'Excel' | 'CSV')[];
      languages: string[];
    }
  ): Promise<ApiResponse<Export>> => {
    const response = await apiClient.post<ApiResponse<Export>>(
      `/projects/${projectId}/export`,
      data
    );
    return response.data;
  },

  /**
   * 获取导出详情
   */
  getExport: async (projectId: string, id: string): Promise<ApiResponse<Export>> => {
    const response = await apiClient.get<ApiResponse<Export>>(
      `/projects/${projectId}/exports/${id}`
    );
    return response.data;
  },

  /**
   * 删除导出
   */
  deleteExport: async (projectId: string, id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/projects/${projectId}/exports/${id}`
    );
    return response.data;
  },
};

/**
 * 健康检查API
 */
export const healthApi = {
  /**
   * 健康检查
   */
  check: async (): Promise<
    ApiResponse<{
      status: string;
      timestamp: string;
      database: string;
      version?: string;
      nodeEnv?: string;
    }>
  > => {
    const response = await apiClient.get<
      ApiResponse<{
        status: string;
        timestamp: string;
        database: string;
        version?: string;
        nodeEnv?: string;
      }>
    >('/health');
    return response.data;
  },
};
