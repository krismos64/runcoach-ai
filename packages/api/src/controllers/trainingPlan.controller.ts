import { Request, Response } from 'express';
import TrainingPlan from '../models/TrainingPlan.model';
import Workout from '../models/Workout.model';
import User from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';

export class TrainingPlanController {
  async getCurrentPlan(req: AuthRequest, res: Response) {
    try {
      const plan = await TrainingPlan.findOne({
        userId: req.userId,
        status: 'active'
      });

      if (!plan) {
        return res.status(404).json({ error: 'No active training plan found' });
      }

      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async generatePlan(req: AuthRequest, res: Response) {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const existingPlan = await TrainingPlan.findOne({
        userId: req.userId,
        status: 'active'
      });

      if (existingPlan) {
        existingPlan.status = 'paused';
        await existingPlan.save();
      }

      const recentWorkouts = await Workout.find({ userId: req.userId })
        .sort({ startDate: -1 })
        .limit(20);

      const baselineMetrics = this.calculateBaselineMetrics(recentWorkouts);
      const weeklyPlan = this.generateWeeklyPlan(user, baselineMetrics);

      const trainingPlan = new TrainingPlan({
        userId: req.userId,
        targetRace: user.targetRace.type,
        targetDate: user.targetRace.date,
        targetTime: user.targetRace.targetTime,
        currentWeek: 1,
        weeklyPlan,
        baselineMetrics,
        status: 'active'
      });

      await trainingPlan.save();

      res.status(201).json(trainingPlan);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateSession(req: AuthRequest, res: Response) {
    try {
      const { sessionId } = req.params;
      const { completed, actualWorkoutId, notes } = req.body;

      const plan = await TrainingPlan.findOne({
        userId: req.userId,
        status: 'active'
      });

      if (!plan) {
        return res.status(404).json({ error: 'No active training plan found' });
      }

      let sessionUpdated = false;

      for (const week of plan.weeklyPlan) {
        const session = week.sessions.find((s: any) => s._id.toString() === sessionId);
        if (session) {
          session.completed = completed;
          if (actualWorkoutId) session.actualWorkoutId = actualWorkoutId;
          if (notes) session.notes = notes;
          sessionUpdated = true;
          break;
        }
      }

      if (!sessionUpdated) {
        return res.status(404).json({ error: 'Session not found' });
      }

      await plan.save();

      res.json({ message: 'Session updated successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getWeekPlan(req: AuthRequest, res: Response) {
    try {
      const { weekNumber } = req.params;

      const plan = await TrainingPlan.findOne({
        userId: req.userId,
        status: 'active'
      });

      if (!plan) {
        return res.status(404).json({ error: 'No active training plan found' });
      }

      const week = plan.weeklyPlan.find(w => w.weekNumber === Number(weekNumber));

      if (!week) {
        return res.status(404).json({ error: 'Week not found' });
      }

      res.json(week);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  private calculateBaselineMetrics(workouts: any[]) {
    const avgPace = workouts.reduce((sum, w) => sum + (w.averagePace || 360), 0) / workouts.length || 360;
    const weeklyMileage = workouts
      .filter(w => w.startDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .reduce((sum, w) => sum + w.distance, 0) / 1000;
    const longestRun = Math.max(...workouts.map(w => w.distance), 10000);

    const vdotEstimate = 295 / avgPace * 10 + 20;

    return {
      currentVO2Max: Math.min(60, Math.max(35, vdotEstimate)),
      currentPace: avgPace,
      weeklyMileage: weeklyMileage || 20,
      longestRun: longestRun / 1000
    };
  }

  private generateWeeklyPlan(user: any, baselineMetrics: any) {
    const weeksUntilRace = Math.ceil((user.targetRace.date.getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000));
    const weeks = [];

    for (let i = 1; i <= Math.min(weeksUntilRace, 12); i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() + (i - 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const progressionFactor = Math.min(1.5, 1 + (i * 0.05));
      const taperFactor = i > weeksUntilRace - 2 ? 0.7 : 1;

      const sessions = [];

      const enduranceDate = new Date(weekStart);
      enduranceDate.setDate(enduranceDate.getDate() + 1);
      sessions.push({
        date: enduranceDate,
        type: 'endurance' as const,
        plannedDistance: Math.round(baselineMetrics.weeklyMileage * 0.4 * progressionFactor * taperFactor * 1000),
        plannedDuration: 45 * progressionFactor * taperFactor,
        plannedPace: baselineMetrics.currentPace * 1.15,
        plannedHeartRateZone: 'Z2 (60-70% FCmax)',
        description: 'Endurance fondamentale - Rythme confortable, conversation possible',
        completed: false
      });

      const intervalDate = new Date(weekStart);
      intervalDate.setDate(intervalDate.getDate() + 3);
      sessions.push({
        date: intervalDate,
        type: 'interval' as const,
        plannedDistance: Math.round(baselineMetrics.weeklyMileage * 0.25 * progressionFactor * taperFactor * 1000),
        plannedDuration: 40 * progressionFactor * taperFactor,
        plannedPace: baselineMetrics.currentPace * 0.95,
        plannedHeartRateZone: 'Z4 (80-90% FCmax)',
        description: `Fractionné - ${i < 4 ? '6x800m' : i < 8 ? '5x1000m' : '4x1500m'} avec récup active`,
        completed: false
      });

      const trailDate = new Date(weekStart);
      trailDate.setDate(trailDate.getDate() + 5);
      sessions.push({
        date: trailDate,
        type: 'trail' as const,
        plannedDistance: Math.round(baselineMetrics.weeklyMileage * 0.35 * progressionFactor * taperFactor * 1000),
        plannedDuration: 60 * progressionFactor * taperFactor,
        plannedPace: baselineMetrics.currentPace * 1.25,
        plannedHeartRateZone: 'Z3 (70-80% FCmax)',
        description: 'Trail avec dénivelé - Focus sur les côtes et technique',
        elevationGain: 100 + i * 10,
        terrainType: 'trail',
        completed: false
      });

      const totalDistance = sessions.reduce((sum, s) => sum + s.plannedDistance, 0);
      const totalDuration = sessions.reduce((sum, s) => sum + s.plannedDuration, 0);
      const totalElevation = sessions.reduce((sum, s) => sum + (s.elevationGain || 0), 0);

      weeks.push({
        weekNumber: i,
        startDate: weekStart,
        endDate: weekEnd,
        sessions,
        totalDistance,
        totalDuration,
        totalElevation,
        weeklyLoad: totalDistance * totalDuration / 1000
      });
    }

    return weeks;
  }
}