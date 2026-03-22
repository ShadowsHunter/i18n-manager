import axios, { AxiosInstance, AxiosError } from 'axios';

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // 服务器返回错误响应
      const status = error.response.status;

      if (status === 401) {
        // 未授权，清除token并跳转到登录页
        // 检查当前路径是否已经是登录页，避免循环跳转和页面刷新
        const currentPath = window.location.pathname;
        if (currentPath !== '/login') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else if (status === 403) {
        // 禁止访问
        console.error('Access forbidden');
      } else if (status === 404) {
        // 资源未找到
        console.error('Resource not found');
      } else if (status >= 500) {
        // 服务器错误
        console.error('Server error');
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('No response received:', error.message);
    } else {
      // 请求配置错误
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    code?: string;
    statusCode?: number;
    timestamp?: string;
    path?: string;
  };
}

export interface PaginatedResponse<T> {
  entries: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 用户类型
export interface User {
  id: string;
  email: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

// 项目类型
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  languages: string[];
  createdAt: string;
  updatedAt: string;
}

// 条目类型
export interface Entry {
  id: string;
  uuid: string;
  projectId: string;
  key: string;
  cn: string | null;
  en: string | null;
  de: string | null;
  es: string | null;
  fi: string | null;
  fr: string | null;
  it: string | null;
  nl: string | null;
  no: string | null;
  pl: string | null;
  se: string | null;
  status: 'NEW' | 'MODIFIED' | 'TRANSLATED' | 'REVIEWED';
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

// API密钥类型
export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  suffix: string;
  lastUsed: string | null;
  usageCount: number;
  status: 'ACTIVE' | 'REVOKED';
  expiresAt: string | null;
  createdAt: string;
}

// 导出类型
export interface Export {
  id: string;
  projectId: string;
  platforms: string[];
  languages: string[];
  url: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errorMessage: string | null;
  createdBy: string;
  createdAt: string;
  completedAt: string | null;
}

export default apiClient;
