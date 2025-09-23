"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggers = exports.httpLogger = exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const pino_http_1 = __importDefault(require("pino-http"));
const env_config_1 = require("../../shared/config/env.config");
exports.logger = (0, pino_1.default)({
    level: env_config_1.env.LOG_LEVEL,
    transport: env_config_1.env.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            messageFormat: '{time} [{level}] {msg}',
            levelFirst: true,
        }
    } : undefined,
    formatters: {
        level: (label) => ({ level: label }),
    },
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
    // Masquer les données sensibles dans les logs
    redact: {
        paths: ['password', 'token', 'authorization', 'jwt', 'secret'],
        censor: '[REDACTED]'
    },
    base: {
        pid: false
    }
});
exports.httpLogger = (0, pino_http_1.default)({
    logger: exports.logger,
    customLogLevel: (req, res) => {
        if (res.statusCode >= 500)
            return 'error';
        if (res.statusCode >= 400)
            return 'warn';
        if (res.statusCode >= 300)
            return 'info';
        return 'info';
    },
    customSuccessMessage: (req, res) => {
        return `${req.method} ${req.url} - ${res.statusCode} - ${res.getHeader('content-length') || 0}b - ${res.responseTime}ms`;
    },
    customErrorMessage: (req, res, error) => {
        return `${req.method} ${req.url} - ${res.statusCode} - ERROR: ${error.message}`;
    },
    // Ne pas logger les routes de health check
    customAttributeKeys: {
        req: 'request',
        res: 'response',
        err: 'error',
        responseTime: 'responseTime',
    },
    autoLogging: {
        ignore: (req) => {
            // Ignorer les health checks et assets statiques
            return req.url?.includes('/health') ||
                req.url?.includes('/favicon.ico') ||
                req.url?.includes('/robots.txt');
        }
    }
});
// Helper functions pour structurer les logs
exports.loggers = {
    info: (message, meta) => exports.logger.info({ ...meta }, message),
    warn: (message, meta) => exports.logger.warn({ ...meta }, message),
    error: (message, error, meta) => {
        exports.logger.error({
            error: error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : undefined,
            ...meta
        }, message);
    },
    debug: (message, meta) => exports.logger.debug({ ...meta }, message),
    // Logs spécialisés
    database: (operation, duration, meta) => {
        exports.logger.info({
            operation: 'database',
            dbOperation: operation,
            duration,
            ...meta
        }, `Database operation: ${operation}`);
    },
    auth: (action, userId, meta) => {
        exports.logger.info({
            operation: 'auth',
            action,
            userId,
            ...meta
        }, `Auth action: ${action}`);
    },
    performance: (operation, duration, meta) => {
        const level = duration > 1000 ? 'warn' : 'info';
        exports.logger[level]({
            operation: 'performance',
            action: operation,
            duration,
            ...meta
        }, `Performance: ${operation} took ${duration}ms`);
    }
};
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map