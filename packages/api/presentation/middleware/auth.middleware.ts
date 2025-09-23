import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../../shared/errors/AppError';
import { env } from '../../shared/config/env.config';
import { loggers } from '../../infrastructure/logging/logger.simple';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

/**
 * Middleware d'authentification JWT
 * Vérifie la validité du token et ajoute userId à la requête
 */
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      throw AppError.unauthorized('Token d\'authentification manquant', 'MISSING_TOKEN');
    }

    // Vérifier le format "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw AppError.unauthorized('Format de token invalide. Utilisez: Bearer <token>', 'INVALID_TOKEN_FORMAT');
    }

    const token = parts[1];

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'runcoach-ai',
      audience: 'runcoach-users'
    }) as JWTPayload;

    // Ajouter les informations utilisateur à la requête
    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    // Logger l'authentification réussie (niveau debug pour éviter le spam)
    loggers.debug('Token authenticated successfully', {
      userId: decoded.userId,
      email: decoded.email,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    next();
  } catch (error) {
    // Gestion spécifique des erreurs JWT
    if (error instanceof jwt.JsonWebTokenError) {
      loggers.warn('Invalid JWT token', {
        error: error.message,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        authHeader: req.header('Authorization')?.substring(0, 20) + '...'
      });

      if (error.name === 'TokenExpiredError') {
        return next(AppError.unauthorized('Token expiré', 'TOKEN_EXPIRED'));
      }

      if (error.name === 'JsonWebTokenError') {
        return next(AppError.unauthorized('Token invalide', 'INVALID_TOKEN'));
      }

      if (error.name === 'NotBeforeError') {
        return next(AppError.unauthorized('Token pas encore valide', 'TOKEN_NOT_ACTIVE'));
      }
    }

    // Si c'est déjà une AppError, la passer directement
    if (error instanceof AppError) {
      return next(error);
    }

    // Erreur inattendue
    loggers.error('Unexpected authentication error', error as Error, {
      path: req.path,
      method: req.method,
      ip: req.ip
    });

    next(AppError.unauthorized('Erreur d\'authentification', 'AUTH_ERROR'));
  }
};

/**
 * Middleware d'authentification optionnelle
 * N'interrompt pas la requête si le token n'est pas présent ou invalide
 */
export const optionalAuthentication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }

    const token = parts[1];
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'runcoach-ai',
      audience: 'runcoach-users'
    }) as JWTPayload;

    // Ajouter les informations utilisateur à la requête si le token est valide
    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
  } catch (error) {
    // En cas d'erreur, continuer sans authentification
    loggers.debug('Optional authentication failed, continuing without auth', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.path,
      ip: req.ip
    });

    next();
  }
};

/**
 * Middleware pour vérifier les rôles (pour extension future)
 */
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Pour l'instant, tous les utilisateurs ont le même rôle
    // Cette fonction est préparée pour une extension future avec RBAC

    if (!req.userId) {
      return next(AppError.unauthorized('Authentification requise', 'AUTH_REQUIRED'));
    }

    // TODO: Implémenter la vérification des rôles depuis la base de données
    // const user = await User.findById(req.userId);
    // if (!user || !roles.includes(user.role)) {
    //   return next(AppError.forbidden('Permissions insuffisantes'));
    // }

    next();
  };
};

/**
 * Middleware pour vérifier que l'utilisateur accède à ses propres données
 */
export const requireOwnership = (userIdField: string = 'userId') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userId) {
      return next(AppError.unauthorized('Authentification requise', 'AUTH_REQUIRED'));
    }

    // Récupérer l'ID utilisateur depuis les paramètres, le body ou la query
    const targetUserId = req.params[userIdField] ||
                        req.body[userIdField] ||
                        req.query[userIdField];

    if (!targetUserId) {
      return next(AppError.badRequest(`Paramètre ${userIdField} manquant`, 'MISSING_USER_ID'));
    }

    // Vérifier que l'utilisateur authentifié accède à ses propres données
    if (req.userId !== targetUserId.toString()) {
      loggers.warn('Unauthorized access attempt', {
        authenticatedUserId: req.userId,
        targetUserId: targetUserId.toString(),
        path: req.path,
        method: req.method,
        ip: req.ip
      });

      return next(AppError.forbidden('Accès non autorisé à ces données', 'ACCESS_DENIED'));
    }

    next();
  };
};

/**
 * Utilitaire pour extraire l'ID utilisateur depuis un token sans vérification complète
 * Utilisé pour le logging ou les statistiques
 */
export const extractUserIdFromToken = (authHeader: string | undefined): string | null => {
  try {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

    const token = parts[1];
    const decoded = jwt.decode(token) as JWTPayload | null;

    return decoded?.userId || null;
  } catch {
    return null;
  }
};