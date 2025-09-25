import type { WorkoutData } from '../shared/types';

interface AppleHealthRecord {
  type: string;
  sourceName: string;
  startDate: string;
  endDate: string;
  value?: string;
  unit?: string;
}

interface ProcessingProgress {
  processed: number;
  total: number;
  percentage: number;
  currentActivity?: string;
}

// Parser streaming pour gros fichiers XML Apple Health
export class AppleHealthStreamParser {
  private onProgress?: (progress: ProcessingProgress) => void;
  private workouts: Map<string, WorkoutData> = new Map();
  private heartRates: Map<string, number[]> = new Map();
  private currentWorkoutId: string | null = null;

  constructor(onProgress?: (progress: ProcessingProgress) => void) {
    this.onProgress = onProgress;
  }

  async parseChunk(chunk: string, isFirstChunk: boolean, isLastChunk: boolean): Promise<WorkoutData[]> {
    // Pour les très gros fichiers, on traite par chunks
    const records = this.extractRecordsFromChunk(chunk);

    records.forEach(record => {
      if (record.type === 'HKWorkoutActivityType') {
        this.processWorkoutRecord(record);
      } else if (record.type === 'HKQuantityTypeIdentifierHeartRate') {
        this.processHeartRateRecord(record);
      } else if (record.type === 'HKQuantityTypeIdentifierDistanceWalkingRunning') {
        this.processDistanceRecord(record);
      }
    });

    // Ne retourner les workouts que via finalizeWorkouts()
    return [];
  }

