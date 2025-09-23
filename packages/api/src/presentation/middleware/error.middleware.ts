import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { loggers } from '../../infrastructure/logging/logger';
import { env } from '../../shared/config/env.config';

/**
 * Interface pour la réponse d'erreur standardisée
 */
interface ErrorResponse {
  status: 'error';
  message: string;
  code?: string;
  details?: any;
  stack?: string;
  timestamp: string;
  path: string;
  method: string;
}

/**
 * Middleware global de gestion des erreurs
 * Doit être le dernier middleware dans la chaîne
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const timestamp = new Date().toISOString();
  const path = req.originalUrl || req.path;
  const method = req.method;

  // Construire la réponse d'erreur de base
  const errorResponse: ErrorResponse = {
    status: 'error',
    message: 'Une erreur est survenue',
    timestamp,
    path,
    method
  };

  // Si c'est une AppError (erreur gérée)
  if (error instanceof AppError) {
    errorResponse.message = error.message;
    errorResponse.code = error.code;

    // Logger selon le niveau de sévérité
    if (error.statusCode >= 500) {
      loggers.error('Application error', error, {
        statusCode: error.statusCode,
        path,
        method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: (req as any).userId,
        requestId: req.get('X-Request-ID')
      });
    } else {
      loggers.warn('Client error', {
        message: error.message,
        statusCode: error.statusCode,
        code: error.code,
        path,
        method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: (req as any).userId
      });
    }

    return res.status(error.statusCode).json(errorResponse);
  }

  // Erreurs Mongoose
  if (error.name === 'ValidationError') {
    errorResponse.message = 'Données invalides';
    errorResponse.code = 'VALIDATION_ERROR';

    if (env.NODE_ENV === 'development') {
      errorResponse.details = Object.values((error as any).errors).map((e: any) => ({
        field: e.path,
        message: e.message
      }));
    }

    loggers.warn('Mongoose validation error', {
      error: error.message,
      path,
      method,
      ip: req.ip
    });

    return res.status(400).json(errorResponse);
  }

  // Erreur de duplication MongoDB (code 11000)
  if ((error as any).code === 11000) {
    errorResponse.message = 'Ressource déjà existante';
    errorResponse.code = 'DUPLICATE_ERROR';

    // Extraire le champ dupliqué si possible
    const match = error.message.match(/index: (.+?) dup key/);
    if (match && env.NODE_ENV === 'development') {
      errorResponse.details = { duplicatedField: match[1] };
    }

    loggers.warn('MongoDB duplicate key error', {
      error: error.message,
      path,
      method,
      ip: req.ip
    });

    return res.status(409).json(errorResponse);
  }

  // Erreur MongoDB de type CastError (mauvais ObjectId)
  if (error.name === 'CastError') {
    errorResponse.message = 'Identifiant invalide';
    errorResponse.code = 'INVALID_ID';

    loggers.warn('MongoDB cast error', {
      error: error.message,
      path,
      method,
      ip: req.ip
    });

    return res.status(400).json(errorResponse);
  }

  // Erreur JWT
  if (error.name === 'JsonWebTokenError') {
    errorResponse.message = 'Token invalide';
    errorResponse.code = 'INVALID_TOKEN';

    loggers.warn('JWT error', {
      error: error.message,
      path,
      method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    return res.status(401).json(errorResponse);
  }

  // Erreur JWT expiré
  if (error.name === 'TokenExpiredError') {
    errorResponse.message = 'Token expiré';
    errorResponse.code = 'TOKEN_EXPIRED';

    loggers.warn('JWT expired', {
      path,
      method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    return res.status(401).json(errorResponse);
  }

  // Erreur de syntaxe JSON
  if (error instanceof SyntaxError && 'body' in error) {
    errorResponse.message = 'Format JSON invalide';
    errorResponse.code = 'INVALID_JSON';

    loggers.warn('JSON syntax error', {
      error: error.message,
      path,
      method,
      ip: req.ip
    });

    return res.status(400).json(errorResponse);
  }

  // Erreur de limite de taille (multer, express)
  if (error.message.includes('File too large') || error.message.includes('request entity too large')) {
    errorResponse.message = 'Fichier ou requête trop volumineux';
    errorResponse.code = 'FILE_TOO_LARGE';

    loggers.warn('File/request too large', {
      error: error.message,
      path,
      method,
      ip: req.ip
    });

    return res.status(413).json(errorResponse);
  }

  // Erreurs inattendues (500)
  errorResponse.message = 'Erreur serveur interne';
  errorResponse.code = 'INTERNAL_ERROR';

  // En développement, inclure la stack trace
  if (env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
    errorResponse.details = {
      name: error.name,
      originalMessage: error.message
    };
  }

  // Logger l'erreur critique
  loggers.error('Unhandled error', error, {
    path,
    method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).userId,
    requestId: req.get('X-Request-ID'),
    body: req.body,
    query: req.query,
    params: req.params
  });

  res.status(500).json(errorResponse);
};

/**
 * Middleware pour capturer les erreurs asynchrones
 */
export const asyncErrorHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware pour gérer les routes non trouvées (404)
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = AppError.notFound(`Route ${req.method} ${req.originalUrl} non trouvée`);
  next(error);
};

/**
 * Middleware pour gérer les erreurs non capturées au niveau global
 */
export const setupGlobalErrorHandlers = (): void => {
  // Erreurs non capturées (uncaughtException)
  process.on('uncaughtException', (error: Error) => {
    loggers.error('Uncaught Exception', error, {
      type: 'uncaughtException',
      pid: process.pid
    });

    // Arrêter proprement l'application
    process.exit(1);
  });

  // Promesses rejetées non gérées (unhandledRejection)
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    loggers.error('Unhandled Rejection', reason instanceof Error ? reason : new Error(String(reason)), {
      type: 'unhandledRejection',
      promise: promise.toString(),
      pid: process.pid
    });

    // Arrêter proprement l'application
    process.exit(1);
  });

  // Signaux de terminaison gracieuse
  ['SIGTERM', 'SIGINT'].forEach((signal) => {
    process.on(signal, () => {
      loggers.info(`Received ${signal}, shutting down gracefully`);
      process.exit(0);
    });
  });
};