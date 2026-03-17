import { createApp } from './app';
import config from './config';
import { registerRoutes } from './routes';

// Create Express app
const app = createApp();

// Register all routes
registerRoutes(app);

// Health check endpoint (before rate limiting)
app.get('/api/v1/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    nodeEnv: config.nodeEnv,
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
      statusCode: 404,
      path: req.path,
      timestamp: new Date().toISOString(),
    },
  });
});

// Start server
const server = app.listen(config.port, () => {
  console.log(`
╔═════════════════════════════════════╗
║                                           ║
║   MultiLanguageManager Backend API          ║
║                                           ║
║   Server: http://localhost:${config.port}  ║
║   Environment: ${config.nodeEnv.padEnd(20)} ║
║                                           ║
║   Press Ctrl+C to stop                   ║
║                                           ║
╚═══════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;
