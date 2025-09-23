import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import HealthData from '../models/HealthData.model';
import Workout from '../models/Workout.model';
import User from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';
import appleHealthParser from '../services/appleHealthParser.service';

export class HealthDataController {
  async importHealthData(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filePath = req.file.path;
      const healthExportPath = path.resolve('../export.xml');
      const workoutRoutesPath = path.resolve('../workout-routes');

      const parsedData = await appleHealthParser.parseHealthExport(filePath);

      const importedWorkouts = [];
      const importedHealthRecords = [];

      for (const workoutData of parsedData.workouts) {
        const existingWorkout = await Workout.findOne({
          userId: req.userId,
          appleHealthId: workoutData.appleHealthId
        });

        if (!existingWorkout && workoutData.workoutActivityType === 'HKWorkoutActivityTypeRunning') {
          const workout = new Workout({
            ...workoutData,
            userId: req.userId,
            trainingType: appleHealthParser.analyzeWorkoutType(workoutData)
          });

          if (parsedData.routes.has(workoutData.appleHealthId!)) {
            const routePath = path.join(workoutRoutesPath, parsedData.routes.get(workoutData.appleHealthId!));
            const coordinates = await appleHealthParser.parseGPXRoute(routePath);

            if (coordinates.length > 0) {
              workout.route = { coordinates };
              workout.splits = appleHealthParser.calculateSplits(coordinates);
            }
          }

          await workout.save();
          importedWorkouts.push(workout);
        }
      }

      const healthTypes = [
        'HKQuantityTypeIdentifierBodyMass',
        'HKQuantityTypeIdentifierVO2Max',
        'HKQuantityTypeIdentifierRestingHeartRate',
        'HKQuantityTypeIdentifierHeartRateVariabilitySDNN'
      ];

      for (const record of parsedData.healthRecords) {
        if (healthTypes.includes(record.type!)) {
          const existingRecord = await HealthData.findOne({
            userId: req.userId,
            appleHealthId: record.appleHealthId
          });

          if (!existingRecord) {
            const healthRecord = new HealthData({
              ...record,
              userId: req.userId
            });
            await healthRecord.save();
            importedHealthRecords.push(healthRecord);
          }
        }
      }

      if (parsedData.userProfile.weight && parsedData.userProfile.weight.length > 0) {
        const latestWeight = parsedData.userProfile.weight
          .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())[0];

        await User.findByIdAndUpdate(req.userId, {
          currentWeight: latestWeight.value,
          height: parsedData.userProfile.height,
          biologicalSex: parsedData.userProfile.biologicalSex
        });
      }

      await fs.unlink(filePath);

      res.json({
        message: 'Health data imported successfully',
        imported: {
          workouts: importedWorkouts.length,
          healthRecords: importedHealthRecords.length
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getWeightHistory(req: AuthRequest, res: Response) {
    try {
      const weightData = await HealthData.find({
        userId: req.userId,
        type: 'HKQuantityTypeIdentifierBodyMass'
      }).sort({ date: -1 }).limit(100);

      res.json(weightData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getHeartRateData(req: AuthRequest, res: Response) {
    try {
      const heartRateData = await HealthData.find({
        userId: req.userId,
        type: { $in: ['HKQuantityTypeIdentifierRestingHeartRate', 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN'] }
      }).sort({ date: -1 }).limit(100);

      res.json(heartRateData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getVO2MaxHistory(req: AuthRequest, res: Response) {
    try {
      const vo2MaxData = await HealthData.find({
        userId: req.userId,
        type: 'HKQuantityTypeIdentifierVO2Max'
      }).sort({ date: -1 }).limit(50);

      res.json(vo2MaxData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}