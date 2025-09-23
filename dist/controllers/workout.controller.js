"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutController = void 0;
const Workout_model_1 = __importDefault(require("../models/Workout.model"));
class WorkoutController {
    async getWorkouts(req, res) {
        try {
            const { limit = 50, offset = 0, type, startDate, endDate } = req.query;
            const query = { userId: req.userId };
            if (type) {
                query.trainingType = type;
            }
            if (startDate || endDate) {
                query.startDate = {};
                if (startDate)
                    query.startDate.$gte = new Date(startDate);
                if (endDate)
                    query.startDate.$lte = new Date(endDate);
            }
            const workouts = await Workout_model_1.default.find(query)
                .sort({ startDate: -1 })
                .limit(Number(limit))
                .skip(Number(offset));
            const total = await Workout_model_1.default.countDocuments(query);
            res.json({
                workouts,
                total,
                limit: Number(limit),
                offset: Number(offset)
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getWorkoutById(req, res) {
        try {
            const workout = await Workout_model_1.default.findOne({
                _id: req.params.id,
                userId: req.userId
            });
            if (!workout) {
                return res.status(404).json({ error: 'Workout not found' });
            }
            res.json(workout);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async createWorkout(req, res) {
        try {
            const workoutData = {
                ...req.body,
                userId: req.userId
            };
            const workout = new Workout_model_1.default(workoutData);
            await workout.save();
            res.status(201).json(workout);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async updateWorkout(req, res) {
        try {
            const workout = await Workout_model_1.default.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true });
            if (!workout) {
                return res.status(404).json({ error: 'Workout not found' });
            }
            res.json(workout);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async deleteWorkout(req, res) {
        try {
            const workout = await Workout_model_1.default.findOneAndDelete({
                _id: req.params.id,
                userId: req.userId
            });
            if (!workout) {
                return res.status(404).json({ error: 'Workout not found' });
            }
            res.json({ message: 'Workout deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getWorkoutStats(req, res) {
        try {
            const stats = await Workout_model_1.default.aggregate([
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
            const monthlyStats = await Workout_model_1.default.aggregate([
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
            const typeDistribution = await Workout_model_1.default.aggregate([
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
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.WorkoutController = WorkoutController;
//# sourceMappingURL=workout.controller.js.map