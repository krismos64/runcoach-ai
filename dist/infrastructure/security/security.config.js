"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sensitiveSecurityMiddleware = exports.authSecurityMiddleware = exports.securityMiddleware = exports.validateOrigin = exports.xssProtection = exports.mongoSanitization = exports.sensitiveRateLimit = exports.authRateLimit = exports.globalRateLimit = exports.helmetConfig = void 0;
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const env_config_1 = require("../../shared/config/env.config");
const AppError_1 = require("../../shared/errors/AppError");
const logger_1 = require("../logging/logger");
/**
 * Configuration Helmet pour la sécurité des headers HTTP
 */
exports.helmetConfig = (0, helmet_1.default)({
    // Content Security Policy
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'"],
            mediaSrc: ["'self'"],
            objectSrc: ["'none'"],
            childSrc: ["'self'"],
            frameAncestors: ["'none'"],
            formAction: ["'self'"],
            baseUri: ["'self'"],
            manifestSrc: ["'self'"]
        },
        reportOnly: env_config_1.env.NODE_ENV === 'development'
    },
    // HTTP Strict Transport Security
    hsts: {
        maxAge: 31536000, // 1 an
        includeSubDomains: true,
        preload: true
    },
    // Prevent clickjacking
    frameguard: {
        action: 'deny'
    },
    // Hide X-Powered-By header
    hidePoweredBy: true,
    // Prevent MIME type sniffing
    noSniff: true,
    // Enable XSS filtering
    xssFilter: true,
    // Referrer Policy
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
    },
    // Permissions Policy (Feature Policy)
    permittedCrossDomainPolicies: false,
    // Cross Origin Embedder Policy
    crossOriginEmbedderPolicy: false, // Peut causer des problèmes avec certains outils de dev
});
/**
 * Rate limiting global
 */
exports.globalRateLimit = (0, express_rate_limit_1.default)({
    windowMs: env_config_1.env.RATE_LIMIT_WINDOW_MS, // 15 minutes par défaut
    max: env_config_1.env.RATE_LIMIT_MAX_REQUESTS, // 100 requêtes par défaut
    message: {
        error: 'Trop de requêtes de votre part, veuillez réessayer plus tard',
        retryAfter: `${env_config_1.env.RATE_LIMIT_WINDOW_MS / 1000 / 60} minutes`
    },
    standardHeaders: true, // Retourner les headers rate limit dans `RateLimit-*`
    legacyHeaders: false, // Désactiver les headers `X-RateLimit-*`
    // Fonction de génération de clé (par IP + User-Agent pour plus de précision)
    keyGenerator: (req) => {
        return `${req.ip}-${req.get('User-Agent') || 'unknown'}`;
    },
    // Skip certaines routes (health checks, static files)
    skip: (req) => {
        return req.path === '/health' ||
            req.path === '/favicon.ico' ||
            req.path.startsWith('/static/');
    },
    // Handler pour les requêtes qui dépassent la limite
    handler: (req, res) => {
        logger_1.loggers.warn('Rate limit exceeded', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method
        });
        res.status(429).json({
            error: 'Trop de requêtes',
            message: 'Vous avez dépassé la limite de requêtes autorisées',
            retryAfter: `${env_config_1.env.RATE_LIMIT_WINDOW_MS / 1000 / 60} minutes`
        });
    },
    // Fonction appelée quand une requête est comptée
    onLimitReached: (req, res, options) => {
        logger_1.loggers.warn('Rate limit reached', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method,
            limit: options.max,
            windowMs: options.windowMs
        });
    }
});
/**
 * Rate limiting spécifique pour l'authentification
 */
exports.authRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: env_config_1.env.AUTH_RATE_LIMIT_MAX, // 5 tentatives par défaut
    message: {
        error: 'Trop de tentatives de connexion',
        message: 'Veuillez attendre 15 minutes avant de réessayer',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Clé basée sur IP + email pour être plus précis
    keyGenerator: (req) => {
        const email = req.body?.email || 'unknown';
        return `auth-${req.ip}-${email}`;
    },
    handler: (req, res) => {
        logger_1.loggers.warn('Auth rate limit exceeded', {
            ip: req.ip,
            email: req.body?.email,
            userAgent: req.get('User-Agent'),
            path: req.path
        });
        res.status(429).json({
            error: 'Trop de tentatives de connexion',
            message: 'Compte temporairement bloqué. Réessayez dans 15 minutes.',
            retryAfter: '15 minutes'
        });
    }
});
/**
 * Rate limiting pour les endpoints sensibles (upload, etc.)
 */
exports.sensitiveRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requêtes par minute
    message: {
        error: 'Trop de requêtes sur cet endpoint sensible',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false
});
/**
 * Sanitisation MongoDB pour prévenir les injections NoSQL
 */
exports.mongoSanitization = (0, express_mongo_sanitize_1.default)({
    // Remplacer les caractères interdits par des underscores
    replaceWith: '_',
    // Supprimer les clés qui commencent par '$'
    allowDots: false,
    // Logger les tentatives d'injection
    onSanitize: ({ req, key }) => {
        logger_1.loggers.warn('MongoDB injection attempt detected', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method,
            injectionKey: key,
            body: req.body
        });
    }
});
/**
 * Middleware pour prévenir les attaques XSS
 */
const xssProtection = (req, res, next) => {
    // Fonction récursive pour nettoyer les objets
    const sanitizeObject = (obj) => {
        if (typeof obj === 'string') {
            // Échapper les caractères dangereux pour XSS
            return obj
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;');
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
        }
        if (typeof obj === 'object' && obj !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(obj)) {
                sanitized[key] = sanitizeObject(value);
            }
            return sanitized;
        }
        return obj;
    };
    // Sanitiser body, query et params
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query);
    }
    next();
};
exports.xssProtection = xssProtection;
/**
 * Middleware pour valider l'origine des requêtes (CORS custom)
 */
const validateOrigin = (req, res, next) => {
    const origin = req.get('Origin');
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://runcoach-ai.com',
        'https://www.runcoach-ai.com'
    ];
    // En développement, permettre toutes les origines
    if (env_config_1.env.NODE_ENV === 'development') {
        return next();
    }
    // Vérifier si l'origine est autorisée
    if (origin && !allowedOrigins.includes(origin)) {
        logger_1.loggers.warn('Unauthorized origin detected', {
            origin,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path
        });
        return next(AppError_1.AppError.forbidden('Origine non autorisée'));
    }
    next();
};
exports.validateOrigin = validateOrigin;
/**
 * Configuration de sécurité complète
 */
exports.securityMiddleware = [
    exports.helmetConfig,
    exports.globalRateLimit,
    exports.mongoSanitization,
    exports.xssProtection,
    exports.validateOrigin
];
/**
 * Middleware de sécurité pour les routes d'authentification
 */
exports.authSecurityMiddleware = [
    exports.authRateLimit,
    exports.mongoSanitization,
    exports.xssProtection
];
/**
 * Middleware de sécurité pour les routes sensibles
 */
exports.sensitiveSecurityMiddleware = [
    exports.sensitiveRateLimit,
    exports.mongoSanitization,
    exports.xssProtection
];
//# sourceMappingURL=security.config.js.map