"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workout_controller_1 = require("../controllers/workout.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const workoutController = new workout_controller_1.WorkoutController();
router.use(auth_middleware_1.authMiddleware);
router.get('/', workoutController.getWorkouts);
router.get('/stats', workoutController.getWorkoutStats);
router.get('/:id', workoutController.getWorkoutById);
router.post('/', workoutController.createWorkout);
router.put('/:id', workoutController.updateWorkout);
router.delete('/:id', workoutController.deleteWorkout);
exports.default = router;
//# sourceMappingURL=workout.routes.js.map