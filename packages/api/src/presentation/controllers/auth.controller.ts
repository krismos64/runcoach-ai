import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../../models/User.model';
import { AppError } from '../../shared/errors/AppError';
import { env } from '../../shared/config/env.config';
import { loggers } from '../../infrastructure/logging/logger.simple';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncErrorHandler } from '../middleware/error.middleware';

export class AuthController {
  /**
   * Inscription d'un nouvel utilisateur
   */
  register = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    const {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      height,
      currentWeight,
      targetWeight,
      biologicalSex,
      targetRace,
      preferences
    } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      loggers.warn('Registration attempt with existing email', {
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      throw AppError.conflict('Cet email est déjà utilisé', 'EMAIL_ALREADY_EXISTS');
    }

    // Créer le nouvel utilisateur
    const user = new User({
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
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    // Logger l'inscription réussie
    const duration = Date.now() - startTime;
    loggers.auth('user_registered', user._id.toString(), {
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
  login = asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const { email, password } = req.body;

    // Trouver l'utilisateur avec le mot de passe (select +password)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      loggers.warn('Login attempt with non-existent email', {
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      throw AppError.unauthorized('Email ou mot de passe incorrect', 'INVALID_CREDENTIALS');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      loggers.warn('Login attempt with invalid password', {
        userId: user._id,
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      throw AppError.unauthorized('Email ou mot de passe incorrect', 'INVALID_CREDENTIALS');
    }

    // Générer le token JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    // Logger la connexion réussie
    const duration = Date.now() - startTime;
    loggers.auth('user_logged_in', user._id.toString(), {
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
  getProfile = asyncErrorHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      throw AppError.notFound('Utilisateur non trouvé', 'USER_NOT_FOUND');
    }

    const duration = Date.now() - startTime;
    loggers.database('user_profile_fetch', duration, {
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
  updateProfile = asyncErrorHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const updates = req.body;

    // Supprimer les champs qui ne doivent pas être mis à jour directement
    delete updates.password;
    delete updates.email;
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    const user = await User.findByIdAndUpdate(
      req.userId,
      updates,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      throw AppError.notFound('Utilisateur non trouvé', 'USER_NOT_FOUND');
    }

    const duration = Date.now() - startTime;
    loggers.auth('user_profile_updated', req.userId, {
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
  verifyToken = asyncErrorHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
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
  logout = asyncErrorHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    loggers.auth('user_logged_out', req.userId, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  });
}

// Export d'une instance unique du controller
export default new AuthController();