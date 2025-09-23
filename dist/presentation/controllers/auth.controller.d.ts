import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    /**
     * Inscription d'un nouvel utilisateur
     */
    register: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Connexion d'un utilisateur
     */
    login: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Récupérer le profil de l'utilisateur connecté
     */
    getProfile: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Mettre à jour le profil de l'utilisateur
     */
    updateProfile: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Vérifier la validité du token
     */
    verifyToken: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Déconnexion (optionnelle - côté client)
     */
    logout: (req: Request, res: Response, next: NextFunction) => void;
}
declare const _default: AuthController;
export default _default;
//# sourceMappingURL=auth.controller.d.ts.map