  private extractRecordsFromChunk(chunk: string): AppleHealthRecord[] {
    const records: AppleHealthRecord[] = [];

    // Regex améliorée pour capturer tous les attributs des workouts Apple Health
    const workoutRegex = /<Workout\s+([^>]*?)>/g;
    const recordRegex = /<Record\s+[^>]*type="([^"]+)"[^>]*startDate="([^"]+)"[^>]*endDate="([^"]+)"[^>]*value="([^"]+)"[^>]*>/g;

    let match;
    // Extraire les workouts avec toutes leurs données
    while ((match = workoutRegex.exec(chunk)) !== null) {
      const workoutAttributes = match[1];

      // Extraction plus robuste des attributs
      const activityMatch = workoutAttributes.match(/workoutActivityType="([^"]+)"/);
      const startDateMatch = workoutAttributes.match(/startDate="([^"]+)"/);
      const endDateMatch = workoutAttributes.match(/endDate="([^"]+)"/);
      const distanceMatch = workoutAttributes.match(/totalDistance="([^"]+)"/);
      const caloriesMatch = workoutAttributes.match(/totalEnergyBurned="([^"]+)"/);
      const durationMatch = workoutAttributes.match(/duration="([^"]+)"/);
      const distanceUnitMatch = workoutAttributes.match(/totalDistanceUnit="([^"]+)"/);

      if (!activityMatch || !startDateMatch || !endDateMatch) continue;

      let distance = 0;
      if (distanceMatch) {
        distance = parseFloat(distanceMatch[1]);
        // Convertir en km si l'unité est en mètres
        if (distanceUnitMatch && distanceUnitMatch[1] === 'm') {
          distance = distance / 1000;
        } else if (distanceUnitMatch && distanceUnitMatch[1] === 'mi') {
          distance = distance * 1.60934; // miles vers km
        }
      }

      const workoutData = {
        type: 'HKWorkoutActivityType',
        sourceName: activityMatch[1],
        startDate: startDateMatch[1],
        endDate: endDateMatch[1],
        distance: distance,
        calories: caloriesMatch ? parseFloat(caloriesMatch[1]) : 0,
        duration: durationMatch ? parseFloat(durationMatch[1]) : 0
      };

      console.log('Extracted workout data:', workoutData);

      records.push({
        type: 'HKWorkoutActivityType',
        sourceName: activityMatch[1],
        startDate: startDateMatch[1],
        endDate: endDateMatch[1],
        value: distance > 0 ? distance.toString() : (workoutData.duration || '0').toString(),
        unit: distance > 0 ? 'km' : 'min'
      });
    }

    // Extraire les records (fréquence cardiaque, distance, etc.)
    while ((match = recordRegex.exec(chunk)) !== null) {
      records.push({
        type: match[1],
        sourceName: '',
        startDate: match[2],
        endDate: match[3],
        value: match[4]
      });
    }

    return records;
  }

  private processWorkoutRecord(record: AppleHealthRecord) {
    console.log('Processing workout record:', record);

    const activityMap: { [key: string]: string } = {
      'HKWorkoutActivityTypeRunning': 'running',
      'HKWorkoutActivityTypeWalking': 'walking',
      'HKWorkoutActivityTypeCycling': 'cycling',
      'HKWorkoutActivityTypeHiking': 'hiking',
      'HKWorkoutActivityTypeHighIntensityIntervalTraining': 'interval'
    };

    const activityType = activityMap[record.sourceName] || 'running';

    // Inclure plus d'activités
    if (['running', 'walking', 'interval'].includes(activityType)) {
      const startDate = new Date(record.startDate);
      const endDate = new Date(record.endDate);
      const duration = Math.round((endDate.getTime() - startDate.getTime()) / 1000); // en secondes

      const workoutId = `ah_${startDate.getTime()}`;

      // Extraire la distance directement depuis la valeur (plus fiable)
      let distance = 0;
      if (record.value && record.unit === 'km') {
        distance = parseFloat(record.value);
      } else if (record.value && record.unit === 'min') {
        // Si pas de distance dans le record, on essaiera de l'ajouter via processDistanceRecord
        distance = 0;
      }

      const workout: WorkoutData = {
        id: workoutId,
        date: startDate.toISOString().split('T')[0],
        distance: distance,
        duration,
        pace: '0:00',
        type: activityType as 'running' | 'interval' | 'trail' | 'race',
        notes: `Apple Health - ${activityType}`,
        heartRate: undefined,
        elevation: undefined,
        cadence: undefined,
        weather: undefined,
        splits: []
      };

      // Calculer la pace si on a distance et durée
      if (workout.distance > 0 && workout.duration > 0) {
        const paceSeconds = workout.duration / workout.distance;
        const paceMin = Math.floor(paceSeconds / 60);
        const paceSec = Math.round(paceSeconds % 60);
        workout.pace = `${paceMin}:${paceSec.toString().padStart(2, '0')}`;
      } else {
        // Pace par défaut si pas de distance
        workout.pace = '0:00';
      }

      this.workouts.set(workoutId, workout);
      this.currentWorkoutId = workoutId;

      console.log('Created workout:', workout);
    }
  }

  private processHeartRateRecord(record: AppleHealthRecord) {
    if (!record.value) return;

    const date = new Date(record.startDate);
    const dateKey = date.toISOString().split('T')[0];

    if (!this.heartRates.has(dateKey)) {
      this.heartRates.set(dateKey, []);
    }

    this.heartRates.get(dateKey)?.push(parseFloat(record.value));
  }

  private processDistanceRecord(record: AppleHealthRecord) {
    if (!record.value) return;

    // Trouver le workout le plus proche dans le temps
    const recordDate = new Date(record.startDate);
    let bestWorkoutId = null;
    let closestTimeDiff = Infinity;

    for (const [workoutId, workout] of this.workouts) {
      const workoutDate = new Date(workout.date);
      const timeDiff = Math.abs(recordDate.getTime() - workoutDate.getTime());

      if (timeDiff < closestTimeDiff && timeDiff < 3600000) { // Dans l'heure
        closestTimeDiff = timeDiff;
        bestWorkoutId = workoutId;
      }
    }

    const workout = bestWorkoutId ? this.workouts.get(bestWorkoutId) : null;
    if (workout) {
      let distanceToAdd = parseFloat(record.value);

      // Conversion d'unités si nécessaire
      if (distanceToAdd > 100) { // Probablement en mètres
        distanceToAdd = distanceToAdd / 1000;
      }

      // Ajouter ou remplacer la distance
      if (workout.distance === 0) {
        workout.distance = distanceToAdd;
      } else {
        workout.distance = Math.max(workout.distance, distanceToAdd);
      }

      // Recalculer la pace
      if (workout.distance > 0 && workout.duration > 0) {
        const paceSeconds = workout.duration / workout.distance;
        const paceMin = Math.floor(paceSeconds / 60);
        const paceSec = Math.round(paceSeconds % 60);
        workout.pace = `${paceMin}:${paceSec.toString().padStart(2, '0')}`;
      }

      console.log(`Updated workout ${bestWorkoutId} with distance: ${workout.distance}km, pace: ${workout.pace}`);
    }
  }

  // Finaliser les workouts avec les données de fréquence cardiaque
  finalizeWorkouts(): WorkoutData[] {
    const finalWorkouts = Array.from(this.workouts.values());

    console.log(`Finalizing ${finalWorkouts.length} workouts`);

    finalWorkouts.forEach(workout => {
      const dateKey = workout.date;
      const heartRates = this.heartRates.get(dateKey);

      if (heartRates && heartRates.length > 0) {
        workout.heartRate = Math.round(
          heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length
        );
      }

      // Estimation de distance si manquante pour des activités comme la course
      if (workout.distance === 0 && workout.duration > 0 && ['running', 'walking'].includes(workout.type)) {
        // Estimation basique : marche = 5km/h, course = 10km/h
        const estimatedSpeed = workout.type === 'walking' ? 5 : 10; // km/h
        const estimatedDistance = (estimatedSpeed * workout.duration) / 3600; // conversion heures

        if (estimatedDistance > 0.1) { // Au moins 100m
          workout.distance = Math.round(estimatedDistance * 100) / 100; // Arrondi à 2 décimales
          workout.notes = `${workout.notes} (distance estimée)`;

          // Recalculer la pace avec la distance estimée
          const paceSeconds = workout.duration / workout.distance;
          const paceMin = Math.floor(paceSeconds / 60);
          const paceSec = Math.round(paceSeconds % 60);
          workout.pace = `${paceMin}:${paceSec.toString().padStart(2, '0')}`;

          console.log(`Estimated distance for workout ${workout.id}: ${workout.distance}km`);
        }
      }
    });

    // Filtrer par durée (plus de 30 secondes) et garder ceux avec distance > 0 OU durée significative
    const filteredWorkouts = finalWorkouts.filter(w =>
      w.duration > 30 && (w.distance > 0 || w.duration > 300) // Plus de 5 minutes même sans distance
    );

    console.log(`Returning ${filteredWorkouts.length} workouts after filtering`);
    console.log('Workouts summary:', filteredWorkouts.map(w => ({
      id: w.id,
      date: w.date,
      type: w.type,
      distance: w.distance,
      duration: w.duration,
      pace: w.pace
    })));

    return filteredWorkouts;
  }
}

