import { Request, Response, NextFunction } from 'express';
/**
 * Configuration Helmet pour la sécurité des headers HTTP
 */
export declare const helmetConfig: (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
/**
 * Rate limiting global
 */
export declare const globalRateLimit: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limiting spécifique pour l'authentification
 */
export declare const authRateLimit: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limiting pour les endpoints sensibles (upload, etc.)
 */
export declare const sensitiveRateLimit: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Sanitisation MongoDB pour prévenir les injections NoSQL
 */
export declare const mongoSanitization: import("express").Handler;
/**
 * Middleware pour prévenir les attaques XSS
 */
export declare const xssProtection: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware pour valider l'origine des requêtes (CORS custom)
 */
export declare const validateOrigin: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Configuration de sécurité complète
 */
export declare const securityMiddleware: import("express").Handler[];
/**
 * Middleware de sécurité pour les routes d'authentification
 */
export declare const authSecurityMiddleware: import("express").Handler[];
/**
 * Middleware de sécurité pour les routes sensibles
 */
export declare const sensitiveSecurityMiddleware: import("express").Handler[];
//# sourceMappingURL=security.config.d.ts.map