"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInput = exports.validateQuery = exports.validateParams = exports.validateBody = exports.validateRequest = void 0;
const zod_1 = require("zod");
const AppError_1 = require("../../shared/errors/AppError");
const logger_1 = require("../../infrastructure/logging/logger");
/**
 * Middleware de validation générique utilisant Zod
 * @param schema - Schéma Zod pour valider la requête
 * @returns Middleware Express
 */
const validateRequest = (schema) => {
    return async (req, res, next) => {
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
                logger_1.loggers.performance('validation', duration, {
                    route: req.route?.path || req.path,
                    method: req.method
                });
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                // Formatter les erreurs Zod pour une réponse utilisateur-friendly
                const formattedErrors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code,
                    received: err.received
                }));
                logger_1.loggers.warn('Validation failed', {
                    route: req.route?.path || req.path,
                    method: req.method,
                    errors: formattedErrors,
                    userAgent: req.get('User-Agent'),
                    ip: req.ip
                });
                const errorMessage = formattedErrors.length === 1
                    ? formattedErrors[0].message
                    : 'Données de requête invalides';
                return next(AppError_1.AppError.validationError(errorMessage, 'VALIDATION_ERROR'));
            }
            // Erreur inattendue lors de la validation
            logger_1.loggers.error('Unexpected validation error', error, {
                route: req.route?.path || req.path,
                method: req.method
            });
            next(AppError_1.AppError.internal('Erreur de validation interne'));
        }
    };
};
exports.validateRequest = validateRequest;
/**
 * Middleware pour valider seulement le body de la requête
 * @param schema - Schéma Zod pour le body
 */
const validateBody = (schema) => {
    return async (req, res, next) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const formattedErrors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                logger_1.loggers.warn('Body validation failed', {
                    route: req.route?.path || req.path,
                    errors: formattedErrors
                });
                return next(AppError_1.AppError.validationError('Données du body invalides', 'BODY_VALIDATION_ERROR'));
            }
            next(error);
        }
    };
};
exports.validateBody = validateBody;
/**
 * Middleware pour valider seulement les paramètres d'URL
 * @param schema - Schéma Zod pour les params
 */
const validateParams = (schema) => {
    return async (req, res, next) => {
        try {
            req.params = await schema.parseAsync(req.params);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const formattedErrors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                logger_1.loggers.warn('Params validation failed', {
                    route: req.route?.path || req.path,
                    errors: formattedErrors
                });
                return next(AppError_1.AppError.validationError('Paramètres d\'URL invalides', 'PARAMS_VALIDATION_ERROR'));
            }
            next(error);
        }
    };
};
exports.validateParams = validateParams;
/**
 * Middleware pour valider seulement les query parameters
 * @param schema - Schéma Zod pour la query
 */
const validateQuery = (schema) => {
    return async (req, res, next) => {
        try {
            req.query = await schema.parseAsync(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const formattedErrors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                logger_1.loggers.warn('Query validation failed', {
                    route: req.route?.path || req.path,
                    errors: formattedErrors
                });
                return next(AppError_1.AppError.validationError('Paramètres de requête invalides', 'QUERY_VALIDATION_ERROR'));
            }
            next(error);
        }
    };
};
exports.validateQuery = validateQuery;
/**
 * Middleware pour nettoyer et sanitiser les données d'entrée
 */
const sanitizeInput = (req, res, next) => {
    // Fonction récursive pour nettoyer les objets
    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            // Nettoyer les chaînes : trim et échapper les caractères dangereux
            return obj.trim().replace(/[<>]/g, '');
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }
        if (typeof obj === 'object' && obj !== null) {
            const sanitized = {};
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
exports.sanitizeInput = sanitizeInput;
//# sourceMappingURL=validation.middleware.js.map