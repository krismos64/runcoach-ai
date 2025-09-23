import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { Request, Response, NextFunction } from 'express';
import { env } from '../../shared/config/env.config';
import { AppError } from '../../shared/errors/AppError';
import { loggers } from '../logging/logger';

/**
 * Configuration Helmet pour la sécurité des headers HTTP
 */
export const helmetConfig = helmet({
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
    reportOnly: env.NODE_ENV === 'development'
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
export const globalRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // 15 minutes par défaut
  max: env.RATE_LIMIT_MAX_REQUESTS, // 100 requêtes par défaut
  message: {
    error: 'Trop de requêtes de votre part, veuillez réessayer plus tard',
    retryAfter: `${env.RATE_LIMIT_WINDOW_MS / 1000 / 60} minutes`
  },
  standardHeaders: true, // Retourner les headers rate limit dans `RateLimit-*`
  legacyHeaders: false, // Désactiver les headers `X-RateLimit-*`

  // Fonction de génération de clé (par IP + User-Agent pour plus de précision)
  keyGenerator: (req: Request) => {
    return `${req.ip}-${req.get('User-Agent') || 'unknown'}`;
  },

  // Skip certaines routes (health checks, static files)
  skip: (req: Request) => {
    return req.path === '/health' ||
           req.path === '/favicon.ico' ||
           req.path.startsWith('/static/');
  },

  // Handler pour les requêtes qui dépassent la limite
  handler: (req: Request, res: Response) => {
    loggers.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    });

    res.status(429).json({
      error: 'Trop de requêtes',
      message: 'Vous avez dépassé la limite de requêtes autorisées',
      retryAfter: `${env.RATE_LIMIT_WINDOW_MS / 1000 / 60} minutes`
    });
  },

  // Fonction appelée quand une requête est comptée
  onLimitReached: (req: Request, res: Response, options) => {
    loggers.warn('Rate limit reached', {
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
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.AUTH_RATE_LIMIT_MAX, // 5 tentatives par défaut
  message: {
    error: 'Trop de tentatives de connexion',
    message: 'Veuillez attendre 15 minutes avant de réessayer',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,

  // Clé basée sur IP + email pour être plus précis
  keyGenerator: (req: Request) => {
    const email = req.body?.email || 'unknown';
    return `auth-${req.ip}-${email}`;
  },

  handler: (req: Request, res: Response) => {
    loggers.warn('Auth rate limit exceeded', {
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
export const sensitiveRateLimit = rateLimit({
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
export const mongoSanitization = mongoSanitize({
  // Remplacer les caractères interdits par des underscores
  replaceWith: '_',
  // Supprimer les clés qui commencent par '$'
  allowDots: false,
  // Logger les tentatives d'injection
  onSanitize: ({ req, key }) => {
    loggers.warn('MongoDB injection attempt detected', {
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
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  // Fonction récursive pour nettoyer les objets
  const sanitizeObject = (obj: any): any => {
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
      const sanitized: any = {};
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

/**
 * Middleware pour valider l'origine des requêtes (CORS custom)
 */
export const validateOrigin = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.get('Origin');
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://runcoach-ai.com',
    'https://www.runcoach-ai.com'
  ];

  // En développement, permettre toutes les origines
  if (env.NODE_ENV === 'development') {
    return next();
  }

  // Vérifier si l'origine est autorisée
  if (origin && !allowedOrigins.includes(origin)) {
    loggers.warn('Unauthorized origin detected', {
      origin,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });

    return next(AppError.forbidden('Origine non autorisée'));
  }

  next();
};

/**
 * Configuration de sécurité complète
 */
export const securityMiddleware = [
  helmetConfig,
  globalRateLimit,
  mongoSanitization,
  xssProtection,
  validateOrigin
];

/**
 * Middleware de sécurité pour les routes d'authentification
 */
export const authSecurityMiddleware = [
  authRateLimit,
  mongoSanitization,
  xssProtection
];

/**
 * Middleware de sécurité pour les routes sensibles
 */
export const sensitiveSecurityMiddleware = [
  sensitiveRateLimit,
  mongoSanitization,
  xssProtection
];