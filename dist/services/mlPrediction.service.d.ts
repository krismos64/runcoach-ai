import { IWorkout } from '../models/Workout.model';
export interface PredictionInput {
    recentWorkouts: IWorkout[];
    userProfile: {
        age: number;
        weight: number;
        height: number;
        vo2Max: number;
        restingHeartRate: number;
    };
    targetRace: {
        type: string;
        daysUntil: number;
    };
}
export interface WorkoutPrediction {
    type: 'endurance' | 'interval' | 'trail' | 'recovery' | 'tempo' | 'long';
    estimatedDistance: number;
    estimatedDuration: number;
    estimatedPace: number;
    targetHeartRateZone: [number, number];
    confidence: number;
    recommendations: string[];
}
export declare class MLPredictionService {
    private model;
    private static instance;
    private constructor();
    static getInstance(): MLPredictionService;
    private initializeModel;
    private createModel;
    predictNextWorkout(input: PredictionInput): Promise<WorkoutPrediction>;
    private extractFeatures;
    private calculateWeeklyLoad;
    private calculateFatigueLevel;
    private calculateProgressionRate;
    private determineOptimalWorkoutType;
    private calculateTargetDistance;
    private calculateTargetPace;
    private calculateHeartRateZone;
    private generateRecommendations;
    private getDaysSinceLastWorkout;
    private getWorkoutTypeDistribution;
}
declare const _default: MLPredictionService;
export default _default;
//# sourceMappingURL=mlPrediction.service.d.ts.map