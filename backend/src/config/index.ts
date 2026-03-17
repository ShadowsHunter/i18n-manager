import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiration: string;
  corsOrigin: string;
  logLevel: string;
  maxFileSize: number;
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  jwtSecret: process.env.JWT_SECRET || 'change-this-in-production',
  jwtExpiration: process.env.JWT_EXPIRATION || '7d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  logLevel: process.env.LOG_LEVEL || 'info',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB in bytes
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '3600000', 10), // 1 hour in ms
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per window
  },
};

export default config;
