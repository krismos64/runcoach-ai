import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
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
        targetRace
      } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

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
        preferences: {
          weeklyWorkouts: 3,
          preferredDays: ['monday', 'wednesday', 'saturday'],
          preferredTime: 'morning'
        }
      });

      await user.save();

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET as string,
        { expiresIn: '30d' }
      );

      res.status(201).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET as string,
        { expiresIn: '30d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const user = await User.findById(req.userId).select('-password');
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const updates = req.body;
      delete updates.password;
      delete updates.email;

      const user = await User.findByIdAndUpdate(
        req.userId,
        updates,
        { new: true }
      ).select('-password');

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}