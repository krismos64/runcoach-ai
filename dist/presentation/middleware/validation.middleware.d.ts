import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
/**
 * Middleware de validation générique utilisant Zod
 * @param schema - Schéma Zod pour valider la requête
 * @returns Middleware Express
 */
export declare const validateRequest: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware pour valider seulement le body de la requête
 * @param schema - Schéma Zod pour le body
 */
export declare const validateBody: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware pour valider seulement les paramètres d'URL
 * @param schema - Schéma Zod pour les params
 */
export declare const validateParams: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware pour valider seulement les query parameters
 * @param schema - Schéma Zod pour la query
 */
export declare const validateQuery: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware pour nettoyer et sanitiser les données d'entrée
 */
export declare const sanitizeInput: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map