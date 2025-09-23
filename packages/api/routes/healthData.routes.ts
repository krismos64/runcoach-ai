import { Router } from 'express';
import { HealthDataController } from '../controllers/healthData.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();
const healthDataController = new HealthDataController();

router.use(authMiddleware);

router.post('/import', upload.single('healthExport'), healthDataController.importHealthData);
router.get('/weight', healthDataController.getWeightHistory);
router.get('/heart-rate', healthDataController.getHeartRateData);
router.get('/vo2max', healthDataController.getVO2MaxHistory);

export default router;