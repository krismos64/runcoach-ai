import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        production: "production";
        test: "test";
    }>>;
    PORT: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    MONGODB_URI: z.ZodString;
    JWT_SECRET: z.ZodString;
    JWT_REFRESH_SECRET: z.ZodOptional<z.ZodString>;
    JWT_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    RATE_LIMIT_WINDOW_MS: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    RATE_LIMIT_MAX_REQUESTS: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    AUTH_RATE_LIMIT_MAX: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<{
        error: "error";
        warn: "warn";
        info: "info";
        debug: "debug";
    }>>;
    BCRYPT_ROUNDS: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
    EMAIL_SERVICE_API_KEY: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type Env = z.infer<typeof envSchema>;
declare let env: Env;
export { env };
export default env;
//# sourceMappingURL=env.config.d.ts.map