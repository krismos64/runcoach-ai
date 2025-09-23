import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class HealthDataController {
    importHealthData(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getWeightHistory(req: AuthRequest, res: Response): Promise<void>;
    getHeartRateData(req: AuthRequest, res: Response): Promise<void>;
    getVO2MaxHistory(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=healthData.controller.d.ts.map