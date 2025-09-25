import React, { useState, useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import type { WorkoutData } from '../contexts/DataContext';
import JSZip from 'jszip';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Download,
  Smartphone,
  Watch,
  RefreshCw,
  Play,
  Activity,
  Heart,
  Sparkles,
  Zap,
  Brain,
  Shield
} from 'lucide-react';

interface ImportFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  progress: number;
  file?: File; // Ajout du fichier réel
  data?: {
    workouts: number;
    distance: number;
    duration: number;
    startDate: string;
    endDate: string;
  };
  error?: string;
}

interface DataSource {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  supported: boolean;
  fileTypes: string[];
}

// Fonctions de parsing des fichiers
const parseGPXFile = (xmlContent: string): WorkoutData[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
  const workouts: WorkoutData[] = [];

  const tracks = xmlDoc.getElementsByTagName('trk');

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    const segments = track.getElementsByTagName('trkseg');

    for (let j = 0; j < segments.length; j++) {
      const points = segments[j].getElementsByTagName('trkpt');

      if (points.length === 0) continue;

      const firstPoint = points[0];
      const lastPoint = points[points.length - 1];

      const startTime = firstPoint.getElementsByTagName('time')[0]?.textContent;
      const endTime = lastPoint.getElementsByTagName('time')[0]?.textContent;

      if (!startTime || !endTime) continue;

      const start = new Date(startTime);
      const end = new Date(endTime);
      const duration = Math.round((end.getTime() - start.getTime()) / 1000 / 60); // en minutes

      // Calcul de la distance
      let totalDistance = 0;
      for (let k = 1; k < points.length; k++) {
        const prevPoint = points[k - 1];
        const currPoint = points[k];

        const lat1 = parseFloat(prevPoint.getAttribute('lat') || '0');
        const lon1 = parseFloat(prevPoint.getAttribute('lon') || '0');
        const lat2 = parseFloat(currPoint.getAttribute('lat') || '0');
        const lon2 = parseFloat(currPoint.getAttribute('lon') || '0');

        // Formule de Haversine pour calculer la distance
        const R = 6371; // Rayon de la Terre en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        totalDistance += R * c;
      }

      // Calcul de la pace (min/km)
      const paceMinPerKm = duration / totalDistance;
      const paceMin = Math.floor(paceMinPerKm);
      const paceSec = Math.round((paceMinPerKm - paceMin) * 60);
      const pace = `${paceMin}:${paceSec.toString().padStart(2, '0')}`;

      const workout: WorkoutData = {
        id: `gpx_${Date.now()}_${i}_${j}`,
        date: start.toISOString().split('T')[0],
        type: 'course',
        duration,
        distance: Math.round(totalDistance * 100) / 100,
        pace,
        notes: `Importé depuis GPX - ${track.getElementsByTagName('name')[0]?.textContent || 'Entraînement'}`
      };

      workouts.push(workout);
    }
  }

  return workouts;
};

const parseTCXFile = (xmlContent: string): WorkoutData[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
  const workouts: WorkoutData[] = [];

  const activities = xmlDoc.getElementsByTagName('Activity');

  for (let i = 0; i < activities.length; i++) {
    const activity = activities[i];
    const laps = activity.getElementsByTagName('Lap');

    for (let j = 0; j < laps.length; j++) {
      const lap = laps[j];
      const startTimeAttr = lap.getAttribute('StartTime');

      if (!startTimeAttr) continue;

      const startTime = new Date(startTimeAttr);
      const totalTimeSeconds = parseFloat(lap.getElementsByTagName('TotalTimeSeconds')[0]?.textContent || '0');
      const distanceMeters = parseFloat(lap.getElementsByTagName('DistanceMeters')[0]?.textContent || '0');
      const avgHeartRate = parseFloat(lap.getElementsByTagName('AverageHeartRateBpm')[0]?.getElementsByTagName('Value')[0]?.textContent || '0');
      const calories = parseFloat(lap.getElementsByTagName('Calories')[0]?.textContent || '0');

      const duration = Math.round(totalTimeSeconds / 60); // en minutes
      const distance = Math.round(distanceMeters / 10) / 100; // en km

      // Calcul de la pace
      const paceMinPerKm = duration / distance;
      const paceMin = Math.floor(paceMinPerKm);
      const paceSec = Math.round((paceMinPerKm - paceMin) * 60);
      const pace = `${paceMin}:${paceSec.toString().padStart(2, '0')}`;

      const sport = activity.getAttribute('Sport') || 'Running';
      let type: WorkoutData['type'] = 'course';
      if (sport.toLowerCase().includes('bike')) type = 'endurance';

      const workout: WorkoutData = {
        id: `tcx_${Date.now()}_${i}_${j}`,
        date: startTime.toISOString().split('T')[0],
        type,
        duration,
        distance,
        pace,
        heartRate: avgHeartRate > 0 ? Math.round(avgHeartRate) : undefined,
        calories: calories > 0 ? Math.round(calories) : undefined,
        notes: `Importé depuis TCX - ${sport}`
      };

      workouts.push(workout);
    }
  }

  return workouts;
};

