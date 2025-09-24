import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
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
  Settings,
  Sparkles,
  Flame,
  Users,
  ChevronLeft,
  ChevronRight,
  Brain,
  Gauge,
  Trophy,
  Star
} from 'lucide-react';

interface TrainingSession {
  id: string;
  day: string;
  date: string;
  type: string;
  distance?: number;
  duration?: number;
  intensity: string;
  description: string;
  targetPace?: string;
  targetHeartRate?: string;
  completed: boolean;
  notes?: string;
  aiScore?: number;
}

interface WeeklyPlan {
  week: number;
  startDate: string;
  endDate: string;
  totalDistance: number;
  focus: string;
  sessions: TrainingSession[];
  difficulty: number;
  adaptations: string[];
}

const TrainingPlan: React.FC = () => {
  const { userData, isDataLoaded } = useData();
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Utilise les données réelles de l'utilisateur
  const trainingPlan = userData.trainingPlan || [];

  useEffect(() => {
    if (isDataLoaded) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isDataLoaded]);

  const getIntensityConfig = (intensity: string) => {
    const configs = {
      'Repos': { bg: 'from-gray-900/20 to-slate-900/20', text: 'text-gray-300', border: 'border-gray-500/20' },
      'Facile': { bg: 'from-green-900/20 to-emerald-900/20', text: 'text-green-400', border: 'border-green-500/20' },
      'Modéré': { bg: 'from-orange-900/20 to-yellow-900/20', text: 'text-orange-400', border: 'border-orange-500/20' },
      'Intense': { bg: 'from-red-900/20 to-pink-900/20', text: 'text-red-400', border: 'border-red-500/20' },
      'Très facile': { bg: 'from-emerald-900/20 to-teal-900/20', text: 'text-emerald-400', border: 'border-emerald-500/20' }
    };
    return configs[intensity as keyof typeof configs] || configs['Facile'];
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'Repos': RotateCcw,
      'Endurance': Activity,
      'Fractionné': Zap,
      'Course longue': Mountain,
      'Récupération': Heart,
      'Tempo': Timer
    };
    return icons[type as keyof typeof icons] || Activity;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 w-12 h-12 border-4 border-emerald-400/20 rounded-full"
          />
        </motion.div>
      </div>
    );
  }

  // Affichage état vierge si pas de plan d'entraînement
  if (trainingPlan.length === 0) {
    return (
      <>
        <Helmet>
          <title>Planning Elite | RunCoach AI</title>
          <meta name="description" content="Plan d'entraînement personnalisé avec IA adaptative pour optimiser vos performances de course" />
        </Helmet>

        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(168,85,247,0.1),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='rgba(168,85,247,0.1)' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>

          <div className="relative z-10 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2"
              >
                Planning Elite 🗓️
              </motion.h1>
              <p className="text-gray-400">Plan d'entraînement personnalisé avec IA adaptative</p>
            </motion.div>

            {/* État vierge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center max-w-2xl mx-auto hover:bg-white/8 transition-all duration-300"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar size={40} className="text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Aucun plan d'entraînement</h3>
              <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                Vous n'avez pas encore de plan d'entraînement personnalisé. Importez vos données ou créez un nouveau plan pour commencer votre préparation avec l'IA RunCoach.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all duration-300"
                >
                  <Brain size={20} />
                  Créer un plan IA
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="border border-purple-400/50 text-purple-300 hover:bg-purple-400/10 px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 transition-all duration-300"
                >
                  <Target size={20} />
                  Importer un plan
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  const currentPlan = trainingPlan[currentWeek];

  return (
    <>
      <Helmet>
        <title>Planning Elite | RunCoach AI</title>
        <meta name="description" content="Plan d'entraînement personnalisé avec IA adaptative pour optimiser vos performances de course" />
        <meta property="og:title" content="Planning Elite - RunCoach AI" />
        <meta property="og:description" content="Suivez votre plan d'entraînement intelligent et adaptatif" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(168,85,247,0.1),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='rgba(168,85,247,0.1)' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="relative z-10 p-6 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2"
                >
                  Planning Elite 🗓️
                </motion.h1>
                <p className="text-gray-400">Plan d'entraînement personnalisé avec IA adaptative</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(!showSettings)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all duration-300"
              >
                <Settings size={20} />
              </motion.button>
            </div>
          </motion.div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-8">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
              disabled={currentWeek === 0}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <ChevronLeft size={20} />
            </motion.button>

            <div className="text-center">
              <h2 className="text-2xl font-bold">Semaine {currentPlan?.week}</h2>
              <p className="text-gray-400">
                {currentPlan?.startDate && currentPlan?.endDate &&
                  `${new Date(currentPlan.startDate).toLocaleDateString('fr-FR')} - ${new Date(currentPlan.endDate).toLocaleDateString('fr-FR')}`
                }
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, x: 2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentWeek(Math.min(trainingPlan.length - 1, currentWeek + 1))}
              disabled={currentWeek === trainingPlan.length - 1}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>

          {/* Weekly Overview */}
          {currentPlan && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Target className="text-purple-400" size={24} />
                  <h3 className="font-semibold">Distance totale</h3>
                </div>
                <p className="text-2xl font-bold">{currentPlan.totalDistance} km</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Brain className="text-pink-400" size={24} />
                  <h3 className="font-semibold">Focus</h3>
                </div>
                <p className="text-lg">{currentPlan.focus}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Gauge className="text-orange-400" size={24} />
                  <h3 className="font-semibold">Difficulté</h3>
                </div>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < currentPlan.difficulty ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Training Sessions */}
          {currentPlan && (
            <div className="grid gap-4">
              {currentPlan.sessions.map((session, index) => {
                const intensityConfig = getIntensityConfig(session.intensity);
                const TypeIcon = getTypeIcon(session.type);

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-gradient-to-r ${intensityConfig.bg} backdrop-blur-sm border ${intensityConfig.border} rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 ${intensityConfig.text} flex-shrink-0`}>
                          <TypeIcon size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{session.day}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${intensityConfig.text} bg-white/10`}>
                              {session.intensity}
                            </span>
                          </div>
                          <h4 className="text-lg font-semibold mb-2">{session.type}</h4>
                          <p className="text-gray-300 mb-3">{session.description}</p>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            {session.distance && (
                              <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {session.distance} km
                              </span>
                            )}
                            {session.duration && (
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {session.duration} min
                              </span>
                            )}
                            {session.targetPace && (
                              <span className="flex items-center gap-1">
                                <TrendingUp size={14} />
                                {session.targetPace}
                              </span>
                            )}
                            {session.targetHeartRate && (
                              <span className="flex items-center gap-1">
                                <Heart size={14} />
                                {session.targetHeartRate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {session.aiScore && (
                          <div className="text-right">
                            <div className="text-sm text-gray-400">Score IA</div>
                            <div className="text-lg font-bold text-purple-400">{session.aiScore}</div>
                          </div>
                        )}
                        <div className={`p-2 rounded-full ${session.completed ? 'text-green-400' : 'text-gray-400'}`}>
                          {session.completed ? <CheckCircle size={24} /> : <Play size={24} />}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TrainingPlan;