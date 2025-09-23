import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class WorkoutController {
    getWorkouts(req: AuthRequest, res: Response): Promise<void>;
    getWorkoutById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createWorkout(req: AuthRequest, res: Response): Promise<void>;
    updateWorkout(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteWorkout(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getWorkoutStats(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=workout.controller.d.ts.map