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

1. Ajoutez un fichier `export.xml` d'exemple dans ce dossier
2. Le parser `parseAppleHealthXML()` l'analysera automatiquement
3. Testez l'import via l'interface web