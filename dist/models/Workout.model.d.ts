import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IWorkout, {}, {}, {}, mongoose.Document<unknown, {}, IWorkout, {}, {}> & IWorkout & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Workout.model.d.ts.map