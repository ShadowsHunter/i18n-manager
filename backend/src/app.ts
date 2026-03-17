import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { asyncHandler } from 'express-async-errors';
import expressWinston from 'express-winston';
import morgan from 'morgan';
import { createStream } from 'rotating-file-stream';
import winston from 'winston';

import config from './config';

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(compression());

  if (config.nodeEnv !== 'test') {
    const fs = require('fs');
    const logsDir = 'logs';
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
    }
    app.use(morgan(
      ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
      {
        stream: fs.createWriteStream('logs/access.log', { flags: 'a' }),
        immediate: true
      }
    ));
  }

  return app;
}
