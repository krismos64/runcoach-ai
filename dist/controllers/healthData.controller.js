"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthDataController = void 0;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const HealthData_model_1 = __importDefault(require("../models/HealthData.model"));
const Workout_model_1 = __importDefault(require("../models/Workout.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const appleHealthParser_service_1 = __importDefault(require("../services/appleHealthParser.service"));
class HealthDataController {
    async importHealthData(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            const filePath = req.file.path;
            const healthExportPath = path_1.default.resolve('../export.xml');
            const workoutRoutesPath = path_1.default.resolve('../workout-routes');
            const parsedData = await appleHealthParser_service_1.default.parseHealthExport(filePath);
            const importedWorkouts = [];
            const importedHealthRecords = [];
            for (const workoutData of parsedData.workouts) {
                const existingWorkout = await Workout_model_1.default.findOne({
                    userId: req.userId,
                    appleHealthId: workoutData.appleHealthId
                });
                if (!existingWorkout && workoutData.workoutActivityType === 'HKWorkoutActivityTypeRunning') {
                    const workout = new Workout_model_1.default({
                        ...workoutData,
                        userId: req.userId,
                        trainingType: appleHealthParser_service_1.default.analyzeWorkoutType(workoutData)
                    });
                    if (parsedData.routes.has(workoutData.appleHealthId)) {
                        const routePath = path_1.default.join(workoutRoutesPath, parsedData.routes.get(workoutData.appleHealthId));
                        const coordinates = await appleHealthParser_service_1.default.parseGPXRoute(routePath);
                        if (coordinates.length > 0) {
                            workout.route = { coordinates };
                            workout.splits = appleHealthParser_service_1.default.calculateSplits(coordinates);
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
                if (healthTypes.includes(record.type)) {
                    const existingRecord = await HealthData_model_1.default.findOne({
                        userId: req.userId,
                        appleHealthId: record.appleHealthId
                    });
                    if (!existingRecord) {
                        const healthRecord = new HealthData_model_1.default({
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
                    .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
                await User_model_1.default.findByIdAndUpdate(req.userId, {
                    currentWeight: latestWeight.value,
                    height: parsedData.userProfile.height,
                    biologicalSex: parsedData.userProfile.biologicalSex
                });
            }
            await promises_1.default.unlink(filePath);
            res.json({
                message: 'Health data imported successfully',
                imported: {
                    workouts: importedWorkouts.length,
                    healthRecords: importedHealthRecords.length
                }
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getWeightHistory(req, res) {
        try {
            const weightData = await HealthData_model_1.default.find({
                userId: req.userId,
                type: 'HKQuantityTypeIdentifierBodyMass'
            }).sort({ date: -1 }).limit(100);
            res.json(weightData);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getHeartRateData(req, res) {
        try {
            const heartRateData = await HealthData_model_1.default.find({
                userId: req.userId,
                type: { $in: ['HKQuantityTypeIdentifierRestingHeartRate', 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN'] }
            }).sort({ date: -1 }).limit(100);
            res.json(heartRateData);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getVO2MaxHistory(req, res) {
        try {
            const vo2MaxData = await HealthData_model_1.default.find({
                userId: req.userId,
                type: 'HKQuantityTypeIdentifierVO2Max'
            }).sort({ date: -1 }).limit(50);
            res.json(vo2MaxData);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.HealthDataController = HealthDataController;
//# sourceMappingURL=healthData.controller.js.map