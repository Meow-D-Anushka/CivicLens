import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import reportsRouter from './routes/reports.routes.js';

const app = express();

// --- Core middleware ---
app.use(
  helmet({
    // Helmet's default Cross-Origin-Resource-Policy is 'same-origin', which
    // makes browsers block <img src="..."> loads of the /photo route from
    // the frontend's origin (frontend and backend are separate deployments).
    // 'cross-origin' allows that while keeping helmet's other protections.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: env.frontendUrl,
  })
);
app.use(express.json());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// --- Routes ---
app.get('/', (_req, res) => {
  res.json({
    success: true,
    service: 'CivicLens API',
    message: 'CivicLens API is running.',
  });
});

app.use('/api/reports', reportsRouter);

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
  // Multer (file-too-large, bad file type, etc.) errors don't set `.status`,
  // so surface them as 400s instead of a misleading 500.
  const status = err.status || (err.name === 'MulterError' ? 400 : err.message?.includes('image uploads') ? 400 : 500);
  res.status(status).json({
    success: false,
    error: status === 500 && env.nodeEnv === 'production' ? 'Internal server error' : err.message,
  });
});

export default app;
