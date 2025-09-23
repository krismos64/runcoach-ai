import { z } from 'zod';

// Schémas de base réutilisables
export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
  );

export const emailSchema = z
  .string()
  .email('Format d\'email invalide')
  .max(255, 'L\'email ne peut pas dépasser 255 caractères')
  .transform(email => email.toLowerCase().trim());

export const nameSchema = z
  .string()
  .min(1, 'Ce champ est requis')
  .max(50, 'Ne peut pas dépasser 50 caractères')
  .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, 'Seules les lettres, espaces, tirets et apostrophes sont autorisés')
  .transform(name => name.trim());

// Schéma pour l'inscription
export const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    firstName: nameSchema,
    lastName: nameSchema,
    dateOfBirth: z
      .string()
      .datetime('Format de date invalide')
      .refine(
        (date) => {
          const birthDate = new Date(date);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          return age >= 13 && age <= 120;
        },
        'L\'âge doit être entre 13 et 120 ans'
      ),
    height: z
      .number()
      .min(100, 'La taille doit être d\'au moins 100cm')
      .max(250, 'La taille ne peut pas dépasser 250cm'),
    currentWeight: z
      .number()
      .min(30, 'Le poids doit être d\'au moins 30kg')
      .max(300, 'Le poids ne peut pas dépasser 300kg'),
    targetWeight: z
      .number()
      .min(30, 'Le poids cible doit être d\'au moins 30kg')
      .max(300, 'Le poids cible ne peut pas dépasser 300kg'),
    biologicalSex: z.enum(['male', 'female'], {
      message: 'Le sexe biologique doit être "male" ou "female"'
    }),
    targetRace: z.object({
      type: z.enum(['semi-marathon', 'marathon', '10k', '5k'], {
        message: 'Type de course invalide'
      }),
      date: z
        .string()
        .datetime('Format de date invalide')
        .refine(
          (date) => new Date(date) > new Date(),
          'La date de course doit être dans le futur'
        ),
      targetTime: z
        .number()
        .min(600, 'Le temps cible doit être d\'au moins 10 minutes')
        .max(18000, 'Le temps cible ne peut pas dépasser 5 heures')
        .optional()
    }),
    preferences: z.object({
      weeklyWorkouts: z
        .number()
        .min(1, 'Au moins 1 entraînement par semaine')
        .max(7, 'Maximum 7 entraînements par semaine')
        .default(3),
      preferredDays: z
        .array(z.string())
        .min(1, 'Au moins un jour préféré requis')
        .max(7, 'Maximum 7 jours')
        .default(['monday', 'wednesday', 'saturday']),
      preferredTime: z
        .enum(['morning', 'afternoon', 'evening'])
        .default('morning')
    }).optional()
  })
});

// Schéma pour la connexion
export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z
      .string()
      .min(1, 'Le mot de passe est requis')
      .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères')
  })
});

// Schéma pour la mise à jour du profil
export const updateProfileSchema = z.object({
  body: z.object({
    firstName: nameSchema.optional(),
    lastName: nameSchema.optional(),
    height: z
      .number()
      .min(100, 'La taille doit être d\'au moins 100cm')
      .max(250, 'La taille ne peut pas dépasser 250cm')
      .optional(),
    currentWeight: z
      .number()
      .min(30, 'Le poids doit être d\'au moins 30kg')
      .max(300, 'Le poids ne peut pas dépasser 300kg')
      .optional(),
    targetWeight: z
      .number()
      .min(30, 'Le poids cible doit être d\'au moins 30kg')
      .max(300, 'Le poids cible ne peut pas dépasser 300kg')
      .optional(),
    vo2Max: z
      .number()
      .min(20, 'VO2 Max doit être d\'au moins 20')
      .max(90, 'VO2 Max ne peut pas dépasser 90')
      .optional(),
    restingHeartRate: z
      .number()
      .min(30, 'FC repos doit être d\'au moins 30 bpm')
      .max(120, 'FC repos ne peut pas dépasser 120 bpm')
      .optional(),
    maxHeartRate: z
      .number()
      .min(120, 'FC max doit être d\'au moins 120 bpm')
      .max(220, 'FC max ne peut pas dépasser 220 bpm')
      .optional(),
    targetRace: z.object({
      type: z.enum(['semi-marathon', 'marathon', '10k', '5k']).optional(),
      date: z
        .string()
        .datetime('Format de date invalide')
        .refine(
          (date) => new Date(date) > new Date(),
          'La date de course doit être dans le futur'
        )
        .optional(),
      targetTime: z
        .number()
        .min(600, 'Le temps cible doit être d\'au moins 10 minutes')
        .max(18000, 'Le temps cible ne peut pas dépasser 5 heures')
        .optional()
    }).optional(),
    preferences: z.object({
      weeklyWorkouts: z
        .number()
        .min(1, 'Au moins 1 entraînement par semaine')
        .max(7, 'Maximum 7 entraînements par semaine')
        .optional(),
      preferredDays: z
        .array(z.string())
        .min(1, 'Au moins un jour préféré requis')
        .max(7, 'Maximum 7 jours')
        .optional(),
      preferredTime: z
        .enum(['morning', 'afternoon', 'evening'])
        .optional()
    }).optional()
  }).refine(
    (data) => Object.keys(data).length > 0,
    'Au moins un champ doit être fourni pour la mise à jour'
  )
});

// Schéma pour la validation des paramètres d'URL
export const userParamsSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'ID utilisateur invalide')
  })
});

// Types TypeScript extraits des schémas
export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;
export type UserParamsRequest = z.infer<typeof userParamsSchema>;