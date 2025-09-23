import { Request, Response } from 'express';
import Workout from '../models/Workout.model';
import { AuthRequest } from '../middleware/auth.middleware';

export class WorkoutController {
  async getWorkouts(req: AuthRequest, res: Response) {
    try {
      const {
        limit = 50,
        offset = 0,
        type,
        startDate,
        endDate
      } = req.query;

      const query: any = { userId: req.userId };

      if (type) {
        query.trainingType = type;
      }

      if (startDate || endDate) {
        query.startDate = {};
        if (startDate) query.startDate.$gte = new Date(startDate as string);
        if (endDate) query.startDate.$lte = new Date(endDate as string);
      }

      const workouts = await Workout.find(query)
        .sort({ startDate: -1 })
        .limit(Number(limit))
        .skip(Number(offset));

      const total = await Workout.countDocuments(query);

      res.json({
        workouts,
        total,
        limit: Number(limit),
        offset: Number(offset)
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getWorkoutById(req: AuthRequest, res: Response) {
    try {
      const workout = await Workout.findOne({
        _id: req.params.id,
        userId: req.userId
      });

      if (!workout) {
        return res.status(404).json({ error: 'Workout not found' });
      }

      res.json(workout);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createWorkout(req: AuthRequest, res: Response) {
    try {
      const workoutData = {
        ...req.body,
        userId: req.userId
      };

      const workout = new Workout(workoutData);
      await workout.save();

      res.status(201).json(workout);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateWorkout(req: AuthRequest, res: Response) {
    try {
      const workout = await Workout.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        req.body,
        { new: true }
      );

      if (!workout) {
        return res.status(404).json({ error: 'Workout not found' });
      }

      res.json(workout);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteWorkout(req: AuthRequest, res: Response) {
    try {
      const workout = await Workout.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId
      });

      if (!workout) {
        return res.status(404).json({ error: 'Workout not found' });
      }

      res.json({ message: 'Workout deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getWorkoutStats(req: AuthRequest, res: Response) {
    try {
      const stats = await Workout.aggregate([
        { $match: { userId: req.userId } },
        {
          $group: {
            _id: null,
            totalWorkouts: { $sum: 1 },
            totalDistance: { $sum: '$distance' },
            totalDuration: { $sum: '$duration' },
            totalEnergyBurned: { $sum: '$energyBurned' },
            avgDistance: { $avg: '$distance' },
            avgDuration: { $avg: '$duration' },
            avgPace: { $avg: '$averagePace' },
            avgHeartRate: { $avg: '$averageHeartRate' },
            maxDistance: { $max: '$distance' },
            longestDuration: { $max: '$duration' }
          }
        }
      ]);

      const monthlyStats = await Workout.aggregate([
        { $match: { userId: req.userId } },
        {
          $group: {
            _id: {
              year: { $year: '$startDate' },
              month: { $month: '$startDate' }
            },
            count: { $sum: 1 },
            totalDistance: { $sum: '$distance' },
            totalDuration: { $sum: '$duration' }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ]);

      const typeDistribution = await Workout.aggregate([
        { $match: { userId: req.userId } },
        {
          $group: {
            _id: '$trainingType',
            count: { $sum: 1 },
            totalDistance: { $sum: '$distance' }
          }
        }
      ]);

      res.json({
        overall: stats[0] || {},
        monthly: monthlyStats,
        byType: typeDistribution
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}