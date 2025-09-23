import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class PredictionController {
    getNextWorkoutPrediction(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getPerformancePrediction(req: AuthRequest, res: Response): Promise<void>;
    getRaceTimePrediction(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    private calculatePerformanceMetrics;
    private calculateVDOT;
    private predictRaceTime;
}
//# sourceMappingURL=prediction.controller.d.ts.map