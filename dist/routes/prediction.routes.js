"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prediction_controller_1 = require("../controllers/prediction.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const predictionController = new prediction_controller_1.PredictionController();
router.use(auth_middleware_1.authMiddleware);
router.get('/next-workout', predictionController.getNextWorkoutPrediction);
router.get('/performance', predictionController.getPerformancePrediction);
router.get('/race-time', predictionController.getRaceTimePrediction);
exports.default = router;
//# sourceMappingURL=prediction.routes.js.map