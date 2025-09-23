import { z } from 'zod';
export declare const passwordSchema: z.ZodString;
export declare const emailSchema: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
export declare const nameSchema: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
export declare const registerSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
        password: z.ZodString;
        firstName: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
        lastName: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
        dateOfBirth: z.ZodString;
        height: z.ZodNumber;
        currentWeight: z.ZodNumber;
        targetWeight: z.ZodNumber;
        biologicalSex: z.ZodEnum<{
            male: "male";
            female: "female";
        }>;
        targetRace: z.ZodObject<{
            type: z.ZodEnum<{
                "semi-marathon": "semi-marathon";
                marathon: "marathon";
                "10k": "10k";
                "5k": "5k";
            }>;
            date: z.ZodString;
            targetTime: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        preferences: z.ZodOptional<z.ZodObject<{
            weeklyWorkouts: z.ZodDefault<z.ZodNumber>;
            preferredDays: z.ZodDefault<z.ZodArray<z.ZodString>>;
            preferredTime: z.ZodDefault<z.ZodEnum<{
                morning: "morning";
                afternoon: "afternoon";
                evening: "evening";
            }>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
        password: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateProfileSchema: z.ZodObject<{
    body: z.ZodObject<{
        firstName: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
        lastName: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
        height: z.ZodOptional<z.ZodNumber>;
        currentWeight: z.ZodOptional<z.ZodNumber>;
        targetWeight: z.ZodOptional<z.ZodNumber>;
        vo2Max: z.ZodOptional<z.ZodNumber>;
        restingHeartRate: z.ZodOptional<z.ZodNumber>;
        maxHeartRate: z.ZodOptional<z.ZodNumber>;
        targetRace: z.ZodOptional<z.ZodObject<{
            type: z.ZodOptional<z.ZodEnum<{
                "semi-marathon": "semi-marathon";
                marathon: "marathon";
                "10k": "10k";
                "5k": "5k";
            }>>;
            date: z.ZodOptional<z.ZodString>;
            targetTime: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        preferences: z.ZodOptional<z.ZodObject<{
            weeklyWorkouts: z.ZodOptional<z.ZodNumber>;
            preferredDays: z.ZodOptional<z.ZodArray<z.ZodString>>;
            preferredTime: z.ZodOptional<z.ZodEnum<{
                morning: "morning";
                afternoon: "afternoon";
                evening: "evening";
            }>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userParamsSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;
export type UserParamsRequest = z.infer<typeof userParamsSchema>;
//# sourceMappingURL=auth.schema.d.ts.map