import { Router } from 'express';
import { TrainingPlanController } from '../controllers/trainingPlan.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const trainingPlanController = new TrainingPlanController();

router.use(authMiddleware);

router.get('/current', trainingPlanController.getCurrentPlan);
router.post('/generate', trainingPlanController.generatePlan);
router.put('/session/:sessionId', trainingPlanController.updateSession);
router.get('/week/:weekNumber', trainingPlanController.getWeekPlan);

export default router;