const parseCSVFile = (csvContent: string): WorkoutData[] => {
  const lines = csvContent.split('\n');
  const workouts: WorkoutData[] = [];

  if (lines.length < 2) return workouts;

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length < headers.length) continue;

    const data: any = {};
    headers.forEach((header, index) => {
      data[header] = values[index]?.trim();
    });

    // Mapping flexible des colonnes
    const date = data['date'] || data['workout_date'] || data['start_date'];
    const distance = parseFloat(data['distance'] || data['distance_km'] || data['distance_miles'] || '0');
    const duration = parseFloat(data['duration'] || data['time'] || data['duration_minutes'] || '0');
    const pace = data['pace'] || data['avg_pace'];
    const type = data['type'] || data['workout_type'] || data['activity_type'] || 'course';
    const heartRate = parseFloat(data['heart_rate'] || data['avg_hr'] || data['avg_heart_rate'] || '0');
    const calories = parseFloat(data['calories'] || data['kcal'] || '0');

    if (!date || distance <= 0 || duration <= 0) continue;

    // Calcul de la pace si pas fournie
    let finalPace = pace;
    if (!finalPace && distance > 0 && duration > 0) {
      const paceMinPerKm = duration / distance;
      const paceMin = Math.floor(paceMinPerKm);
      const paceSec = Math.round((paceMinPerKm - paceMin) * 60);
      finalPace = `${paceMin}:${paceSec.toString().padStart(2, '0')}`;
    }

    // Mapping du type d'entraînement
    let workoutType: WorkoutData['type'] = 'course';
    const typeStr = type.toLowerCase();
    if (typeStr.includes('interval') || typeStr.includes('fraction')) workoutType = 'fractionné';
    else if (typeStr.includes('endurance') || typeStr.includes('long')) workoutType = 'endurance';
    else if (typeStr.includes('recovery') || typeStr.includes('récup')) workoutType = 'récupération';

    const workout: WorkoutData = {
      id: `csv_${Date.now()}_${i}`,
      date: new Date(date).toISOString().split('T')[0],
      type: workoutType,
      duration: Math.round(duration),
      distance: Math.round(distance * 100) / 100,
      pace: finalPace || '0:00',
      heartRate: heartRate > 0 ? Math.round(heartRate) : undefined,
      calories: calories > 0 ? Math.round(calories) : undefined,
      notes: 'Importé depuis CSV'
    };

    workouts.push(workout);
  }

  return workouts;
};

