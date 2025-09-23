"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = __importDefault(require("../../models/User.model"));
const AppError_1 = require("../../shared/errors/AppError");
const env_config_1 = require("../../shared/config/env.config");
const logger_1 = require("../../infrastructure/logging/logger");
const error_middleware_1 = require("../middleware/error.middleware");
class AuthController {
    /**
     * Inscription d'un nouvel utilisateur
     */
    register = (0, error_middleware_1.asyncErrorHandler)(async (req, res, next) => {
        const startTime = Date.now();
        const { email, password, firstName, lastName, dateOfBirth, height, currentWeight, targetWeight, biologicalSex, targetRace, preferences } = req.body;
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User_model_1.default.findOne({ email });
        if (existingUser) {
            logger_1.loggers.warn('Registration attempt with existing email', {
                email,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            throw AppError_1.AppError.conflict('Cet email est déjà utilisé', 'EMAIL_ALREADY_EXISTS');
        }
        // Créer le nouvel utilisateur
        const user = new User_model_1.default({
            email,
            password,
            firstName,
            lastName,
            dateOfBirth: new Date(dateOfBirth),
            height,
            currentWeight,
            targetWeight,
            biologicalSex,
            targetRace: {
                type: targetRace.type || 'semi-marathon',
                date: new Date(targetRace.date),
                targetTime: targetRace.targetTime
            },
            preferences: preferences || {
                weeklyWorkouts: 3,
                preferredDays: ['monday', 'wednesday', 'saturday'],
                preferredTime: 'morning'
            }
        });
        await user.save();
        // Générer le token JWT
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            email: user.email
        }, env_config_1.env.JWT_SECRET, {
            expiresIn: env_config_1.env.JWT_EXPIRES_IN,
            issuer: 'runcoach-ai',
            audience: 'runcoach-users'
        });
        // Logger l'inscription réussie
        const duration = Date.now() - startTime;
        logger_1.loggers.auth('user_registered', user._id.toString(), {
            email,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            duration
        });
        res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    targetRace: user.targetRace
                }
            }
        });
    });
    /**
     * Connexion d'un utilisateur
     */
    login = (0, error_middleware_1.asyncErrorHandler)(async (req, res, next) => {
        const startTime = Date.now();
        const { email, password } = req.body;
        // Trouver l'utilisateur avec le mot de passe (select +password)
        const user = await User_model_1.default.findOne({ email }).select('+password');
        if (!user) {
            logger_1.loggers.warn('Login attempt with non-existent email', {
                email,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            throw AppError_1.AppError.unauthorized('Email ou mot de passe incorrect', 'INVALID_CREDENTIALS');
        }
        // Vérifier le mot de passe
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            logger_1.loggers.warn('Login attempt with invalid password', {
                userId: user._id,
                email,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            throw AppError_1.AppError.unauthorized('Email ou mot de passe incorrect', 'INVALID_CREDENTIALS');
        }
        // Générer le token JWT
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            email: user.email
        }, env_config_1.env.JWT_SECRET, {
            expiresIn: env_config_1.env.JWT_EXPIRES_IN,
            issuer: 'runcoach-ai',
            audience: 'runcoach-users'
        });
        // Logger la connexion réussie
        const duration = Date.now() - startTime;
        logger_1.loggers.auth('user_logged_in', user._id.toString(), {
            email,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            duration
        });
        res.json({
            success: true,
            message: 'Connexion réussie',
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    targetRace: user.targetRace
                }
            }
        });
    });
    /**
     * Récupérer le profil de l'utilisateur connecté
     */
    getProfile = (0, error_middleware_1.asyncErrorHandler)(async (req, res, next) => {
        const startTime = Date.now();
        const user = await User_model_1.default.findById(req.userId).select('-password');
        if (!user) {
            throw AppError_1.AppError.notFound('Utilisateur non trouvé', 'USER_NOT_FOUND');
        }
        const duration = Date.now() - startTime;
        logger_1.loggers.database('user_profile_fetch', duration, {
            userId: req.userId
        });
        res.json({
            success: true,
            data: {
                user
            }
        });
    });
    /**
     * Mettre à jour le profil de l'utilisateur
     */
    updateProfile = (0, error_middleware_1.asyncErrorHandler)(async (req, res, next) => {
        const startTime = Date.now();
        const updates = req.body;
        // Supprimer les champs qui ne doivent pas être mis à jour directement
        delete updates.password;
        delete updates.email;
        delete updates._id;
        delete updates.createdAt;
        delete updates.updatedAt;
        const user = await User_model_1.default.findByIdAndUpdate(req.userId, updates, {
            new: true,
            runValidators: true
        }).select('-password');
        if (!user) {
            throw AppError_1.AppError.notFound('Utilisateur non trouvé', 'USER_NOT_FOUND');
        }
        const duration = Date.now() - startTime;
        logger_1.loggers.auth('user_profile_updated', req.userId, {
            updatedFields: Object.keys(updates),
            duration
        });
        res.json({
            success: true,
            message: 'Profil mis à jour avec succès',
            data: {
                user
            }
        });
    });
    /**
     * Vérifier la validité du token
     */
    verifyToken = (0, error_middleware_1.asyncErrorHandler)(async (req, res, next) => {
        res.json({
            success: true,
            message: 'Token valide',
            data: {
                userId: req.userId,
                isValid: true
            }
        });
    });
    /**
     * Déconnexion (optionnelle - côté client)
     */
    logout = (0, error_middleware_1.asyncErrorHandler)(async (req, res, next) => {
        logger_1.loggers.auth('user_logged_out', req.userId, {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        res.json({
            success: true,
            message: 'Déconnexion réussie'
        });
    });
}
exports.AuthController = AuthController;
// Export d'une instance unique du controller
exports.default = new AuthController();
//# sourceMappingURL=auth.controller.js.map