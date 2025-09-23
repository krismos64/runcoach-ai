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
const WorkoutSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    workoutActivityType: { type: String, required: true },
    duration: { type: Number, required: true },
    distance: { type: Number, required: true },
    energyBurned: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    averageHeartRate: { type: Number },
    maxHeartRate: { type: Number },
    minHeartRate: { type: Number },
    averagePace: { type: Number },
    maxPace: { type: Number },
    elevationGain: { type: Number },
    elevationLoss: { type: Number },
    steps: { type: Number },
    cadence: { type: Number },
    temperature: { type: Number },
    humidity: { type: Number },
    route: {
        coordinates: [{
                latitude: { type: Number },
                longitude: { type: Number },
                altitude: { type: Number },
                timestamp: { type: Date },
                speed: { type: Number }
            }]
    },
    statistics: [{
            type: { type: String },
            value: { type: Number },
            unit: { type: String }
        }],
    notes: { type: String },
    perceivedEffort: { type: Number, min: 1, max: 10 },
    weatherConditions: { type: String },
    terrain: { type: String, enum: ['road', 'trail', 'track', 'treadmill'] },
    trainingType: {
        type: String,
        enum: ['endurance', 'interval', 'trail', 'recovery', 'race', 'tempo', 'long']
    },
    splits: [{
            distance: { type: Number },
            duration: { type: Number },
            pace: { type: Number },
            heartRate: { type: Number },
            elevation: { type: Number }
        }],
    source: { type: String, required: true },
    sourceVersion: { type: String },
    device: { type: String },
    appleHealthId: { type: String, sparse: true }
}, { timestamps: true });
WorkoutSchema.index({ userId: 1, startDate: -1 });
WorkoutSchema.index({ userId: 1, trainingType: 1 });
WorkoutSchema.index({ appleHealthId: 1 }, { unique: true, sparse: true });
exports.default = mongoose_1.default.model('Workout', WorkoutSchema);
//# sourceMappingURL=Workout.model.js.map