const parseAppleHealthXML = (xmlContent: string): WorkoutData[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
  const workouts: WorkoutData[] = [];

  // Récupérer toutes les données de fréquence cardiaque
  const heartRateRecords = xmlDoc.getElementsByTagName('Record');
  const heartRateData: { startDate: Date; endDate: Date; value: number }[] = [];

  for (let i = 0; i < heartRateRecords.length; i++) {
    const record = heartRateRecords[i];
    if (record.getAttribute('type') === 'HKQuantityTypeIdentifierHeartRate') {
      const startDate = record.getAttribute('startDate');
      const endDate = record.getAttribute('endDate');
      const value = parseFloat(record.getAttribute('value') || '0');

      if (startDate && endDate && value > 0) {
        heartRateData.push({
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          value: value
        });
      }
    }
  }

  // Récupérer les séances d'entraînement dans Apple Health
  const workoutElements = xmlDoc.getElementsByTagName('Workout');

  for (let i = 0; i < workoutElements.length; i++) {
    const workout = workoutElements[i];

    // Extraire les attributs de base
    const workoutType = workout.getAttribute('workoutActivityType') || '';
    const startDate = workout.getAttribute('startDate') || '';
    const endDate = workout.getAttribute('endDate') || '';
    const duration = parseFloat(workout.getAttribute('duration') || '0'); // en minutes
    const totalDistance = parseFloat(workout.getAttribute('totalDistance') || '0'); // en km
    const totalEnergyBurned = parseFloat(workout.getAttribute('totalEnergyBurned') || '0'); // calories

    // Filtrer seulement les activités de course
    if (!workoutType.toLowerCase().includes('running') && !workoutType.toLowerCase().includes('walking')) {
      continue;
    }

    if (!startDate || duration <= 0) continue;

    // Calculer la pace si on a la distance
    let pace = '0:00';
    if (totalDistance > 0) {
      const paceMinPerKm = duration / totalDistance;
      const paceMin = Math.floor(paceMinPerKm);
      const paceSec = Math.round((paceMinPerKm - paceMin) * 60);
      pace = `${paceMin}:${paceSec.toString().padStart(2, '0')}`;
    }

    // Déterminer le type d'entraînement
    let type: WorkoutData['type'] = 'course';
    if (workoutType.toLowerCase().includes('walking')) type = 'récupération';

    // Calculer la fréquence cardiaque moyenne pendant ce workout
    let avgHeartRate: number | undefined;
    const workoutStartDate = new Date(startDate);
    const workoutEndDate = new Date(endDate);

    // Filtrer les données FC qui correspondent à cette séance
    const workoutHeartRates = heartRateData.filter(hr =>
      hr.startDate >= workoutStartDate && hr.endDate <= workoutEndDate
    );

    if (workoutHeartRates.length > 0) {
      const totalHeartRate = workoutHeartRates.reduce((sum, hr) => sum + hr.value, 0);
      avgHeartRate = Math.round(totalHeartRate / workoutHeartRates.length);
    }

    const workoutData: WorkoutData = {
      id: `apple_health_${Date.now()}_${i}`,
      date: new Date(startDate).toISOString().split('T')[0],
      type,
      duration: Math.round(duration),
      distance: Math.round(totalDistance * 100) / 100,
      pace,
      heartRate: avgHeartRate,
      calories: totalEnergyBurned > 0 ? Math.round(totalEnergyBurned) : undefined,
      notes: `Importé depuis Apple Health - ${workoutType}`
    };

    workouts.push(workoutData);
  }

  return workouts;
};

