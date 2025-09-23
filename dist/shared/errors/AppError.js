"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    isOperational;
    code;
    constructor(message, statusCode = 500, isOperational = true, code) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message, code) {
        return new AppError(message, 400, true, code);
    }
    static unauthorized(message = 'Non autorisé', code) {
        return new AppError(message, 401, true, code);
    }
    static forbidden(message = 'Accès interdit', code) {
        return new AppError(message, 403, true, code);
    }
    static notFound(message = 'Ressource non trouvée', code) {
        return new AppError(message, 404, true, code);
    }
    static conflict(message, code) {
        return new AppError(message, 409, true, code);
    }
    static validationError(message, code) {
        return new AppError(message, 422, true, code);
    }
    static tooManyRequests(message = 'Trop de requêtes', code) {
        return new AppError(message, 429, true, code);
    }
    static internal(message = 'Erreur serveur interne', code) {
        return new AppError(message, 500, true, code);
    }
}
exports.AppError = AppError;
//# sourceMappingURL=AppError.js.map