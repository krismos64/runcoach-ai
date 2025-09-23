import { Router } from 'express';
import authController from '../presentation/controllers/auth.controller';
import { authenticateToken } from '../presentation/middleware/auth.middleware';
import { validateRequest } from '../presentation/middleware/validation.middleware';
import { authSecurityMiddleware } from '../infrastructure/security/security.config';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema
} from '../presentation/validators/schemas/auth.schema';

const router = Router();

// Route d'inscription avec validation et sécurité renforcée
router.post('/register',
  authSecurityMiddleware,
  validateRequest(registerSchema),
  authController.register
);

// Route de connexion avec validation et sécurité renforcée
router.post('/login',
  authSecurityMiddleware,
  validateRequest(loginSchema),
  authController.login
);

// Route pour récupérer le profil (authentification requise)
router.get('/profile',
  authenticateToken,
  authController.getProfile
);

// Route pour mettre à jour le profil (authentification requise + validation)
router.put('/profile',
  authenticateToken,
  validateRequest(updateProfileSchema),
  authController.updateProfile
);

// Route pour vérifier la validité du token
router.get('/verify',
  authenticateToken,
  authController.verifyToken
);

// Route de déconnexion (optionnelle)
router.post('/logout',
  authenticateToken,
  authController.logout
);

export default router;