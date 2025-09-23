"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const healthData_controller_1 = require("../controllers/healthData.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
const healthDataController = new healthData_controller_1.HealthDataController();
router.use(auth_middleware_1.authMiddleware);
router.post('/import', upload_middleware_1.upload.single('healthExport'), healthDataController.importHealthData);
router.get('/weight', healthDataController.getWeightHistory);
router.get('/heart-rate', healthDataController.getHeartRateData);
router.get('/vo2max', healthDataController.getVO2MaxHistory);
exports.default = router;
//# sourceMappingURL=healthData.routes.js.map