const parseZIPFile = async (file: File): Promise<WorkoutData[]> => {
  const workouts: WorkoutData[] = [];

  try {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);

    // Détecter si c'est un export Apple Health
    const isAppleHealthExport = Object.keys(zipContent.files).some(filename =>
      filename === 'export.xml' || zipContent.files[filename].name.includes('workout-routes/')
    );

    let appleHealthWorkouts: WorkoutData[] = [];

    // Parcourir tous les fichiers dans le ZIP
    for (const [filename, zipEntry] of Object.entries(zipContent.files)) {
      if (zipEntry.dir) continue; // Ignorer les dossiers

      const fileExtension = filename.split('.').pop()?.toLowerCase();

      // Traiter seulement les fichiers supportés
      if (!['gpx', 'tcx', 'csv', 'xml'].includes(fileExtension || '')) continue;

      try {
        const fileContent = await zipEntry.async('text');
        let fileWorkouts: WorkoutData[] = [];

        // Traitement spécial pour Apple Health
        if (isAppleHealthExport) {
          if (fileExtension === 'xml' && (filename === 'export.xml' || fileContent.includes('<HealthData>'))) {
            // Parser le fichier export.xml principal
            fileWorkouts = parseAppleHealthXML(fileContent);
            appleHealthWorkouts = fileWorkouts; // Stocker pour fusion avec les GPX
          } else if (fileExtension === 'gpx' && filename.startsWith('workout-routes/')) {
            // Parser les fichiers GPX des parcours
            const gpxWorkouts = parseGPXFile(fileContent);

            // Enrichir les données Apple Health avec les données GPX détaillées
            gpxWorkouts.forEach(gpxWorkout => {
              // Chercher le workout Apple Health correspondant par date/heure
              const matchingWorkout = appleHealthWorkouts.find(ahWorkout =>
                ahWorkout.date === gpxWorkout.date &&
                Math.abs(ahWorkout.duration - gpxWorkout.duration) < 5 // Tolérance de 5min
              );

              if (matchingWorkout) {
                // Enrichir avec les données GPS plus précises
                matchingWorkout.distance = gpxWorkout.distance; // GPX souvent plus précis
                matchingWorkout.pace = gpxWorkout.pace; // Recalculé depuis GPX
                matchingWorkout.notes = `${matchingWorkout.notes} - Avec données GPS détaillées`;
              } else {
                // Ajouter comme nouveau workout si pas de correspondance
                gpxWorkout.notes = `${gpxWorkout.notes} - Parcours GPS Apple Health`;
                fileWorkouts.push(gpxWorkout);
              }
            });
          }
        } else {
          // Traitement normal pour les autres ZIP
          switch (fileExtension) {
            case 'gpx':
              fileWorkouts = parseGPXFile(fileContent);
              break;
            case 'tcx':
              fileWorkouts = parseTCXFile(fileContent);
              break;
            case 'csv':
              fileWorkouts = parseCSVFile(fileContent);
              break;
            case 'xml':
              // Tenter de parser comme GPX si ce n'est pas Apple Health
              fileWorkouts = parseGPXFile(fileContent);
              break;
          }
        }

        // Ajouter un préfixe au nom du fichier dans les notes
        fileWorkouts.forEach(workout => {
          if (!workout.notes?.includes('Apple Health')) {
            workout.notes = `${workout.notes} - Fichier: ${filename}`;
          }
          workout.id = `zip_${workout.id}`;
        });

        workouts.push(...fileWorkouts);
      } catch (error) {
        console.warn(`Erreur lors du traitement du fichier ${filename} dans le ZIP:`, error);
        // Continuer avec les autres fichiers
      }
    }

    // Si c'est Apple Health, ajouter les workouts enrichis
    if (isAppleHealthExport && appleHealthWorkouts.length > 0) {
      appleHealthWorkouts.forEach(workout => {
        workout.id = `zip_${workout.id}`;
      });
      // Les workouts Apple Health enrichis sont déjà dans le tableau workouts
    }

  } catch (error) {
    throw new Error(`Erreur lors de l'extraction du fichier ZIP: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }

  return workouts;
};

const ImportData: React.FC = () => {
  const { updateWorkouts, userData } = useData();
  const [files, setFiles] = useState<ImportFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('apple-health');

  const dataSources: DataSource[] = [
    {
      id: 'apple-health',
      name: 'Apple Health',
      icon: Smartphone,
      description: 'Importez vos données d\'entraînement depuis l\'app Santé d\'Apple',
      supported: true,
      fileTypes: ['xml', 'zip']
    },
    {
      id: 'garmin',
      name: 'Garmin Connect',
      icon: Watch,
      description: 'Synchronisez avec votre compte Garmin Connect',
      supported: true,
      fileTypes: ['fit', 'tcx', 'gpx', 'zip']
    },
    {
      id: 'strava',
      name: 'Strava',
      icon: Activity,
      description: 'Importez vos activités depuis Strava',
      supported: true,
      fileTypes: ['gpx', 'tcx', 'fit', 'zip']
    }
  ];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (selectedFiles: File[]) => {
    const newFiles: ImportFile[] = selectedFiles.map((file, index) => ({
      id: Date.now().toString() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0,
      file: file // Stocker le fichier réel
    }));

    setFiles(prev => [...prev, ...newFiles]);
    processFiles(newFiles);
  };

  const processFiles = async (filesToProcess: ImportFile[]) => {
    setIsProcessing(true);

    for (const fileImport of filesToProcess) {
      // Update file status to processing
      setFiles(prev => prev.map(f =>
        f.id === fileImport.id ? { ...f, status: 'processing', progress: 0 } : f
      ));

      try {
        const realFile = fileImport.file;

        if (!realFile) {
          throw new Error('Fichier introuvable');
        }

        // Mise à jour du progress
        setFiles(prev => prev.map(f =>
          f.id === fileImport.id ? { ...f, progress: 25 } : f
        ));

        // Parser selon le type de fichier
        let parsedWorkouts: WorkoutData[] = [];
        const fileExtension = realFile.name.split('.').pop()?.toLowerCase();

        if (fileExtension === 'zip') {
          // Traitement spécial pour les fichiers ZIP
          setFiles(prev => prev.map(f =>
            f.id === fileImport.id ? { ...f, progress: 40 } : f
          ));

          parsedWorkouts = await parseZIPFile(realFile);

          setFiles(prev => prev.map(f =>
            f.id === fileImport.id ? { ...f, progress: 70 } : f
          ));
        } else {
          // Traitement normal pour les autres fichiers
          const fileContent = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string || '');
            reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
            reader.readAsText(realFile);
          });

          setFiles(prev => prev.map(f =>
            f.id === fileImport.id ? { ...f, progress: 50 } : f
          ));

          // Détecter si c'est un export Apple Health
          if (fileExtension === 'xml' && fileContent.includes('<HealthData>')) {
            parsedWorkouts = parseAppleHealthXML(fileContent);
          } else {
            switch (fileExtension) {
              case 'gpx':
                parsedWorkouts = parseGPXFile(fileContent);
                break;
              case 'tcx':
                parsedWorkouts = parseTCXFile(fileContent);
                break;
              case 'csv':
                parsedWorkouts = parseCSVFile(fileContent);
                break;
              case 'xml':
                // Tenter de parser comme GPX si ce n'est pas Apple Health
                parsedWorkouts = parseGPXFile(fileContent);
                break;
              default:
                throw new Error(`Format de fichier non supporté: ${fileExtension}`);
            }
          }
        }

        setFiles(prev => prev.map(f =>
          f.id === fileImport.id ? { ...f, progress: 75 } : f
        ));

        if (parsedWorkouts.length === 0) {
          throw new Error('Aucun entraînement trouvé dans le fichier');
        }

        // Ajouter les workouts au DataContext
        const currentWorkouts = userData.workouts || [];
        const newWorkouts = [...currentWorkouts, ...parsedWorkouts];

        console.log('Import Debug:', {
          currentWorkoutsCount: currentWorkouts.length,
          parsedWorkoutsCount: parsedWorkouts.length,
          newWorkoutsCount: newWorkouts.length,
          sampleParsedWorkout: parsedWorkouts[0]
        });

        updateWorkouts(newWorkouts);

        // Calculer les statistiques pour l'affichage
        const totalDistance = parsedWorkouts.reduce((sum, w) => sum + w.distance, 0);
        const totalDuration = parsedWorkouts.reduce((sum, w) => sum + w.duration, 0);

        const dates = parsedWorkouts.map(w => new Date(w.date)).sort((a, b) => a.getTime() - b.getTime());
        const startDate = dates[0]?.toISOString().split('T')[0] || '';
        const endDate = dates[dates.length - 1]?.toISOString().split('T')[0] || '';

        const importData = {
          workouts: parsedWorkouts.length,
          distance: Math.round(totalDistance * 100) / 100,
          duration: totalDuration,
          startDate,
          endDate
        };

        setFiles(prev => prev.map(f =>
          f.id === fileImport.id ? {
            ...f,
            status: 'success',
            progress: 100,
            data: importData
          } : f
        ));

      } catch (error) {
        console.error('Erreur lors du traitement du fichier:', error);
        setFiles(prev => prev.map(f =>
          f.id === fileImport.id ? {
            ...f,
            status: 'error',
            progress: 0,
            error: error instanceof Error ? error.message : 'Erreur inconnue lors du traitement'
          } : f
        ));
      }

      // Petit délai pour voir les changements de progress
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsProcessing(false);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const retryFile = (fileId: string) => {
    const fileToRetry = files.find(f => f.id === fileId);
    if (fileToRetry) {
      processFiles([fileToRetry]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-emerald-500 animate-spin" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const successfulFiles = files.filter(f => f.status === 'success');
  const totalWorkouts = successfulFiles.reduce((sum, f) => sum + (f.data?.workouts || 0), 0);
  const totalDistance = successfulFiles.reduce((sum, f) => sum + (f.data?.distance || 0), 0);

  return (
    <>
      <Helmet>
        <title>Importer des données | RunCoach AI</title>
        <meta name="description" content="Importez vos données d'entraînement depuis Apple Health, Garmin, Strava et autres sources compatibles" />
        <meta property="og:title" content="Import de données RunCoach AI" />
        <meta property="og:description" content="Synchronisez facilement vos données d'entraînement de course à pied" />
        <link rel="canonical" href="/import" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-800 text-white relative overflow-hidden space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 pt-8"
        >
          <div className="relative">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/25"
            >
              <Upload className="w-8 h-8 text-white" />
            </motion.div>

            <motion.div
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-3 h-3 text-white" />
            </motion.div>
          </div>

          <h1 className="text-5xl font-bold">
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-800 bg-clip-text text-transparent">
              Importer vos données
            </span>
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Synchronisez facilement vos données d'entraînement depuis vos appareils et applications préférées.
            <span className="block text-lg text-emerald-400 font-medium mt-2">
              🚀 Intelligence artificielle • 📊 Analyses avancées • ⚡ Import instantané
            </span>
          </p>
        </motion.div>

        {/* Data Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 mx-4"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Sources de données supportées</h3>
                <p className="text-gray-300">Connectez-vous à vos applications préférées</p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center"
            >
              <Zap className="w-4 h-4 text-white" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dataSources.map((source) => {
              const Icon = source.icon;
              return (
                <motion.button
                  key={source.id}
                  onClick={() => setSelectedSource(source.id)}
                  disabled={!source.supported}
                  whileHover={source.supported ? { scale: 1.02, y: -2 } : {}}
                  whileTap={source.supported ? { scale: 0.98 } : {}}
                  className={`group p-6 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden ${
                    selectedSource === source.id
                      ? 'border-emerald-500 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shadow-lg shadow-emerald-500/25'
                      : source.supported
                      ? 'border-gray-600 hover:border-emerald-400 bg-white/5 hover:bg-white/10 hover:shadow-xl hover:shadow-emerald-400/25'
                      : 'border-gray-700 bg-gray-800/20 opacity-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedSource === source.id ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        selectedSource === source.id ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{source.name}</h4>
                      {!source.supported && (
                        <span className="text-xs text-orange-600 font-medium">Bientôt disponible</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">{source.description}</p>
                  <div className="mt-2">
                    <p className="text-xs text-gray-400">
                      Formats: {source.fileTypes.join(', ')}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Apple Health Instructions */}
        {selectedSource === 'apple-health' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-emerald-900/30 rounded-2xl p-6 border border-emerald-500/30"
          >
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-300 mb-2">Comment exporter vos données Apple Health</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-emerald-200">
                  <li>Ouvrez l'app <strong>Santé</strong> sur votre iPhone</li>
                  <li>Appuyez sur votre photo de profil en haut à droite</li>
                  <li>Sélectionnez <strong>"Exporter toutes les données de santé"</strong></li>
                  <li>Attendez la génération du fichier (peut prendre quelques minutes)</li>
                  <li>Partagez le fichier vers cette page ou votre ordinateur</li>
                </ol>
              </div>
            </div>
          </motion.div>
        )}

        {/* File Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 mx-4"
        >
          <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            animate={isDragOver ? {
              scale: 1.02,
              borderWidth: 3,
              transition: { duration: 0.2 }
            } : {}}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 overflow-hidden ${
              isDragOver
                ? 'border-emerald-400 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shadow-inner'
                : 'border-gray-600 hover:border-emerald-400 hover:bg-gradient-to-br hover:from-gray-800/50 hover:to-emerald-800/30'
            }`}
          >
            {/* Animated background elements */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 rounded-2xl"
            />

            <motion.div
              animate={{
                y: [-20, 20, -20]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-emerald-500 rounded-full opacity-20"
            />

            <motion.div
              animate={{
                x: [-30, 30, -30]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full opacity-20"
            />
            <div className="max-w-md mx-auto relative z-10">
              <motion.div
                animate={isDragOver ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                } : {
                  y: [-5, 5, -5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/25"
              >
                <Upload className="w-10 h-10 text-white" />
              </motion.div>

              <h3 className="text-2xl font-bold text-white mb-3">
                {isDragOver ? '🎯 Déposez vos fichiers ici !' : '📁 Glissez-déposez vos fichiers'}
              </h3>
              <p className="text-gray-300 mb-6 text-lg">
                ou cliquez pour sélectionner des fichiers
                <span className="block text-sm text-teal-400 font-medium mt-1">
                  ⚡ Traitement instantané avec IA
                </span>
              </p>

              <input
                type="file"
                multiple
                accept=".xml,.zip,.fit,.tcx,.gpx,.csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <motion.label
                htmlFor="file-upload"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-teal-500/25"
              >
                <Upload className="w-6 h-6" />
                <span>Sélectionner des fichiers</span>
                <Sparkles className="w-4 h-4" />
              </motion.label>

              <div className="mt-6 p-4 bg-gradient-to-r from-gray-800/50 to-emerald-800/30 rounded-xl border border-gray-600">
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Brain className="w-4 h-4 text-teal-600" />
                    <span className="text-gray-300">Formats supportés:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {['XML', 'ZIP', 'FIT', 'TCX', 'GPX', 'CSV'].map((format) => (
                      <span key={format} className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-md font-medium text-xs">
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">
                  📦 Max 100MB par fichier • 🚀 Traitement intelligent
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* File List */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  Fichiers à traiter ({files.length})
                </h3>
                {isProcessing && (
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Traitement en cours...</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    layout
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      {getStatusIcon(file.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-white">{file.name}</h4>
                          <span className="text-sm text-gray-400">{formatFileSize(file.size)}</span>
                        </div>

                        {file.status === 'processing' && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${file.progress}%` }}
                                className="bg-emerald-600 h-2 rounded-full"
                              />
                            </div>
                            <p className="text-sm text-gray-300 mt-1">{file.progress}% traité</p>
                          </div>
                        )}

                        {file.status === 'success' && file.data && (
                          <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Séances:</span>
                              <span className="font-medium ml-1">{file.data.workouts}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Distance:</span>
                              <span className="font-medium ml-1">{file.data.distance} km</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Période:</span>
                              <span className="font-medium ml-1">{file.data.startDate} - {file.data.endDate}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Temps:</span>
                              <span className="font-medium ml-1">{Math.floor(file.data.duration / 60)}h</span>
                            </div>
                          </div>
                        )}

                        {file.status === 'error' && (
                          <p className="text-sm text-red-400 mt-1">{file.error}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {file.status === 'error' && (
                        <button
                          onClick={() => retryFile(file.id)}
                          className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
                          title="Réessayer"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Import Summary */}
        <AnimatePresence>
          {successfulFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-2xl border border-green-400/20 mx-4"
            >
              {/* Animated background patterns */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 180, 270, 360],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 20, repeat: Infinity }}
                className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"
              />

              <motion.div
                animate={{
                  x: [-20, 20, -20],
                  y: [-10, 10, -10]
                }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute bottom-4 left-4 w-16 h-16 bg-white/5 rounded-full"
              />
              <div className="relative z-10 flex items-center justify-between mb-8">
                <div>
                  <motion.h3
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold mb-2 flex items-center space-x-2"
                  >
                    <span>🎉 Import réussi !</span>
                  </motion.h3>
                  <p className="text-green-100 text-lg">Vos données ont été importées et analysées avec succès</p>
                </div>
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 360]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                >
                  <CheckCircle className="w-8 h-8 text-white" />
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <div className="text-sm text-green-100 mb-1">Fichiers traités</div>
                  <div className="text-2xl font-bold">{successfulFiles.length}</div>
                </div>
                <div>
                  <div className="text-sm text-green-100 mb-1">Entraînements</div>
                  <div className="text-2xl font-bold">{totalWorkouts}</div>
                </div>
                <div>
                  <div className="text-sm text-green-100 mb-1">Distance totale</div>
                  <div className="text-2xl font-bold">{totalDistance} km</div>
                </div>
                <div>
                  <div className="text-sm text-green-100 mb-1">Période</div>
                  <div className="text-lg font-semibold">2023-2024</div>
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-lg mb-1">
                    Vos données sont maintenant disponibles dans votre tableau de bord
                  </p>
                  <p className="text-green-200 text-sm">
                    🧠 Analyses IA • 📈 Tendances • 🎯 Recommandations personnalisées
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl"
                >
                  <Play className="w-6 h-6" />
                  <span className="text-lg">Voir le dashboard</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ImportData;