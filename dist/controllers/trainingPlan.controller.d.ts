import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class TrainingPlanController {
    getCurrentPlan(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    generatePlan(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateSession(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getWeekPlan(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    private calculateBaselineMetrics;
    private generateWeeklyPlan;
}
//# sourceMappingURL=trainingPlan.controller.d.ts.map