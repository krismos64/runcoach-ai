export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    readonly code?: string;
    constructor(message: string, statusCode?: number, isOperational?: boolean, code?: string);
    static badRequest(message: string, code?: string): AppError;
    static unauthorized(message?: string, code?: string): AppError;
    static forbidden(message?: string, code?: string): AppError;
    static notFound(message?: string, code?: string): AppError;
    static conflict(message: string, code?: string): AppError;
    static validationError(message: string, code?: string): AppError;
    static tooManyRequests(message?: string, code?: string): AppError;
    static internal(message?: string, code?: string): AppError;
}
//# sourceMappingURL=AppError.d.ts.map