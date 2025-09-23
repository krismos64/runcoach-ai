"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../presentation/controllers/auth.controller"));
const auth_middleware_1 = require("../presentation/middleware/auth.middleware");
const validation_middleware_1 = require("../presentation/middleware/validation.middleware");
const security_config_1 = require("../infrastructure/security/security.config");
const auth_schema_1 = require("../presentation/validators/schemas/auth.schema");
const router = (0, express_1.Router)();
// Route d'inscription avec validation et sécurité renforcée
router.post('/register', security_config_1.authSecurityMiddleware, (0, validation_middleware_1.validateRequest)(auth_schema_1.registerSchema), auth_controller_1.default.register);
// Route de connexion avec validation et sécurité renforcée
router.post('/login', security_config_1.authSecurityMiddleware, (0, validation_middleware_1.validateRequest)(auth_schema_1.loginSchema), auth_controller_1.default.login);
// Route pour récupérer le profil (authentification requise)
router.get('/profile', auth_middleware_1.authenticateToken, auth_controller_1.default.getProfile);
// Route pour mettre à jour le profil (authentification requise + validation)
router.put('/profile', auth_middleware_1.authenticateToken, (0, validation_middleware_1.validateRequest)(auth_schema_1.updateProfileSchema), auth_controller_1.default.updateProfile);
// Route pour vérifier la validité du token
router.get('/verify', auth_middleware_1.authenticateToken, auth_controller_1.default.verifyToken);
// Route de déconnexion (optionnelle)
router.post('/logout', auth_middleware_1.authenticateToken, auth_controller_1.default.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map