export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code?: string): AppError {
    return new AppError(message, 400, true, code);
  }

  static unauthorized(message: string = 'Non autorisé', code?: string): AppError {
    return new AppError(message, 401, true, code);
  }

  static forbidden(message: string = 'Accès interdit', code?: string): AppError {
    return new AppError(message, 403, true, code);
  }

  static notFound(message: string = 'Ressource non trouvée', code?: string): AppError {
    return new AppError(message, 404, true, code);
  }

  static conflict(message: string, code?: string): AppError {
    return new AppError(message, 409, true, code);
  }

  static validationError(message: string, code?: string): AppError {
    return new AppError(message, 422, true, code);
  }

  static tooManyRequests(message: string = 'Trop de requêtes', code?: string): AppError {
    return new AppError(message, 429, true, code);
  }

  static internal(message: string = 'Erreur serveur interne', code?: string): AppError {
    return new AppError(message, 500, true, code);
  }
}