import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { AppError } from '../../shared/errors/AppError';
import { loggers } from '../../infrastructure/logging/logger';

/**
 * Middleware de validation générique utilisant Zod
 * @param schema - Schéma Zod pour valider la requête
 * @returns Middleware Express
 */
export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const startTime = Date.now();

      // Validation de la requête complète (body, query, params)
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Remplacer les données de la requête par les données validées et transformées
      if (validatedData.body) {
        req.body = validatedData.body;
      }
      if (validatedData.query) {
        req.query = validatedData.query;
      }
      if (validatedData.params) {
        req.params = validatedData.params;
      }

      const duration = Date.now() - startTime;
      if (duration > 100) {
        loggers.performance('validation', duration, {
          route: req.route?.path || req.path,
          method: req.method
        });
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Formatter les erreurs Zod pour une réponse utilisateur-friendly
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          received: err.received
        }));

        loggers.warn('Validation failed', {
          route: req.route?.path || req.path,
          method: req.method,
          errors: formattedErrors,
          userAgent: req.get('User-Agent'),
          ip: req.ip
        });

        const errorMessage = formattedErrors.length === 1
          ? formattedErrors[0].message
          : 'Données de requête invalides';

        return next(AppError.validationError(errorMessage, 'VALIDATION_ERROR'));
      }

      // Erreur inattendue lors de la validation
      loggers.error('Unexpected validation error', error, {
        route: req.route?.path || req.path,
        method: req.method
      });

      next(AppError.internal('Erreur de validation interne'));
    }
  };
};

/**
 * Middleware pour valider seulement le body de la requête
 * @param schema - Schéma Zod pour le body
 */
export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        loggers.warn('Body validation failed', {
          route: req.route?.path || req.path,
          errors: formattedErrors
        });

        return next(AppError.validationError('Données du body invalides', 'BODY_VALIDATION_ERROR'));
      }
      next(error);
    }
  };
};

/**
 * Middleware pour valider seulement les paramètres d'URL
 * @param schema - Schéma Zod pour les params
 */
export const validateParams = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        loggers.warn('Params validation failed', {
          route: req.route?.path || req.path,
          errors: formattedErrors
        });

        return next(AppError.validationError('Paramètres d\'URL invalides', 'PARAMS_VALIDATION_ERROR'));
      }
      next(error);
    }
  };
};

/**
 * Middleware pour valider seulement les query parameters
 * @param schema - Schéma Zod pour la query
 */
export const validateQuery = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        loggers.warn('Query validation failed', {
          route: req.route?.path || req.path,
          errors: formattedErrors
        });

        return next(AppError.validationError('Paramètres de requête invalides', 'QUERY_VALIDATION_ERROR'));
      }
      next(error);
    }
  };
};

/**
 * Middleware pour nettoyer et sanitiser les données d'entrée
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Fonction récursive pour nettoyer les objets
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Nettoyer les chaînes : trim et échapper les caractères dangereux
      return obj.trim().replace(/[<>]/g, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitiser body, query et params
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};