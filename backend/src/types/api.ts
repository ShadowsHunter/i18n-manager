import { Request } from 'express';

export enum ErrorCode {
  // General
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Projects
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
  PROJECT_ALREADY_EXISTS = 'PROJECT_ALREADY_EXISTS',

  // Entries
  ENTRY_NOT_FOUND = 'ENTRY_NOT_FOUND',
  ENTRY_ALREADY_EXISTS = 'ENTRY_ALREADY_EXISTS',
  INVALID_ENTRY_UUID = 'INVALID_ENTRY_UUID',

  // API Keys
  API_KEY_NOT_FOUND = 'API_KEY_NOT_FOUND',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  INVALID_API_KEY = 'INVALID_API_KEY',

  // File Upload
  INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_PARSE_ERROR = 'FILE_PARSE_ERROR',

  // Auth
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',

  // Exports
  INVALID_PLATFORM = 'INVALID_PLATFORM',
  INVALID_LANGUAGE = 'INVALID_LANGUAGE',
  INVALID_STATUS = 'INVALID_STATUS',

  // General
  BAD_REQUEST = 'BAD_REQUEST',
  CONFLICT = 'CONFLICT',
}

export interface ApiError {
  message: string;
  code: ErrorCode;
  statusCode: number;
  timestamp: string;
  path: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiErrorWithDetails {
  message: string;
  code: ErrorCode;
  statusCode: number;
  timestamp: string;
  path: string;
  details?: unknown;
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

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'DELETED';

export interface ProjectWithStats extends Project {
  entriesCount?: number;
  exportsCount?: number;
}

export type ExportStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Export {
  id: string;
  projectId: string;
  platforms: string[];
  languages: string[];
  status: ExportStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  downloadUrl?: string;
}

export interface Entry {
  id: string;
  key: string;
  projectId: string;
  status: EntryStatus;
  cn: string;
  en: string;
  de: string;
  es: string;
  fi: string;
  fr: string;
  it: string;
  nl: string;
  no: string;
  pl: string;
  se: string;
  createdAt: string;
  updatedAt: string;
}

export type EntryStatus = 'NEW' | 'MODIFIED' | 'DELETED';

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  suffix: string;
  key: string;
  status: ApiKeyStatus;
  usageCount: number;
  lastUsed: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ApiKeyStatus = 'ACTIVE' | 'REVOKED';

export interface JwtPayload {
  userId: string;
  email: string;
  name?: string;
}

export interface RequestWithUser extends Request {
  user?: JwtPayload;
  apiKey?: string;
}
