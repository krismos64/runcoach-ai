import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<ITrainingPlan, {}, {}, {}, mongoose.Document<unknown, {}, ITrainingPlan, {}, {}> & ITrainingPlan & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=TrainingPlan.model.d.ts.map