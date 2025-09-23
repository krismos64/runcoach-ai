import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    userId?: string;
    userEmail?: string;
}
/**
 * Middleware d'authentification JWT
 * Vérifie la validité du token et ajoute userId à la requête
 */
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware d'authentification optionnelle
 * N'interrompt pas la requête si le token n'est pas présent ou invalide
 */
export declare const optionalAuthentication: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware pour vérifier les rôles (pour extension future)
 */
export declare const requireRole: (roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware pour vérifier que l'utilisateur accède à ses propres données
 */
export declare const requireOwnership: (userIdField?: string) => (req: AuthRequest, res: Response, next: NextFunction) => void;
/**
 * Utilitaire pour extraire l'ID utilisateur depuis un token sans vérification complète
 * Utilisé pour le logging ou les statistiques
 */
export declare const extractUserIdFromToken: (authHeader: string | undefined) => string | null;
//# sourceMappingURL=auth.middleware.d.ts.map