import mongoose, { Schema, Document } from 'mongoose';

export interface ITrainingSession {
  date: Date;
  type: 'endurance' | 'interval' | 'trail' | 'recovery' | 'race' | 'tempo' | 'long';
  plannedDistance: number;
  plannedDuration: number;
  plannedPace: number;
  plannedHeartRateZone: string;
  description: string;
  elevationGain?: number;
  completed: boolean;
  actualWorkoutId?: mongoose.Types.ObjectId;
  notes?: string;
  terrainType?: 'road' | 'trail' | 'mixed';
}

export interface IWeeklyPlan {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  sessions: ITrainingSession[];
  totalDistance: number;
  totalDuration: number;
  totalElevation: number;
  weeklyLoad: number;
}

export interface ITrainingPlan extends Document {
  userId: mongoose.Types.ObjectId;
  targetRace: 'semi-marathon' | 'marathon' | '10k' | '5k';
  targetDate: Date;
  targetTime?: number;
  currentWeek: number;
  weeklyPlan: IWeeklyPlan[];
  baselineMetrics: {
    currentVO2Max: number;
    currentPace: number;
    weeklyMileage: number;
    longestRun: number;
  };
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}

const TrainingSessionSchema = new Schema<ITrainingSession>({
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
  actualWorkoutId: { type: Schema.Types.ObjectId, ref: 'Workout' },
  notes: { type: String },
  terrainType: { type: String, enum: ['road', 'trail', 'mixed'] }
});

const WeeklyPlanSchema = new Schema<IWeeklyPlan>({
  weekNumber: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  sessions: [TrainingSessionSchema],
  totalDistance: { type: Number, required: true },
  totalDuration: { type: Number, required: true },
  totalElevation: { type: Number, default: 0 },
  weeklyLoad: { type: Number, required: true }
});

const TrainingPlanSchema = new Schema<ITrainingPlan>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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

export default mongoose.model<ITrainingPlan>('TrainingPlan', TrainingPlanSchema);