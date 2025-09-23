import 'reflect-metadata';
import dotenv from 'dotenv';

// Charger les variables d'environnement en premier
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';

// Configuration et logging
import { env } from './shared/config/env.config';
import { logger, loggers } from './infrastructure/logging/logger.simple';

// Sécurité
import { securityMiddleware } from './infrastructure/security/security.config';

// Middleware d'erreurs
import {
  errorHandler,
  notFoundHandler,
  setupGlobalErrorHandlers
} from './presentation/middleware/error.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import workoutRoutes from './routes/workout.routes';
import healthDataRoutes from './routes/healthData.routes';
import predictionRoutes from './routes/prediction.routes';
import trainingPlanRoutes from './routes/trainingPlan.routes';

// Configuration des gestionnaires d'erreurs globaux
setupGlobalErrorHandlers();

const app = express();
const PORT = env.PORT;

// Trust proxy (important pour rate limiting et logs)
app.set('trust proxy', 1);

// Sécurité (Helmet, Rate limiting, Sanitization)
app.use(securityMiddleware);

// CORS
app.use(cors({
  origin: env.NODE_ENV === 'development'
    ? true
    : ['https://runcoach-ai.com', 'https://www.runcoach-ai.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Parsing JSON et URL-encoded
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    // Log des requêtes suspectes (très grandes)
    if (buf.length > 5 * 1024 * 1024) { // 5MB
      loggers.warn('Large request detected', {
        size: buf.length,
        path: req.path,
        ip: req.ip
      });
    }
  }
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

// Health check endpoint (avant les autres routes)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '1.0.0'
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/health-data', healthDataRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/training-plans', trainingPlanRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Route de bienvenue pour la racine
app.get('/', (req, res) => {
  res.json({
    message: '🏃‍♂️ RunCoach AI API',
    version: '1.0.0',
    status: 'running',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      workouts: '/api/workouts',
      healthData: '/api/health-data',
      predictions: '/api/predictions',
      trainingPlans: '/api/training-plans',
      health: '/health'
    }
  });
});

// Servir les fichiers statiques en production
if (env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../runcoach-ai/client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../runcoach-ai/client/dist/index.html'));
  });
}

// Gestion des routes non trouvées (404)
app.use(notFoundHandler);

// Middleware global de gestion d'erreurs (doit être en dernier)
app.use(errorHandler);

// Configuration MongoDB
mongoose.set('strictQuery', false);

// Connexion à MongoDB avec gestion d'erreurs améliorée
mongoose
  .connect(env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    loggers.info('MongoDB connected successfully', {
      database: env.MONGODB_URI.split('/').pop()?.split('?')[0],
      environment: env.NODE_ENV
    });

    // Démarrer le serveur seulement après la connexion DB
    const server = app.listen(PORT, () => {
      loggers.info('Server started successfully', {
        port: PORT,
        environment: env.NODE_ENV,
        logLevel: env.LOG_LEVEL,
        pid: process.pid
      });
    });

    // Gestion gracieuse de l'arrêt du serveur
    const gracefulShutdown = (signal: string) => {
      loggers.info(`Received ${signal}, starting graceful shutdown`);

      server.close(() => {
        loggers.info('HTTP server closed');

        mongoose.connection.close(false, () => {
          loggers.info('MongoDB connection closed');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  })
  .catch((error) => {
    loggers.error('MongoDB connection failed', error, {
      database: env.MONGODB_URI.split('/').pop()?.split('?')[0],
      environment: env.NODE_ENV
    });
    process.exit(1);
  });

// Gestion des erreurs de connexion MongoDB
mongoose.connection.on('error', (error) => {
  loggers.error('MongoDB connection error', error);
});

mongoose.connection.on('disconnected', () => {
  loggers.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  loggers.info('MongoDB reconnected');
});