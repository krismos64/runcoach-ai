import { Request, Response, NextFunction } from 'express';
/**
 * Middleware global de gestion des erreurs
 * Doit être le dernier middleware dans la chaîne
 */
export declare const errorHandler: (error: Error, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Middleware pour capturer les erreurs asynchrones
 */
export declare const asyncErrorHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware pour gérer les routes non trouvées (404)
 */
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware pour gérer les erreurs non capturées au niveau global
 */
export declare const setupGlobalErrorHandlers: () => void;
//# sourceMappingURL=error.middleware.d.ts.map