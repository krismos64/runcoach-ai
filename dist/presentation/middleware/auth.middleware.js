"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractUserIdFromToken = exports.requireOwnership = exports.requireRole = exports.optionalAuthentication = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../../shared/errors/AppError");
const env_config_1 = require("../../shared/config/env.config");
const logger_1 = require("../../infrastructure/logging/logger");
/**
 * Middleware d'authentification JWT
 * Vérifie la validité du token et ajoute userId à la requête
 */
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            throw AppError_1.AppError.unauthorized('Token d\'authentification manquant', 'MISSING_TOKEN');
        }
        // Vérifier le format "Bearer <token>"
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw AppError_1.AppError.unauthorized('Format de token invalide. Utilisez: Bearer <token>', 'INVALID_TOKEN_FORMAT');
        }
        const token = parts[1];
        // Vérifier et décoder le token
        const decoded = jsonwebtoken_1.default.verify(token, env_config_1.env.JWT_SECRET, {
            issuer: 'runcoach-ai',
            audience: 'runcoach-users'
        });
        // Ajouter les informations utilisateur à la requête
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        // Logger l'authentification réussie (niveau debug pour éviter le spam)
        logger_1.loggers.debug('Token authenticated successfully', {
            userId: decoded.userId,
            email: decoded.email,
            path: req.path,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        next();
    }
    catch (error) {
        // Gestion spécifique des erreurs JWT
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            logger_1.loggers.warn('Invalid JWT token', {
                error: error.message,
                path: req.path,
                method: req.method,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                authHeader: req.header('Authorization')?.substring(0, 20) + '...'
            });
            if (error.name === 'TokenExpiredError') {
                return next(AppError_1.AppError.unauthorized('Token expiré', 'TOKEN_EXPIRED'));
            }
            if (error.name === 'JsonWebTokenError') {
                return next(AppError_1.AppError.unauthorized('Token invalide', 'INVALID_TOKEN'));
            }
            if (error.name === 'NotBeforeError') {
                return next(AppError_1.AppError.unauthorized('Token pas encore valide', 'TOKEN_NOT_ACTIVE'));
            }
        }
        // Si c'est déjà une AppError, la passer directement
        if (error instanceof AppError_1.AppError) {
            return next(error);
        }
        // Erreur inattendue
        logger_1.loggers.error('Unexpected authentication error', error, {
            path: req.path,
            method: req.method,
            ip: req.ip
        });
        next(AppError_1.AppError.unauthorized('Erreur d\'authentification', 'AUTH_ERROR'));
    }
};
exports.authenticateToken = authenticateToken;
/**
 * Middleware d'authentification optionnelle
 * N'interrompt pas la requête si le token n'est pas présent ou invalide
 */
const optionalAuthentication = async (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, env_config_1.env.JWT_SECRET, {
            issuer: 'runcoach-ai',
            audience: 'runcoach-users'
        });
        // Ajouter les informations utilisateur à la requête si le token est valide
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        next();
    }
    catch (error) {
        // En cas d'erreur, continuer sans authentification
        logger_1.loggers.debug('Optional authentication failed, continuing without auth', {
            error: error instanceof Error ? error.message : 'Unknown error',
            path: req.path,
            ip: req.ip
        });
        next();
    }
};
exports.optionalAuthentication = optionalAuthentication;
/**
 * Middleware pour vérifier les rôles (pour extension future)
 */
const requireRole = (roles) => {
    return (req, res, next) => {
        // Pour l'instant, tous les utilisateurs ont le même rôle
        // Cette fonction est préparée pour une extension future avec RBAC
        if (!req.userId) {
            return next(AppError_1.AppError.unauthorized('Authentification requise', 'AUTH_REQUIRED'));
        }
        // TODO: Implémenter la vérification des rôles depuis la base de données
        // const user = await User.findById(req.userId);
        // if (!user || !roles.includes(user.role)) {
        //   return next(AppError.forbidden('Permissions insuffisantes'));
        // }
        next();
    };
};
exports.requireRole = requireRole;
/**
 * Middleware pour vérifier que l'utilisateur accède à ses propres données
 */
const requireOwnership = (userIdField = 'userId') => {
    return (req, res, next) => {
        if (!req.userId) {
            return next(AppError_1.AppError.unauthorized('Authentification requise', 'AUTH_REQUIRED'));
        }
        // Récupérer l'ID utilisateur depuis les paramètres, le body ou la query
        const targetUserId = req.params[userIdField] ||
            req.body[userIdField] ||
            req.query[userIdField];
        if (!targetUserId) {
            return next(AppError_1.AppError.badRequest(`Paramètre ${userIdField} manquant`, 'MISSING_USER_ID'));
        }
        // Vérifier que l'utilisateur authentifié accède à ses propres données
        if (req.userId !== targetUserId.toString()) {
            logger_1.loggers.warn('Unauthorized access attempt', {
                authenticatedUserId: req.userId,
                targetUserId: targetUserId.toString(),
                path: req.path,
                method: req.method,
                ip: req.ip
            });
            return next(AppError_1.AppError.forbidden('Accès non autorisé à ces données', 'ACCESS_DENIED'));
        }
        next();
    };
};
exports.requireOwnership = requireOwnership;
/**
 * Utilitaire pour extraire l'ID utilisateur depuis un token sans vérification complète
 * Utilisé pour le logging ou les statistiques
 */
const extractUserIdFromToken = (authHeader) => {
    try {
        if (!authHeader)
            return null;
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer')
            return null;
        const token = parts[1];
        const decoded = jsonwebtoken_1.default.decode(token);
        return decoded?.userId || null;
    }
    catch {
        return null;
    }
};
exports.extractUserIdFromToken = extractUserIdFromToken;
//# sourceMappingURL=auth.middleware.js.map