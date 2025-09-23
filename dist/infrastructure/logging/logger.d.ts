import pino from 'pino';
export declare const logger: pino.Logger<never, boolean>;
export declare const httpLogger: import("pino-http").HttpLogger<import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, never>;
export declare const loggers: {
    info: (message: string, meta?: object) => void;
    warn: (message: string, meta?: object) => void;
    error: (message: string, error?: Error, meta?: object) => void;
    debug: (message: string, meta?: object) => void;
    database: (operation: string, duration?: number, meta?: object) => void;
    auth: (action: string, userId?: string, meta?: object) => void;
    performance: (operation: string, duration: number, meta?: object) => void;
};
export default logger;
//# sourceMappingURL=logger.d.ts.map