"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const TrainingSessionSchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    type: {
        type: String,
        enum: ['endurance', 'interval', 'trail', 'recovery', 'race', 'tempo', 'long'],
        required: true
    },
    plannedDistance: { type: Number, required: true },
    plannedDuration: { type: Number, required: true },
    plannedPace: { type: Number, required: true },
    plannedHeartRateZone: { type: String, required: true },
    description: { type: String, required: true },
    elevationGain: { type: Number },
    completed: { type: Boolean, default: false },
    actualWorkoutId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Workout' },
    notes: { type: String },
    terrainType: { type: String, enum: ['road', 'trail', 'mixed'] }
});
const WeeklyPlanSchema = new mongoose_1.Schema({
    weekNumber: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    sessions: [TrainingSessionSchema],
    totalDistance: { type: Number, required: true },
    totalDuration: { type: Number, required: true },
    totalElevation: { type: Number, default: 0 },
    weeklyLoad: { type: Number, required: true }
});
const TrainingPlanSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    targetRace: {
        type: String,
        enum: ['semi-marathon', 'marathon', '10k', '5k'],
        required: true
    },
    targetDate: { type: Date, required: true },
    targetTime: { type: Number },
    currentWeek: { type: Number, default: 1 },
    weeklyPlan: [WeeklyPlanSchema],
    baselineMetrics: {
        currentVO2Max: { type: Number, required: true },
        currentPace: { type: Number, required: true },
        weeklyMileage: { type: Number, required: true },
        longestRun: { type: Number, required: true }
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'paused'],
        default: 'active'
    }
}, { timestamps: true });
TrainingPlanSchema.index({ userId: 1, status: 1 });
TrainingPlanSchema.index({ userId: 1, targetDate: 1 });
exports.default = mongoose_1.default.model('TrainingPlan', TrainingPlanSchema);
//# sourceMappingURL=TrainingPlan.model.js.map