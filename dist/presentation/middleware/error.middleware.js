"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupGlobalErrorHandlers = exports.notFoundHandler = exports.asyncErrorHandler = exports.errorHandler = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const logger_1 = require("../../infrastructure/logging/logger");
const env_config_1 = require("../../shared/config/env.config");
/**
 * Middleware global de gestion des erreurs
 * Doit être le dernier middleware dans la chaîne
 */
const errorHandler = (error, req, res, next) => {
    const timestamp = new Date().toISOString();
    const path = req.originalUrl || req.path;
    const method = req.method;
    // Construire la réponse d'erreur de base
    const errorResponse = {
        status: 'error',
        message: 'Une erreur est survenue',
        timestamp,
        path,
        method
    };
    // Si c'est une AppError (erreur gérée)
    if (error instanceof AppError_1.AppError) {
        errorResponse.message = error.message;
        errorResponse.code = error.code;
        // Logger selon le niveau de sévérité
        if (error.statusCode >= 500) {
            logger_1.loggers.error('Application error', error, {
                statusCode: error.statusCode,
                path,
                method,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                userId: req.userId,
                requestId: req.get('X-Request-ID')
            });
        }
        else {
            logger_1.loggers.warn('Client error', {
                message: error.message,
                statusCode: error.statusCode,
                code: error.code,
                path,
                method,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                userId: req.userId
            });
        }
        return res.status(error.statusCode).json(errorResponse);
    }
    // Erreurs Mongoose
    if (error.name === 'ValidationError') {
        errorResponse.message = 'Données invalides';
        errorResponse.code = 'VALIDATION_ERROR';
        if (env_config_1.env.NODE_ENV === 'development') {
            errorResponse.details = Object.values(error.errors).map((e) => ({
                field: e.path,
                message: e.message
            }));
        }
        logger_1.loggers.warn('Mongoose validation error', {
            error: error.message,
            path,
            method,
            ip: req.ip
        });
        return res.status(400).json(errorResponse);
    }
    // Erreur de duplication MongoDB (code 11000)
    if (error.code === 11000) {
        errorResponse.message = 'Ressource déjà existante';
        errorResponse.code = 'DUPLICATE_ERROR';
        // Extraire le champ dupliqué si possible
        const match = error.message.match(/index: (.+?) dup key/);
        if (match && env_config_1.env.NODE_ENV === 'development') {
            errorResponse.details = { duplicatedField: match[1] };
        }
        logger_1.loggers.warn('MongoDB duplicate key error', {
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
        logger_1.loggers.warn('MongoDB cast error', {
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
        logger_1.loggers.warn('JWT error', {
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
        logger_1.loggers.warn('JWT expired', {
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
        logger_1.loggers.warn('JSON syntax error', {
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
        logger_1.loggers.warn('File/request too large', {
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
    if (env_config_1.env.NODE_ENV === 'development') {
        errorResponse.stack = error.stack;
        errorResponse.details = {
            name: error.name,
            originalMessage: error.message
        };
    }
    // Logger l'erreur critique
    logger_1.loggers.error('Unhandled error', error, {
        path,
        method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.userId,
        requestId: req.get('X-Request-ID'),
        body: req.body,
        query: req.query,
        params: req.params
    });
    res.status(500).json(errorResponse);
};
exports.errorHandler = errorHandler;
/**
 * Middleware pour capturer les erreurs asynchrones
 */
const asyncErrorHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncErrorHandler = asyncErrorHandler;
/**
 * Middleware pour gérer les routes non trouvées (404)
 */
const notFoundHandler = (req, res, next) => {
    const error = AppError_1.AppError.notFound(`Route ${req.method} ${req.originalUrl} non trouvée`);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
/**
 * Middleware pour gérer les erreurs non capturées au niveau global
 */
const setupGlobalErrorHandlers = () => {
    // Erreurs non capturées (uncaughtException)
    process.on('uncaughtException', (error) => {
        logger_1.loggers.error('Uncaught Exception', error, {
            type: 'uncaughtException',
            pid: process.pid
        });
        // Arrêter proprement l'application
        process.exit(1);
    });
    // Promesses rejetées non gérées (unhandledRejection)
    process.on('unhandledRejection', (reason, promise) => {
        logger_1.loggers.error('Unhandled Rejection', reason instanceof Error ? reason : new Error(String(reason)), {
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
            logger_1.loggers.info(`Received ${signal}, shutting down gracefully`);
            process.exit(0);
        });
    });
};
exports.setupGlobalErrorHandlers = setupGlobalErrorHandlers;
//# sourceMappingURL=error.middleware.js.map