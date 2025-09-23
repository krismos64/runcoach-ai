"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().transform(Number).default(3001),
    // Database
    MONGODB_URI: zod_1.z.string().url(),
    // JWT
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters').optional(),
    JWT_EXPIRES_IN: zod_1.z.string().default('15m'),
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().transform(Number).default(900000), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.string().transform(Number).default(100),
    AUTH_RATE_LIMIT_MAX: zod_1.z.string().transform(Number).default(5),
    // Logging
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    // Security
    BCRYPT_ROUNDS: zod_1.z.string().transform(Number).default(12),
    // External Services (optional for now)
    OPENAI_API_KEY: zod_1.z.string().optional(),
    EMAIL_SERVICE_API_KEY: zod_1.z.string().optional(),
});
let env;
try {
    exports.env = env = envSchema.parse(process.env);
}
catch (error) {
    if (error instanceof zod_1.z.ZodError) {
        console.error('❌ Configuration error:', error.issues);
        process.exit(1);
    }
    throw error;
}
exports.default = env;
//# sourceMappingURL=env.config.js.map