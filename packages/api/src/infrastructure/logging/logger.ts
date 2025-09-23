import pino from 'pino';
import pinoHttp from 'pino-http';
import { env } from '../../shared/config/env.config';

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: env.NODE_ENV === 'development' ? {
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
  timestamp: pino.stdTimeFunctions.isoTime,
  // Masquer les données sensibles dans les logs
  redact: {
    paths: ['password', 'token', 'authorization', 'jwt', 'secret'],
    censor: '[REDACTED]'
  },
  base: {
    pid: false
  }
});

export const httpLogger = pinoHttp({
  logger,
  customLogLevel: (req, res) => {
    if (res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    if (res.statusCode >= 300) return 'info';
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
export const loggers = {
  info: (message: string, meta?: object) => logger.info({ ...meta }, message),
  warn: (message: string, meta?: object) => logger.warn({ ...meta }, message),
  error: (message: string, error?: Error, meta?: object) => {
    logger.error({
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined,
      ...meta
    }, message);
  },
  debug: (message: string, meta?: object) => logger.debug({ ...meta }, message),

  // Logs spécialisés
  database: (operation: string, duration?: number, meta?: object) => {
    logger.info({
      operation: 'database',
      dbOperation: operation,
      duration,
      ...meta
    }, `Database operation: ${operation}`);
  },

  auth: (action: string, userId?: string, meta?: object) => {
    logger.info({
      operation: 'auth',
      action,
      userId,
      ...meta
    }, `Auth action: ${action}`);
  },

  performance: (operation: string, duration: number, meta?: object) => {
    const level = duration > 1000 ? 'warn' : 'info';
    logger[level]({
      operation: 'performance',
      action: operation,
      duration,
      ...meta
    }, `Performance: ${operation} took ${duration}ms`);
  }
};

export default logger;