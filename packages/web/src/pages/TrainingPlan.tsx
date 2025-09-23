import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  MapPin,
  Heart,
  Activity,
  CheckCircle,
  AlertCircle,
  Play,
  RotateCcw,
  Zap,
  Mountain,
  Timer,
  Award,
  Settings
} from 'lucide-react';

interface TrainingSession {
  id: string;
  day: string;
  date: string;
  type: 'Endurance' | 'Fractionné' | 'Récupération' | 'Course longue' | 'Tempo' | 'Repos';
  distance?: number;
  duration: number;
  intensity: 'Facile' | 'Modéré' | 'Intense' | 'Repos';
  description: string;
  targetPace?: string;
  targetHeartRate?: string;
  completed: boolean;
  notes?: string;
  location?: string;
}

interface WeeklyPlan {
  week: number;
  startDate: string;
  endDate: string;
  totalDistance: number;
  sessions: TrainingSession[];
  focus: string;
}

const TrainingPlan: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [trainingPlan, setTrainingPlan] = useState<WeeklyPlan[]>([]);
  // const [selectedGoal] = useState('semi-marathon');
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Mock training plan data
  useEffect(() => {
    const mockPlan: WeeklyPlan[] = [
      {
        week: 1,
        startDate: '2024-01-15',
        endDate: '2024-01-21',
        totalDistance: 35,
        focus: 'Développement de la base aérobie',
        sessions: [
          {
            id: '1-1',
            day: 'Lundi',
            date: '2024-01-15',
            type: 'Repos',
            duration: 0,
            intensity: 'Repos',
            description: 'Jour de repos complet ou étirements légers',
            completed: true
          },
          {
            id: '1-2',
            day: 'Mardi',
            date: '2024-01-16',
            type: 'Endurance',
            distance: 8,
            duration: 40,
            intensity: 'Facile',
            description: 'Course d\'endurance à allure confortable',
            targetPace: '5:30-6:00',
            targetHeartRate: '140-150 bpm',
            completed: true,
            notes: 'Excellente séance, bon feeling'
          },
          {
            id: '1-3',
            day: 'Mercredi',
            date: '2024-01-17',
            type: 'Fractionné',
            distance: 6,
            duration: 35,
            intensity: 'Intense',
            description: '6 x 400m (récup 1min30)',
            targetPace: '4:00-4:15',
            targetHeartRate: '170-180 bpm',
            completed: false
          },
          {
            id: '1-4',
            day: 'Jeudi',
            date: '2024-01-18',
            type: 'Récupération',
            distance: 5,
            duration: 30,
            intensity: 'Facile',
            description: 'Course de récupération très lente',
            targetPace: '6:00-6:30',
            targetHeartRate: '120-135 bpm',
            completed: false
          },
          {
            id: '1-5',
            day: 'Vendredi',
            date: '2024-01-19',
            type: 'Repos',
            duration: 0,
            intensity: 'Repos',
            description: 'Repos ou cross-training léger',
            completed: false
          },
          {
            id: '1-6',
            day: 'Samedi',
            date: '2024-01-20',
            type: 'Tempo',
            distance: 10,
            duration: 50,
            intensity: 'Modéré',
            description: 'Course tempo : 3km échauffement + 5km tempo + 2km récup',
            targetPace: '4:45-5:00',
            targetHeartRate: '155-165 bpm',
            completed: false,
            location: 'Parc des Buttes-Chaumont'
          },
          {
            id: '1-7',
            day: 'Dimanche',
            date: '2024-01-21',
            type: 'Course longue',
            distance: 16,
            duration: 90,
            intensity: 'Facile',
            description: 'Course longue à allure détendue',
            targetPace: '5:30-6:00',
            targetHeartRate: '140-150 bpm',
            completed: false,
            location: 'Bois de Vincennes'
          }
        ]
      },
      {
        week: 2,
        startDate: '2024-01-22',
        endDate: '2024-01-28',
        totalDistance: 40,
        focus: 'Augmentation progressive du volume',
        sessions: [
          {
            id: '2-1',
            day: 'Lundi',
            date: '2024-01-22',
            type: 'Repos',
            duration: 0,
            intensity: 'Repos',
            description: 'Jour de repos complet',
            completed: false
          },
          {
            id: '2-2',
            day: 'Mardi',
            date: '2024-01-23',
            type: 'Endurance',
            distance: 9,
            duration: 45,
            intensity: 'Facile',
            description: 'Course d\'endurance avec variations d\'allure',
            targetPace: '5:30-6:00',
            targetHeartRate: '140-150 bpm',
            completed: false
          },
          {
            id: '2-3',
            day: 'Mercredi',
            date: '2024-01-24',
            type: 'Fractionné',
            distance: 7,
            duration: 40,
            intensity: 'Intense',
            description: '5 x 800m (récup 2min)',
            targetPace: '4:10-4:25',
            targetHeartRate: '170-180 bpm',
            completed: false
          },
          {
            id: '2-4',
            day: 'Jeudi',
            date: '2024-01-25',
            type: 'Récupération',
            distance: 6,
            duration: 35,
            intensity: 'Facile',
            description: 'Course de récupération active',
            targetPace: '6:00-6:30',
            targetHeartRate: '120-135 bpm',
            completed: false
          },
          {
            id: '2-5',
            day: 'Vendredi',
            date: '2024-01-26',
            type: 'Repos',
            duration: 0,
            intensity: 'Repos',
            description: 'Repos complet avant le week-end',
            completed: false
          },
          {
            id: '2-6',
            day: 'Samedi',
            date: '2024-01-27',
            type: 'Tempo',
            distance: 12,
            duration: 60,
            intensity: 'Modéré',
            description: 'Séance tempo progressive',
            targetPace: '4:45-5:00',
            targetHeartRate: '155-165 bpm',
            completed: false
          },
          {
            id: '2-7',
            day: 'Dimanche',
            date: '2024-01-28',
            type: 'Course longue',
            distance: 18,
            duration: 100,
            intensity: 'Facile',
            description: 'Course longue avec finish plus rapide',
            targetPace: '5:30-6:00',
            targetHeartRate: '140-150 bpm',
            completed: false
          }
        ]
      }
    ];

    setTimeout(() => {
      setTrainingPlan(mockPlan);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getIntensityColor = (intensity: string): string => {
    const colors = {
      'Repos': 'bg-gray-100 text-gray-800',
      'Facile': 'bg-green-100 text-green-800',
      'Modéré': 'bg-orange-100 text-orange-800',
      'Intense': 'bg-red-100 text-red-800'
    };
    return colors[intensity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'Endurance': Activity,
      'Fractionné': Zap,
      'Récupération': RotateCcw,
      'Course longue': Mountain,
      'Tempo': Timer,
      'Repos': Clock
    };
    return icons[type as keyof typeof icons] || Activity;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const completedSessions = trainingPlan[currentWeek]?.sessions.filter(s => s.completed).length || 0;
  const totalSessions = trainingPlan[currentWeek]?.sessions.length || 0;
  const progressPercentage = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Plan d'entraînement | RunCoach AI</title>
        <meta name="description" content="Suivez votre plan d'entraînement personnalisé pour semi-marathon avec coaching IA adaptatif" />
        <meta property="og:title" content="Plan d'entraînement RunCoach AI" />
        <meta property="og:description" content="Plan d'entraînement intelligent et adaptatif pour la course à pied" />
        <link rel="canonical" href="/training-plan" />
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Plan d'entraînement</h1>
            <p className="text-gray-600 mt-1">
              Préparation semi-marathon - 12 semaines
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Paramètres</span>
            </button>

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Objectifs</span>
            </button>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold">Semaine {trainingPlan[currentWeek]?.week || 1}</h3>
              <p className="text-blue-100">
                {trainingPlan[currentWeek]?.startDate && formatDate(trainingPlan[currentWeek].startDate)} - {trainingPlan[currentWeek]?.endDate && formatDate(trainingPlan[currentWeek].endDate)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{Math.round(progressPercentage)}%</div>
              <div className="text-sm text-blue-100">Complété</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-sm text-blue-100 mb-1">Sessions complétées</div>
              <div className="text-2xl font-bold">{completedSessions}/{totalSessions}</div>
            </div>
            <div>
              <div className="text-sm text-blue-100 mb-1">Distance totale</div>
              <div className="text-2xl font-bold">{trainingPlan[currentWeek]?.totalDistance || 0} km</div>
            </div>
            <div>
              <div className="text-sm text-blue-100 mb-1">Focus</div>
              <div className="text-lg font-semibold">{trainingPlan[currentWeek]?.focus || 'Développement de base'}</div>
            </div>
          </div>

          <div className="w-full bg-white/20 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-white h-3 rounded-full"
            />
          </div>
        </motion.div>

        {/* Week Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center space-x-2"
        >
          {trainingPlan.map((week, index) => (
            <button
              key={week.week}
              onClick={() => setCurrentWeek(index)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentWeek === index
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/80 text-gray-600 hover:bg-gray-100'
              }`}
            >
              S{week.week}
            </button>
          ))}
        </motion.div>

        {/* Training Sessions */}
        <div className="grid grid-cols-1 gap-4">
          {trainingPlan[currentWeek]?.sessions.map((session, index) => {
            const TypeIcon = getTypeIcon(session.type);

            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 ${
                  session.completed ? 'ring-2 ring-green-500 ring-opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      session.completed ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-purple-600'
                    }`}>
                      {session.completed ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <TypeIcon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {session.day} - {session.type}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntensityColor(session.intensity)}`}>
                          {session.intensity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(session.date)}</span>
                        {session.location && (
                          <>
                            <MapPin className="w-4 h-4 ml-2" />
                            <span>{session.location}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {!session.completed && session.type !== 'Repos' && (
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                      <Play className="w-4 h-4" />
                      <span>Commencer</span>
                    </button>
                  )}
                </div>

                <p className="text-gray-700 mb-4">{session.description}</p>

                {session.type !== 'Repos' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {session.distance && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Distance</p>
                        <p className="text-lg font-semibold text-gray-900">{session.distance} km</p>
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Durée</p>
                      <p className="text-lg font-semibold text-gray-900">{session.duration} min</p>
                    </div>
                    {session.targetPace && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Allure cible</p>
                        <p className="text-lg font-semibold text-gray-900">{session.targetPace}/km</p>
                      </div>
                    )}
                    {session.targetHeartRate && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">FC cible</p>
                        <p className="text-lg font-semibold text-gray-900 flex items-center justify-center space-x-1">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span>{session.targetHeartRate}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {session.notes && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-800">{session.notes}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Weekly Summary */}
        {trainingPlan[currentWeek] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé de la semaine</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">Distance totale</p>
                <p className="text-xl font-bold text-gray-900">{trainingPlan[currentWeek].totalDistance} km</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Sessions</p>
                <p className="text-xl font-bold text-gray-900">{totalSessions}</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600">Progression</p>
                <p className="text-xl font-bold text-gray-900">{Math.round(progressPercentage)}%</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-sm text-gray-600">Focus</p>
                <p className="text-sm font-semibold text-gray-900">{trainingPlan[currentWeek].focus}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default TrainingPlan;