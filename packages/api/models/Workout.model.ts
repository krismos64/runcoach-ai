import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkout extends Document {
  userId: mongoose.Types.ObjectId;
  workoutActivityType: string;
  duration: number;
  distance: number;
  energyBurned: number;
  startDate: Date;
  endDate: Date;
  averageHeartRate?: number;
  maxHeartRate?: number;
  minHeartRate?: number;
  averagePace?: number;
  maxPace?: number;
  elevationGain?: number;
  elevationLoss?: number;
  steps?: number;
  cadence?: number;
  temperature?: number;
  humidity?: number;
  route?: {
    coordinates: Array<{
      latitude: number;
      longitude: number;
      altitude?: number;
      timestamp: Date;
      speed?: number;
    }>;
  };
  statistics: Array<{
    type: string;
    value: number;
    unit: string;
  }>;
  notes?: string;
  perceivedEffort?: number;
  weatherConditions?: string;
  terrain?: 'road' | 'trail' | 'track' | 'treadmill';
  trainingType?: 'endurance' | 'interval' | 'trail' | 'recovery' | 'race' | 'tempo' | 'long';
  splits?: Array<{
    distance: number;
    duration: number;
    pace: number;
    heartRate?: number;
    elevation?: number;
  }>;
  source: string;
  sourceVersion?: string;
  device?: string;
  appleHealthId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutSchema = new Schema<IWorkout>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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

export default mongoose.model<IWorkout>('Workout', WorkoutSchema);