// Fonction pour traiter les gros fichiers en chunks
export async function parseAppleHealthLargeFile(
  file: File,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<WorkoutData[]> {
  return new Promise((resolve, reject) => {
    const parser = new AppleHealthStreamParser(onProgress);
    const reader = new FileReader();
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
    let offset = 0;
    let allWorkouts: WorkoutData[] = [];
    let buffer = '';

    const readChunk = () => {
      const slice = file.slice(offset, offset + CHUNK_SIZE);
      reader.readAsText(slice);
    };

    reader.onload = (e) => {
      if (!e.target?.result) return;

      const chunk = e.target.result as string;
      buffer += chunk;

      // Chercher des balises complètes dans le buffer
      const lastCompleteTag = buffer.lastIndexOf('>');
      if (lastCompleteTag !== -1) {
        const completeChunk = buffer.substring(0, lastCompleteTag + 1);
        buffer = buffer.substring(lastCompleteTag + 1);

        // Traiter le chunk complet
        parser.parseChunk(
          completeChunk,
          offset === 0,
          offset + CHUNK_SIZE >= file.size
        ).then(workouts => {
          if (workouts.length > 0) {
            allWorkouts.push(...workouts);
          }
        });
      }

      offset += CHUNK_SIZE;

      if (onProgress) {
        onProgress({
          processed: offset,
          total: file.size,
          percentage: Math.min(100, Math.round((offset / file.size) * 100)),
          currentActivity: 'Traitement des entraînements...'
        });
      }

      if (offset < file.size) {
        readChunk();
      } else {
        // Traiter le buffer restant
        if (buffer.length > 0) {
          parser.parseChunk(buffer, false, true).then(workouts => {
            if (workouts.length > 0) {
              allWorkouts.push(...workouts);
            }
            const finalWorkouts = parser.finalizeWorkouts();
            resolve(finalWorkouts);
          });
        } else {
          const finalWorkouts = parser.finalizeWorkouts();
          resolve(finalWorkouts);
        }
      }
    };

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };

    readChunk();
  });
}

