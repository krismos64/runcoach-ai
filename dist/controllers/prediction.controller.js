"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionController = void 0;
const Workout_model_1 = __importDefault(require("../models/Workout.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const mlPrediction_service_1 = __importDefault(require("../services/mlPrediction.service"));
class PredictionController {
    async getNextWorkoutPrediction(req, res) {
        try {
            const user = await User_model_1.default.findById(req.userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const recentWorkouts = await Workout_model_1.default.find({ userId: req.userId })
                .sort({ startDate: -1 })
                .limit(20);
            const age = Math.floor((Date.now() - user.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            const daysUntilRace = Math.floor((user.targetRace.date.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
            const prediction = await mlPrediction_service_1.default.predictNextWorkout({
                recentWorkouts,
                userProfile: {
                    age,
                    weight: user.currentWeight,
                    height: user.height,
                    vo2Max: user.vo2Max || 45,
                    restingHeartRate: user.restingHeartRate || 60
                },
                targetRace: {
                    type: user.targetRace.type,
                    daysUntil: daysUntilRace
                }
            });
            res.json(prediction);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getPerformancePrediction(req, res) {
        try {
            const workouts = await Workout_model_1.default.find({ userId: req.userId })
                .sort({ startDate: -1 })
                .limit(50);
            const performanceMetrics = this.calculatePerformanceMetrics(workouts);
            res.json(performanceMetrics);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getRaceTimePrediction(req, res) {
        try {
            const { distance = 21097.5 } = req.query;
            const recentRuns = await Workout_model_1.default.find({
                userId: req.userId,
                trainingType: { $in: ['race', 'tempo', 'interval'] }
            }).sort({ startDate: -1 }).limit(10);
            if (recentRuns.length === 0) {
                return res.status(400).json({ error: 'Not enough data for prediction' });
            }
            const vdotValues = recentRuns.map(run => this.calculateVDOT(run));
            const avgVDOT = vdotValues.reduce((a, b) => a + b, 0) / vdotValues.length;
            const predictedTime = this.predictRaceTime(avgVDOT, Number(distance));
            res.json({
                distance: Number(distance),
                predictedTime,
                predictedPace: predictedTime / (Number(distance) / 1000),
                vdot: avgVDOT,
                confidence: Math.min(0.95, 0.7 + (recentRuns.length * 0.025))
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    calculatePerformanceMetrics(workouts) {
        if (workouts.length === 0) {
            return {
                fitnessLevel: 0,
                progressTrend: 'stable',
                weeklyMileage: 0,
                averagePace: 0
            };
        }
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyWorkouts = workouts.filter(w => w.startDate > oneWeekAgo);
        const weeklyMileage = weeklyWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0) / 1000;
        const averagePace = workouts
            .filter(w => w.averagePace)
            .reduce((sum, w) => sum + w.averagePace, 0) / workouts.filter(w => w.averagePace).length || 0;
        const oldAvgPace = workouts.slice(Math.floor(workouts.length / 2))
            .filter(w => w.averagePace)
            .reduce((sum, w) => sum + w.averagePace, 0) / workouts.slice(Math.floor(workouts.length / 2)).filter(w => w.averagePace).length || averagePace;
        const newAvgPace = workouts.slice(0, Math.floor(workouts.length / 2))
            .filter(w => w.averagePace)
            .reduce((sum, w) => sum + w.averagePace, 0) / workouts.slice(0, Math.floor(workouts.length / 2)).filter(w => w.averagePace).length || averagePace;
        let progressTrend = 'stable';
        if (newAvgPace < oldAvgPace * 0.97)
            progressTrend = 'improving';
        else if (newAvgPace > oldAvgPace * 1.03)
            progressTrend = 'declining';
        const fitnessLevel = Math.min(100, (weeklyMileage / 50) * 100);
        return {
            fitnessLevel,
            progressTrend,
            weeklyMileage,
            averagePace,
            totalWorkouts: workouts.length,
            consistencyScore: Math.min(100, (weeklyWorkouts.length / 3) * 100)
        };
    }
    calculateVDOT(workout) {
        const distance = workout.distance;
        const time = workout.duration;
        const pace = time / distance * 1000;
        const percentMax = 0.8 + 0.1894393 * Math.exp(-0.012778 * time) + 0.2989558 * Math.exp(-0.1932605 * time);
        const vo2 = -4.6 + 0.182258 * (distance / time * 60) + 0.000104 * Math.pow(distance / time * 60, 2);
        const vdot = vo2 / percentMax;
        return Math.min(75, Math.max(30, vdot));
    }
    predictRaceTime(vdot, distance) {
        const percentMax = 0.8 + 0.1894393 * Math.exp(-0.012778 * 60) + 0.2989558 * Math.exp(-0.1932605 * 60);
        const velocity = (vdot * percentMax - 4.6) / 0.182258;
        const time = distance / velocity * 60;
        return time;
    }
}
exports.PredictionController = PredictionController;
//# sourceMappingURL=prediction.controller.js.map