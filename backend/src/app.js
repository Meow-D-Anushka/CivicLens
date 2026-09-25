import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';

const app = express();

// --- Core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
  })
);
app.use(express.json());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// --- Routes ---
// API routes (report routes, etc.) are added in Phase 2, once the
// Express API layer (routes/controllers/services) is implemented.
app.get('/', (_req, res) => {
  res.json({
    success: true,
    service: 'CivicLens API',
    message: 'Backend scaffold is running. API routes arrive in Phase 2.',
  });
});

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// --- Centralized error handler ---
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    error: env.nodeEnv === 'production' ? 'Internal server error' : err.message,
  });
});

export default app;