// Parser optimisé pour ZIP Apple Health
export async function parseAppleHealthZip(
  file: File,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<WorkoutData[]> {
  const JSZip = (await import('jszip')).default;

  try {
    const zip = new JSZip();

    // Charger le ZIP avec options optimisées
    const loadedZip = await zip.loadAsync(file, {
      // Options pour optimiser la mémoire
      createFolders: false,
      // Ne pas charger tout en mémoire
      optimizedBinaryString: true
    });

    // Chercher le fichier export.xml
    const exportFile = loadedZip.file(/export\.xml$/i)[0];

    if (!exportFile) {
      throw new Error('Fichier export.xml non trouvé dans le ZIP');
    }

    // Extraire et parser le fichier XML par streaming
    const xmlBlob = await exportFile.async('blob');
    const xmlFile = new File([xmlBlob], 'export.xml', { type: 'text/xml' });

    // Parser d'abord les workouts
    const workouts = await parseAppleHealthLargeFile(xmlFile, onProgress);

    // Enrichir avec les données GPX des routes s'il y en a
    const routeFiles = loadedZip.file(/workout-routes\/.*\.gpx$/i);

    if (routeFiles.length > 0 && onProgress) {
      onProgress({
        processed: 80,
        total: 100,
        percentage: 80,
        currentActivity: `Traitement de ${routeFiles.length} routes GPS...`
      });
    }

    // Enrichir les workouts avec les données GPX
    const enrichedWorkouts = await enrichWorkoutsWithGPXData(workouts, routeFiles);

    if (onProgress) {
      onProgress({
        processed: 100,
        total: 100,
        percentage: 100,
        currentActivity: 'Finalisation...'
      });
    }

    return enrichedWorkouts;

  } catch (error) {
    console.error('Erreur lors du parsing du ZIP Apple Health:', error);
    throw new Error(`Impossible de traiter le fichier ZIP: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

// Enrichir les workouts avec les données GPX
async function enrichWorkoutsWithGPXData(
  workouts: WorkoutData[],
  routeFiles: any[]
): Promise<WorkoutData[]> {
  const routesData = new Map<string, any>();

  // Parser tous les fichiers GPX
  for (const routeFile of routeFiles) {
    try {
      const gpxContent = await routeFile.async('text');
      const routeData = parseGPXContent(gpxContent);

      // Extraire la date du nom du fichier
      const filename = routeFile.name;
      const dateMatch = filename.match(/route_(\d{4}-\d{2}-\d{2})/);

      if (dateMatch && routeData) {
        const routeDate = dateMatch[1];
        routesData.set(routeDate, routeData);
      }
    } catch (error) {
      console.warn(`Erreur lors du parsing de la route ${routeFile.name}:`, error);
    }
  }

  // Enrichir les workouts avec les données de routes
  return workouts.map(workout => {
    const routeData = routesData.get(workout.date);

    if (routeData) {
      return {
        ...workout,
        elevation: {
          gain: routeData.elevationGain || 0,
          loss: routeData.elevationLoss || 0,
          max: routeData.maxElevation || 0,
          min: routeData.minElevation || 0
        },
        // Ajouter distance depuis GPX si plus précise
        distance: routeData.distance > 0 ? routeData.distance : workout.distance
      };
    }

    return workout;
  });
}

// Parser simple pour GPX
function parseGPXContent(gpxContent: string) {
  try {
    // Extraction simple des données GPX
    const elevations: number[] = [];
    const distances: number[] = [];

    // Extraire les élévations
    const eleMatches = gpxContent.match(/<ele>([^<]+)<\/ele>/g);
    if (eleMatches) {
      eleMatches.forEach(match => {
        const ele = parseFloat(match.replace(/<\/?ele>/g, ''));
        if (!isNaN(ele)) elevations.push(ele);
      });
    }

    // Calculer les statistiques d'élévation
    let elevationGain = 0;
    let elevationLoss = 0;

    for (let i = 1; i < elevations.length; i++) {
      const diff = elevations[i] - elevations[i - 1];
      if (diff > 0) elevationGain += diff;
      else elevationLoss += Math.abs(diff);
    }

    return {
      elevationGain: Math.round(elevationGain),
      elevationLoss: Math.round(elevationLoss),
      maxElevation: elevations.length > 0 ? Math.max(...elevations) : 0,
      minElevation: elevations.length > 0 ? Math.min(...elevations) : 0,
      distance: 0 // Distance calculée depuis les coordonnées si nécessaire
    };
  } catch (error) {
    console.warn('Erreur parsing GPX:', error);
    return null;
  }
}