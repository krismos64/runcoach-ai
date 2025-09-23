import pino from 'pino';
import { env } from '../../shared/config/env.config';

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    }
  } : undefined,
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

  auth: (action: string, userId?: string, meta?: object) => {
    logger.info({
      operation: 'auth',
      action,
      userId,
      ...meta
    }, `Auth action: ${action}`);
  },

  database: (operation: string, duration?: number, meta?: object) => {
    logger.info({
      operation: 'database',
      dbOperation: operation,
      duration,
      ...meta
    }, `Database operation: ${operation}`);
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