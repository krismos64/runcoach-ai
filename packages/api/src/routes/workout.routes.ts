import { Router } from 'express';
import { WorkoutController } from '../controllers/workout.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const workoutController = new WorkoutController();

router.use(authMiddleware);

router.get('/', workoutController.getWorkouts);
router.get('/stats', workoutController.getWorkoutStats);
router.get('/:id', workoutController.getWorkoutById);
router.post('/', workoutController.createWorkout);
router.put('/:id', workoutController.updateWorkout);
router.delete('/:id', workoutController.deleteWorkout);

export default router;