import { Application } from 'express';
import projectRoutes from './projectRoutes';
import entryRoutes from './entryRoutes';
import exportRoutes from './exportRoutes';
import apiKeyRoutes from './apiKeyRoutes';
import authRoutes from './authRoutes';
import { uploadExcelHandler } from './entryUpload';
import { apiRateLimiter, uploadRateLimiter } from '../middleware/rateLimiter';
import { optionalAuthenticate } from '../middleware/auth';
import config from '../config';
export const registerRoutes = (app: Application): void => {
  // API routes
  app.use('/api/v1/projects', projectRoutes);
  app.use('/api/v1/projects', entryRoutes);

  app.use('/api/v1/exports', optionalAuthenticate, exportRoutes);
  app.use('/api/v1/api-keys', apiKeyRoutes);
  app.use('/api/v1/auth', authRoutes);
  // Root API endpoint
  // Root API endpoint
  app.get('/api/v1', (req, res) => {
    res.json({
      name: 'MultiLanguageManager API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      endpoints: {
        projects: '/api/v1/projects',
        entries: '/api/v1/projects/:projectId/entries',
        exports: '/api/v1/projects/:projectId/exports',
        apiKeys: '/api/v1/api-keys',
        auth: '/api/v1/auth',
        health: '/api/v1/health',
      },
    });
  });
};
