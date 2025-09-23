import { IWorkout } from '../models/Workout.model';
import { IHealthData } from '../models/HealthData.model';
interface ParsedHealthData {
    workouts: Partial<IWorkout>[];
    healthRecords: Partial<IHealthData>[];
    routes: Map<string, any>;
    userProfile: {
        dateOfBirth?: string;
        biologicalSex?: string;
        height?: number;
        weight?: number[];
    };
}
export declare class AppleHealthParser {
    private static instance;
    private constructor();
    static getInstance(): AppleHealthParser;
    parseHealthExport(xmlPath: string): Promise<ParsedHealthData>;
    parseGPXRoute(gpxPath: string): Promise<any[]>;
    analyzeWorkoutType(workout: Partial<IWorkout>): string;
    calculateSplits(coordinates: any[], splitDistance?: number): any[];
    private calculateDistance;
}
declare const _default: AppleHealthParser;
export default _default;
//# sourceMappingURL=appleHealthParser.service.d.ts.map