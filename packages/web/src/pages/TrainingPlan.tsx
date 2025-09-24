import React, { useState, useEffect } from 'react';
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
  aiScore?: number;
}

interface WeeklyPlan {
  week: number;
  startDate: string;
  endDate: string;
  totalDistance: number;
  sessions: TrainingSession[];
  focus: string;
  difficulty: number;
  adaptations: string[];
}

const TrainingPlan: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [trainingPlan, setTrainingPlan] = useState<WeeklyPlan[]>([]);
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
        difficulty: 3,
        adaptations: ['Adaptation FC basée sur vos dernières performances', 'Ajustement des allures selon météo'],
        sessions: [
          {
            id: '1-1',
            day: 'Lundi',
            date: '2024-01-15',
            type: 'Repos',
            duration: 0,
            intensity: 'Repos',
            description: 'Jour de repos complet ou étirements légers',
            completed: true,
            aiScore: 95
          },
          {
            id: '1-2',
            day: 'Mardi',
            date: '2024-01-16',
            type: 'Endurance',
            distance: 8,
            duration: 40,
            intensity: 'Facile',
            description: 'Course d\'endurance à allure confortable - IA adaptative',
            targetPace: '5:30-6:00',
            targetHeartRate: '140-150 bpm',
            completed: true,
            notes: 'Excellente séance, FC parfaitement maîtrisée',
            aiScore: 92
          },
          {
            id: '1-3',
            day: 'Mercredi',
            date: '2024-01-17',
            type: 'Fractionné',
            distance: 6,
            duration: 35,
            intensity: 'Intense',
            description: '6 x 400m (récup 1min30) - Zones optimisées IA',
            targetPace: '4:00-4:15',
            targetHeartRate: '170-180 bpm',
            completed: false,
            aiScore: 89
          },
          {
            id: '1-4',
            day: 'Jeudi',
            date: '2024-01-18',
            type: 'Récupération',
            distance: 5,
            duration: 30,
            intensity: 'Facile',
            description: 'Course de récupération très lente - Régénération active',
            targetPace: '6:00-6:30',
            targetHeartRate: '120-135 bpm',
            completed: false,
            aiScore: 94
          },
          {
            id: '1-5',
            day: 'Vendredi',
            date: '2024-01-19',
            type: 'Repos',
            duration: 0,
            intensity: 'Repos',
            description: 'Repos ou cross-training léger recommandé',
            completed: false,
            aiScore: 96
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
            location: 'Parc des Buttes-Chaumont',
            aiScore: 87
          },
          {
            id: '1-7',
            day: 'Dimanche',
            date: '2024-01-21',
            type: 'Course longue',
            distance: 16,
            duration: 90,
            intensity: 'Facile',
            description: 'Course longue à allure détendue - Endurance fondamentale',
            targetPace: '5:30-6:00',
            targetHeartRate: '140-150 bpm',
            completed: false,
            location: 'Bois de Vincennes',
            aiScore: 91
          }
        ]
      },
      {
        week: 2,
        startDate: '2024-01-22',
        endDate: '2024-01-28',
        totalDistance: 40,
        focus: 'Augmentation progressive du volume',
        difficulty: 4,
        adaptations: ['Volume ajusté selon récupération', 'Intensités modulées par IA'],
        sessions: [
          {
            id: '2-1',
            day: 'Lundi',
            date: '2024-01-22',
            type: 'Repos',
            duration: 0,
            intensity: 'Repos',
            description: 'Jour de repos complet - Récupération prioritaire',
            completed: false,
            aiScore: 95
          },
          {
            id: '2-2',
            day: 'Mardi',
            date: '2024-01-23',
            type: 'Endurance',
            distance: 9,
            duration: 45,
            intensity: 'Facile',
            description: 'Course d\'endurance avec variations d\'allure légères',
            targetPace: '5:30-6:00',
            targetHeartRate: '140-150 bpm',
            completed: false,
            aiScore: 90
          },
          {
            id: '2-3',
            day: 'Mercredi',
            date: '2024-01-24',
            type: 'Fractionné',
            distance: 7,
            duration: 40,
            intensity: 'Intense',
            description: '5 x 800m (récup 2min) - Puissance aérobie',
            targetPace: '4:10-4:25',
            targetHeartRate: '170-180 bpm',
            completed: false,
            aiScore: 88
          },
          {
            id: '2-4',
            day: 'Jeudi',
            date: '2024-01-25',
            type: 'Récupération',
            distance: 6,
            duration: 35,
            intensity: 'Facile',
            description: 'Course de récupération active - Optimisation métabolique',
            targetPace: '6:00-6:30',
            targetHeartRate: '120-135 bpm',
            completed: false,
            aiScore: 93
          },
          {
            id: '2-5',
            day: 'Vendredi',
            date: '2024-01-26',
            type: 'Repos',
            duration: 0,
            intensity: 'Repos',
            description: 'Repos complet avant le week-end intensif',
            completed: false,
            aiScore: 97
          },
          {
            id: '2-6',
            day: 'Samedi',
            date: '2024-01-27',
            type: 'Tempo',
            distance: 12,
            duration: 60,
            intensity: 'Modéré',
            description: 'Séance tempo progressive - Seuil lactique',
            targetPace: '4:45-5:00',
            targetHeartRate: '155-165 bpm',
            completed: false,
            aiScore: 86
          },
          {
            id: '2-7',
            day: 'Dimanche',
            date: '2024-01-28',
            type: 'Course longue',
            distance: 18,
            duration: 100,
            intensity: 'Facile',
            description: 'Course longue avec finish plus rapide - Endurance spécifique',
            targetPace: '5:30-6:00',
            targetHeartRate: '140-150 bpm',
            completed: false,
            aiScore: 89
          }
        ]
      }
    ];

    setTimeout(() => {
      setTrainingPlan(mockPlan);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getIntensityConfig = (intensity: string) => {
    const configs = {
      'Repos': { bg: 'from-gray-900/20 to-slate-900/20', text: 'text-gray-300', border: 'border-gray-500/20' },
      'Facile': { bg: 'from-green-900/20 to-emerald-900/20', text: 'text-green-400', border: 'border-green-500/20' },
      'Modéré': { bg: 'from-orange-900/20 to-yellow-900/20', text: 'text-orange-400', border: 'border-orange-500/20' },
      'Intense': { bg: 'from-red-900/20 to-pink-900/20', text: 'text-red-400', border: 'border-red-500/20' }
    };
    return configs[intensity as keyof typeof configs] || configs['Facile'];
  };

  const getTypeConfig = (type: string) => {
    const configs = {
      'Endurance': { icon: Activity, gradient: 'from-emerald-400 to-green-400', bg: 'from-emerald-900/30 to-green-900/30' },
      'Fractionné': { icon: Zap, gradient: 'from-yellow-400 to-orange-400', bg: 'from-yellow-900/30 to-orange-900/30' },
      'Récupération': { icon: RotateCcw, gradient: 'from-blue-400 to-cyan-400', bg: 'from-blue-900/30 to-cyan-900/30' },
      'Course longue': { icon: Mountain, gradient: 'from-purple-400 to-pink-400', bg: 'from-purple-900/30 to-pink-900/30' },
      'Tempo': { icon: Timer, gradient: 'from-orange-400 to-red-400', bg: 'from-orange-900/30 to-red-900/30' },
      'Repos': { icon: Clock, gradient: 'from-gray-400 to-slate-400', bg: 'from-gray-900/30 to-slate-900/30' }
    };
    return configs[type as keyof typeof configs] || configs['Endurance'];
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
          className="text-center space-y-6"
        >
          <div className="relative inline-block">
            <motion.h1
              className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ backgroundSize: '200% 200%' }}
            >
              Planning Elite
            </motion.h1>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2"
            >
              <Brain className="w-6 h-6 text-cyan-400" />
            </motion.div>
          </div>

          <motion.p
            className="text-lg text-emerald-100/80 max-w-2xl mx-auto font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Préparation semi-marathon IA • 12 semaines • Coaching adaptatif temps réel
          </motion.p>

          {/* Action Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center items-center space-x-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-2 px-6 py-3 bg-black/40 backdrop-blur-xl rounded-full border border-purple-500/30 text-purple-300 hover:text-white transition-all"
            >
              <Settings className="w-4 h-4" />
              <span>Paramètres IA</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-black font-bold rounded-full shadow-[0_0_30px_rgba(168,85,247,0.5)]"
            >
              <Target className="w-4 h-4" />
              <span>Objectifs</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Enhanced Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative group"
        >
          {/* Dynamic Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-3xl blur-xl opacity-60" />
          <motion.div
            animate={{
              background: [
                'linear-gradient(45deg, rgba(168,85,247,0.1), rgba(236,72,153,0.1), rgba(168,85,247,0.1))',
                'linear-gradient(45deg, rgba(236,72,153,0.1), rgba(168,85,247,0.1), rgba(236,72,153,0.1))',
                'linear-gradient(45deg, rgba(168,85,247,0.1), rgba(236,72,153,0.1), rgba(168,85,247,0.1))'
              ]
            }}
            transition={{ duration: 5, repeat: Infinity }}
            className="relative bg-black/70 backdrop-blur-2xl rounded-3xl p-8 border border-purple-500/30 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center relative"
                  whileHover={{ rotate: 5 }}
                >
                  <Calendar className="w-8 h-8 text-white" />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl opacity-30"
                  />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">
                    Semaine {trainingPlan[currentWeek]?.week || 1} / 12
                  </h3>
                  <p className="text-purple-300/80">
                    {trainingPlan[currentWeek]?.startDate && formatDate(trainingPlan[currentWeek].startDate)} - {trainingPlan[currentWeek]?.endDate && formatDate(trainingPlan[currentWeek].endDate)}
                  </p>
                </div>
              </div>

              {/* Progress Circle */}
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="rgba(168,85,247,0.3)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: progressPercentage / 100 }}
                    transition={{ duration: 2, delay: 0.5 }}
                    strokeDasharray="251.2"
                    strokeDashoffset="251.2"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#A855F7" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-white">{Math.round(progressPercentage)}%</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Sessions', value: `${completedSessions}/${totalSessions}`, icon: Activity, color: 'from-green-400 to-emerald-400' },
                { label: 'Distance', value: `${trainingPlan[currentWeek]?.totalDistance || 0} km`, icon: MapPin, color: 'from-blue-400 to-cyan-400' },
                { label: 'Difficulté', value: `${trainingPlan[currentWeek]?.difficulty || 0}/5`, icon: Flame, color: 'from-orange-400 to-red-400' },
                { label: 'Adaptations IA', value: `${trainingPlan[currentWeek]?.adaptations?.length || 0}`, icon: Brain, color: 'from-purple-400 to-pink-400' }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs text-purple-300/80 font-medium">{item.label}</span>
                    </div>
                    <p className="text-xl font-black text-white">{item.value}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Focus & Adaptations */}
            <div className="space-y-4">
              <div className="bg-black/30 rounded-2xl p-4 border border-purple-500/20">
                <h4 className="text-sm font-bold text-purple-300 mb-2 flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Focus de la semaine</span>
                </h4>
                <p className="text-white font-medium">{trainingPlan[currentWeek]?.focus}</p>
              </div>

              {trainingPlan[currentWeek]?.adaptations && (
                <div className="bg-black/30 rounded-2xl p-4 border border-cyan-500/20">
                  <h4 className="text-sm font-bold text-cyan-300 mb-2 flex items-center space-x-2">
                    <Brain className="w-4 h-4" />
                    <span>Adaptations IA cette semaine</span>
                  </h4>
                  <div className="space-y-1">
                    {trainingPlan[currentWeek].adaptations.map((adaptation, idx) => (
                      <p key={idx} className="text-sm text-white/80 flex items-start space-x-2">
                        <Sparkles className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span>{adaptation}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Week Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center space-x-2"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
            disabled={currentWeek === 0}
            className="p-2 rounded-xl bg-black/40 backdrop-blur-xl border border-purple-500/30 text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <div className="flex space-x-2">
            {trainingPlan.slice(0, 6).map((week, index) => (
              <motion.button
                key={week.week}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentWeek(index)}
                className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 ${
                  currentWeek === index
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-black shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                    : 'bg-black/40 backdrop-blur-xl text-purple-300 border border-purple-500/30 hover:border-purple-400/50'
                }`}
              >
                S{week.week}
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentWeek(Math.min(trainingPlan.length - 1, currentWeek + 1))}
            disabled={currentWeek === trainingPlan.length - 1}
            className="p-2 rounded-xl bg-black/40 backdrop-blur-xl border border-purple-500/30 text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Enhanced Training Sessions */}
        <div className="space-y-6">
          {trainingPlan[currentWeek]?.sessions.map((session, index) => {
            const typeConfig = getTypeConfig(session.type);
            const intensityConfig = getIntensityConfig(session.intensity);
            const TypeIcon = typeConfig.icon;

            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.01, x: 5 }}
                className="group relative"
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${typeConfig.gradient} rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity`} />

                <div className={`relative bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 ${
                  session.completed ? 'border-green-500/50 bg-green-900/10' : ''
                } transition-all`}>

                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      {/* Animated Icon */}
                      <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${typeConfig.bg} backdrop-blur-sm flex items-center justify-center border border-white/10 relative`}
                      >
                        {session.completed ? (
                          <CheckCircle className="w-8 h-8 text-green-400" />
                        ) : (
                          <TypeIcon className="w-8 h-8 text-white" />
                        )}
                        {session.aiScore && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center">
                            <span className="text-xs font-black text-black">{session.aiScore}</span>
                          </div>
                        )}
                      </motion.div>

                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-black text-white">
                            {session.day} - {session.type}
                          </h3>
                          <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${intensityConfig.bg} ${intensityConfig.text} border ${intensityConfig.border}`}>
                            {session.intensity}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-emerald-300/80">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(session.date)}</span>
                          </div>
                          {session.location && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                              <span>{session.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {!session.completed && session.type !== 'Repos' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all bg-gradient-to-r ${typeConfig.gradient} text-black shadow-lg`}
                      >
                        <Play className="w-4 h-4" />
                        <span>Démarrer</span>
                      </motion.button>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-white/90 mb-6 bg-black/20 rounded-lg p-4">{session.description}</p>

                  {/* Stats Grid */}
                  {session.type !== 'Repos' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {session.distance && (
                        <div className="text-center bg-black/20 rounded-lg p-3 border border-white/5">
                          <MapPin className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                          <p className="text-xs text-white/60">Distance</p>
                          <p className="text-lg font-black text-white">{session.distance} km</p>
                        </div>
                      )}
                      <div className="text-center bg-black/20 rounded-lg p-3 border border-white/5">
                        <Timer className="w-5 h-5 text-orange-400 mx-auto mb-2" />
                        <p className="text-xs text-white/60">Durée</p>
                        <p className="text-lg font-black text-white">{session.duration} min</p>
                      </div>
                      {session.targetPace && (
                        <div className="text-center bg-black/20 rounded-lg p-3 border border-white/5">
                          <Gauge className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                          <p className="text-xs text-white/60">Allure cible</p>
                          <p className="text-lg font-black text-white">{session.targetPace}/km</p>
                        </div>
                      )}
                      {session.targetHeartRate && (
                        <div className="text-center bg-black/20 rounded-lg p-3 border border-white/5">
                          <Heart className="w-5 h-5 text-red-400 mx-auto mb-2 animate-pulse" />
                          <p className="text-xs text-white/60">FC cible</p>
                          <p className="text-lg font-black text-white">{session.targetHeartRate}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {session.notes && (
                    <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-4 border border-green-500/30">
                      <div className="flex items-start space-x-3">
                        <Star className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-green-300 font-medium mb-1">Note de performance</p>
                          <p className="text-sm text-white/90">{session.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Score Badge */}
                  {session.aiScore && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full px-3 py-1 flex items-center space-x-1">
                        <Brain className="w-3 h-3 text-black" />
                        <span className="text-xs font-black text-black">IA {session.aiScore}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Enhanced Weekly Summary */}
        {trainingPlan[currentWeek] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Résumé de performance</h3>
                  <p className="text-xs text-emerald-300/60">Analyse complète de la semaine</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Distance totale', value: `${trainingPlan[currentWeek].totalDistance} km`, icon: Target, color: 'from-blue-400 to-cyan-400' },
                  { label: 'Sessions', value: `${totalSessions}`, icon: Activity, color: 'from-green-400 to-emerald-400' },
                  { label: 'Progression', value: `${Math.round(progressPercentage)}%`, icon: TrendingUp, color: 'from-purple-400 to-pink-400' },
                  { label: 'Adaptations', value: `${trainingPlan[currentWeek].adaptations?.length || 0}`, icon: Brain, color: 'from-orange-400 to-red-400' }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="text-center"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm text-white/60 mb-1">{item.label}</p>
                      <p className="text-2xl font-black text-white">{item.value}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default TrainingPlan;