import { Router } from 'express';
import { PredictionController } from '../controllers/prediction.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const predictionController = new PredictionController();

router.use(authMiddleware);

router.get('/next-workout', predictionController.getNextWorkoutPrediction);
router.get('/performance', predictionController.getPerformancePrediction);
router.get('/race-time', predictionController.getRaceTimePrediction);

export default router;