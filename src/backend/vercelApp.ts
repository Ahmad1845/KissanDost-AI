import express from 'express';
import {
  rateLimitMiddleware,
  requestLoggerMiddleware,
  centralizedErrorHandler,
} from './middleware/apiMiddleware.ts';
import { v1Router } from './api/v1Router.ts';

const app = express();

// Trust Vercel edge proxy headers for accurate client IP rate-limiting
app.set('trust proxy', 1);

// Vercel Serverless Functions enforce a 4.5 MB request body limit
app.use(express.json({ limit: '4.5mb' }));
app.use(express.urlencoded({ extended: true, limit: '4.5mb' }));
app.use(requestLoggerMiddleware);
app.use(rateLimitMiddleware);

// Mount Modular v1 AI & Agronomic Microservice Routes
app.use('/api', v1Router);
app.use('/', v1Router);

// Centralized API Exception Handler
app.use(centralizedErrorHandler);

export default app;
