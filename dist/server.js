"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
// Configuration et logging
const env_config_1 = require("./shared/config/env.config");
const logger_1 = require("./infrastructure/logging/logger");
// Sécurité
const security_config_1 = require("./infrastructure/security/security.config");
// Middleware d'erreurs
const error_middleware_1 = require("./presentation/middleware/error.middleware");
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const workout_routes_1 = __importDefault(require("./routes/workout.routes"));
const healthData_routes_1 = __importDefault(require("./routes/healthData.routes"));
const prediction_routes_1 = __importDefault(require("./routes/prediction.routes"));
const trainingPlan_routes_1 = __importDefault(require("./routes/trainingPlan.routes"));
// Configuration des gestionnaires d'erreurs globaux
(0, error_middleware_1.setupGlobalErrorHandlers)();
const app = (0, express_1.default)();
const PORT = env_config_1.env.PORT;
// Trust proxy (important pour rate limiting et logs)
app.set('trust proxy', 1);
// Logging HTTP
app.use(logger_1.httpLogger);
// Sécurité (Helmet, Rate limiting, Sanitization)
app.use(security_config_1.securityMiddleware);
// CORS
app.use((0, cors_1.default)({
    origin: env_config_1.env.NODE_ENV === 'development'
        ? true
        : ['https://runcoach-ai.com', 'https://www.runcoach-ai.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// Parsing JSON et URL-encoded
app.use(express_1.default.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        // Log des requêtes suspectes (très grandes)
        if (buf.length > 5 * 1024 * 1024) { // 5MB
            logger_1.loggers.warn('Large request detected', {
                size: buf.length,
                path: req.path,
                ip: req.ip
            });
        }
    }
}));
app.use(express_1.default.urlencoded({
    extended: true,
    limit: '10mb'
}));
// Health check endpoint (avant les autres routes)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: env_config_1.env.NODE_ENV,
        version: '1.0.0'
    });
});
// Routes API
app.use('/api/auth', auth_routes_1.default);
app.use('/api/workouts', workout_routes_1.default);
app.use('/api/health-data', healthData_routes_1.default);
app.use('/api/predictions', prediction_routes_1.default);
app.use('/api/training-plans', trainingPlan_routes_1.default);
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Route de bienvenue pour la racine
app.get('/', (req, res) => {
    res.json({
        message: '🏃‍♂️ RunCoach AI API',
        version: '1.0.0',
        status: 'running',
        environment: env_config_1.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            workouts: '/api/workouts',
            healthData: '/api/health-data',
            predictions: '/api/predictions',
            trainingPlans: '/api/training-plans',
            health: '/health'
        }
    });
});
// Servir les fichiers statiques en production
if (env_config_1.env.NODE_ENV === 'production') {
    app.use(express_1.default.static(path_1.default.join(__dirname, '../runcoach-ai/client/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(__dirname, '../runcoach-ai/client/dist/index.html'));
    });
}
// Gestion des routes non trouvées (404)
app.use(error_middleware_1.notFoundHandler);
// Middleware global de gestion d'erreurs (doit être en dernier)
app.use(error_middleware_1.errorHandler);
// Configuration MongoDB
mongoose_1.default.set('strictQuery', false);
// Connexion à MongoDB avec gestion d'erreurs améliorée
mongoose_1.default
    .connect(env_config_1.env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
    .then(() => {
    logger_1.loggers.info('MongoDB connected successfully', {
        database: env_config_1.env.MONGODB_URI.split('/').pop()?.split('?')[0],
        environment: env_config_1.env.NODE_ENV
    });
    // Démarrer le serveur seulement après la connexion DB
    const server = app.listen(PORT, () => {
        logger_1.loggers.info('Server started successfully', {
            port: PORT,
            environment: env_config_1.env.NODE_ENV,
            logLevel: env_config_1.env.LOG_LEVEL,
            pid: process.pid
        });
    });
    // Gestion gracieuse de l'arrêt du serveur
    const gracefulShutdown = (signal) => {
        logger_1.loggers.info(`Received ${signal}, starting graceful shutdown`);
        server.close(() => {
            logger_1.loggers.info('HTTP server closed');
            mongoose_1.default.connection.close(false, () => {
                logger_1.loggers.info('MongoDB connection closed');
                process.exit(0);
            });
        });
    };
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
})
    .catch((error) => {
    logger_1.loggers.error('MongoDB connection failed', error, {
        database: env_config_1.env.MONGODB_URI.split('/').pop()?.split('?')[0],
        environment: env_config_1.env.NODE_ENV
    });
    process.exit(1);
});
// Gestion des erreurs de connexion MongoDB
mongoose_1.default.connection.on('error', (error) => {
    logger_1.loggers.error('MongoDB connection error', error);
});
mongoose_1.default.connection.on('disconnected', () => {
    logger_1.loggers.warn('MongoDB disconnected');
});
mongoose_1.default.connection.on('reconnected', () => {
    logger_1.loggers.info('MongoDB reconnected');
});
//# sourceMappingURL=server.js.map