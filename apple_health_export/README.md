# Apple Health Export Structure

Ce dossier contient des exemples de la structure des exports Apple Health pour comprendre et tester l'importation.

## Structure typique d'un export Apple Health :

```
export.zip
├── export.xml              # Fichier principal avec toutes les données de santé
├── export_cda.xml          # Données médicales au format CDA (optionnel)
├── electrocardiograms/     # Dossier avec les ECG (optionnel)
└── workout-routes/         # Dossier avec les fichiers GPX des parcours
    ├── route_2023-01-15_12-30-45_1.gpx
    ├── route_2023-01-16_08-15-22_2.gpx
    └── ...
```

## Fichier export.xml

Le fichier principal contient :
- Éléments `<Workout>` avec les données d'entraînement
- Métadonnées de santé (fréquence cardiaque, calories, etc.)
- Parcours et données GPS (si disponibles)

## Attributs des éléments Workout :

- `workoutActivityType` : Type d'activité (ex: "HKWorkoutActivityTypeRunning")
- `startDate` : Date/heure de début
- `endDate` : Date/heure de fin
- `duration` : Durée en minutes
- `totalDistance` : Distance totale en kilomètres
- `totalEnergyBurned` : Calories brûlées

## Pour tester :

1. **Fichier XML seul** : Uploadez `export_sample.xml` directement
2. **ZIP complet** : Uploadez `apple_health_export_example.zip` (contient XML + GPX)
3. **Fichiers GPX seuls** : Uploadez les fichiers du dossier `workout-routes/`

## Fonctionnalités implémentées :

### 📁 **Support ZIP Apple Health** :
- Détection automatique des exports Apple Health
- Traitement du fichier `export.xml` principal
- Extraction des fichiers GPX dans `workout-routes/`
- Fusion intelligente des données XML + GPX

### 🔄 **Enrichissement des données** :
- **Données de base** : Extraites du fichier `export.xml`
- **Fréquence cardiaque** : Calculée depuis les records
- **Données GPS précises** : Enrichies depuis les fichiers GPX
- **Distance/Pace optimisés** : Recalculés depuis les données GPS

### ✅ **Résultat attendu** :
Quand vous importez le ZIP, vous obtenez des workouts avec :

**📊 Données de base** :
- Date, durée, distance, pace, calories
- Fréquence cardiaque moyenne

**🌤️ Données météo** :
- Conditions météo (Clear, Rain, Snow, etc.)
- Température en Celsius
- Humidité en %

**🏃 Données performance** :
- Cadence (pas/minute calculés depuis StepCount)
- Puissance de course (watts)
- Source (Apple Watch, Strava, etc.)

**🏔️ Données GPS/altitude** :
- Dénivelé positif et négatif (m)
- Altitude min/max (m)
- Distance/pace recalculés avec précision GPS

**🔧 Données techniques** :
- Informations device/version
- Enrichissement automatique XML + GPX

### 📈 **Utilisation dans l'application** :
Toutes ces données sont automatiquement :
- ✅ Intégrées dans les statistiques utilisateur
- ✅ Disponibles pour les analyses IA
- ✅ Affichées dans l'interface (si implémentée)
- ✅ Utilisées pour le suivi des performances