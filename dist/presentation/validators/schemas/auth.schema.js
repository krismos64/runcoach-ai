"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userParamsSchema = exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = exports.nameSchema = exports.emailSchema = exports.passwordSchema = void 0;
const zod_1 = require("zod");
// Schémas de base réutilisables
exports.passwordSchema = zod_1.z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre');
exports.emailSchema = zod_1.z
    .string()
    .email('Format d\'email invalide')
    .max(255, 'L\'email ne peut pas dépasser 255 caractères')
    .transform(email => email.toLowerCase().trim());
exports.nameSchema = zod_1.z
    .string()
    .min(1, 'Ce champ est requis')
    .max(50, 'Ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, 'Seules les lettres, espaces, tirets et apostrophes sont autorisés')
    .transform(name => name.trim());
// Schéma pour l'inscription
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: exports.emailSchema,
        password: exports.passwordSchema,
        firstName: exports.nameSchema,
        lastName: exports.nameSchema,
        dateOfBirth: zod_1.z
            .string()
            .datetime('Format de date invalide')
            .refine((date) => {
            const birthDate = new Date(date);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            return age >= 13 && age <= 120;
        }, 'L\'âge doit être entre 13 et 120 ans'),
        height: zod_1.z
            .number()
            .min(100, 'La taille doit être d\'au moins 100cm')
            .max(250, 'La taille ne peut pas dépasser 250cm'),
        currentWeight: zod_1.z
            .number()
            .min(30, 'Le poids doit être d\'au moins 30kg')
            .max(300, 'Le poids ne peut pas dépasser 300kg'),
        targetWeight: zod_1.z
            .number()
            .min(30, 'Le poids cible doit être d\'au moins 30kg')
            .max(300, 'Le poids cible ne peut pas dépasser 300kg'),
        biologicalSex: zod_1.z.enum(['male', 'female'], {
            message: 'Le sexe biologique doit être "male" ou "female"'
        }),
        targetRace: zod_1.z.object({
            type: zod_1.z.enum(['semi-marathon', 'marathon', '10k', '5k'], {
                message: 'Type de course invalide'
            }),
            date: zod_1.z
                .string()
                .datetime('Format de date invalide')
                .refine((date) => new Date(date) > new Date(), 'La date de course doit être dans le futur'),
            targetTime: zod_1.z
                .number()
                .min(600, 'Le temps cible doit être d\'au moins 10 minutes')
                .max(18000, 'Le temps cible ne peut pas dépasser 5 heures')
                .optional()
        }),
        preferences: zod_1.z.object({
            weeklyWorkouts: zod_1.z
                .number()
                .min(1, 'Au moins 1 entraînement par semaine')
                .max(7, 'Maximum 7 entraînements par semaine')
                .default(3),
            preferredDays: zod_1.z
                .array(zod_1.z.string())
                .min(1, 'Au moins un jour préféré requis')
                .max(7, 'Maximum 7 jours')
                .default(['monday', 'wednesday', 'saturday']),
            preferredTime: zod_1.z
                .enum(['morning', 'afternoon', 'evening'])
                .default('morning')
        }).optional()
    })
});
// Schéma pour la connexion
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: exports.emailSchema,
        password: zod_1.z
            .string()
            .min(1, 'Le mot de passe est requis')
            .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères')
    })
});
// Schéma pour la mise à jour du profil
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: exports.nameSchema.optional(),
        lastName: exports.nameSchema.optional(),
        height: zod_1.z
            .number()
            .min(100, 'La taille doit être d\'au moins 100cm')
            .max(250, 'La taille ne peut pas dépasser 250cm')
            .optional(),
        currentWeight: zod_1.z
            .number()
            .min(30, 'Le poids doit être d\'au moins 30kg')
            .max(300, 'Le poids ne peut pas dépasser 300kg')
            .optional(),
        targetWeight: zod_1.z
            .number()
            .min(30, 'Le poids cible doit être d\'au moins 30kg')
            .max(300, 'Le poids cible ne peut pas dépasser 300kg')
            .optional(),
        vo2Max: zod_1.z
            .number()
            .min(20, 'VO2 Max doit être d\'au moins 20')
            .max(90, 'VO2 Max ne peut pas dépasser 90')
            .optional(),
        restingHeartRate: zod_1.z
            .number()
            .min(30, 'FC repos doit être d\'au moins 30 bpm')
            .max(120, 'FC repos ne peut pas dépasser 120 bpm')
            .optional(),
        maxHeartRate: zod_1.z
            .number()
            .min(120, 'FC max doit être d\'au moins 120 bpm')
            .max(220, 'FC max ne peut pas dépasser 220 bpm')
            .optional(),
        targetRace: zod_1.z.object({
            type: zod_1.z.enum(['semi-marathon', 'marathon', '10k', '5k']).optional(),
            date: zod_1.z
                .string()
                .datetime('Format de date invalide')
                .refine((date) => new Date(date) > new Date(), 'La date de course doit être dans le futur')
                .optional(),
            targetTime: zod_1.z
                .number()
                .min(600, 'Le temps cible doit être d\'au moins 10 minutes')
                .max(18000, 'Le temps cible ne peut pas dépasser 5 heures')
                .optional()
        }).optional(),
        preferences: zod_1.z.object({
            weeklyWorkouts: zod_1.z
                .number()
                .min(1, 'Au moins 1 entraînement par semaine')
                .max(7, 'Maximum 7 entraînements par semaine')
                .optional(),
            preferredDays: zod_1.z
                .array(zod_1.z.string())
                .min(1, 'Au moins un jour préféré requis')
                .max(7, 'Maximum 7 jours')
                .optional(),
            preferredTime: zod_1.z
                .enum(['morning', 'afternoon', 'evening'])
                .optional()
        }).optional()
    }).refine((data) => Object.keys(data).length > 0, 'Au moins un champ doit être fourni pour la mise à jour')
});
// Schéma pour la validation des paramètres d'URL
exports.userParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, 'ID utilisateur invalide')
    })
});
//# sourceMappingURL=auth.schema.js.map