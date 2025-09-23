"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trainingPlan_controller_1 = require("../controllers/trainingPlan.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const trainingPlanController = new trainingPlan_controller_1.TrainingPlanController();
router.use(auth_middleware_1.authMiddleware);
router.get('/current', trainingPlanController.getCurrentPlan);
router.post('/generate', trainingPlanController.generatePlan);
router.put('/session/:sessionId', trainingPlanController.updateSession);
router.get('/week/:weekNumber', trainingPlanController.getWeekPlan);
exports.default = router;
//# sourceMappingURL=trainingPlan.routes.js.map