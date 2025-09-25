import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Activity,
  TrendingUp,
  Target,
  Clock,
  Calendar,
  Zap,
  Heart,
  MapPin,
  Users,
  ChevronRight,
  PlayCircle,
  Trophy,
  Flame,
  Timer,
  BarChart3,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Gauge
} from 'lucide-react';
import APITestComponent from '../components/APITestComponent';

interface WorkoutStats {
  totalSessions: number;
  totalDistance: number;
  totalDuration: number;
  avgPace: string;
  weeklyGoal: number;
  weeklyProgress: number;
}

interface PredictionData {
  nextWorkoutType: string;
  recommendedPace: string;
  estimatedDuration: number;
  difficulty: 'Facile' | 'Modéré' | 'Intense';
  confidence: number;
}

const Dashboard: React.FC = () => {
  const { userData, isDataLoaded } = useData();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isDataLoaded) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isDataLoaded]);

  // Données basées sur les vraies données utilisateur ou vierges
  const stats: WorkoutStats = {
    totalSessions: userData.stats.totalWorkouts,
    totalDistance: userData.stats.totalDistance,
    totalDuration: userData.stats.totalTime,
    avgPace: userData.stats.averagePace,
    weeklyGoal: 40, // Configurable par utilisateur plus tard
    weeklyProgress: userData.stats.currentWeekDistance
  };

  const prediction: PredictionData = {
    nextWorkoutType: userData.workouts.length > 0 ? 'Course d\'endurance' : 'Première séance',
    recommendedPace: userData.workouts.length > 0 ? '5:30' : 'À définir',
    estimatedDuration: userData.workouts.length > 0 ? 45 : 30,
    difficulty: userData.workouts.length > 0 ? 'Modéré' : 'Facile',
    confidence: userData.workouts.length > 0 ? 87 : 0
  };

  // Données graphiques basées sur les workouts réels ou vierges
  const weeklyData = userData.workouts.length > 0
    ? userData.stats.weeklyProgress.slice(-7).map((item, index) => ({
        day: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][index],
        distance: item.distance || 0,
        pace: 0,
        zone: 0
      }))
    : Array(7).fill(0).map((_, index) => ({
        day: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][index],
        distance: 0,
        pace: 0,
        zone: 0
      }));

  const monthlyData = userData.workouts.length > 0
    ? userData.stats.monthlyDistances.slice(-6)
    : Array(6).fill(0).map((_, index) => ({
        month: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'][index],
        distance: 0,
        sessions: 0,
        calories: 0
      }));

  const workoutTypes = userData.workouts.length > 0
    ? (() => {
        const typeCount = userData.workouts.reduce((acc, workout) => {
          acc[workout.type] = (acc[workout.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const total = Object.values(typeCount).reduce((sum, count) => sum + count, 0);

        return Object.entries(typeCount).map(([type, count]) => ({
          name: type.charAt(0).toUpperCase() + type.slice(1),
          value: Math.round((count / total) * 100),
          sessions: count,
          color: type === 'course' ? '#10B981' :
                 type === 'fractionné' ? '#F59E0B' :
                 type === 'endurance' ? '#6366F1' : '#EF4444'
        }));
      })()
    : [
        { name: 'Aucune donnée', value: 100, color: '#6B7280', sessions: 0 }
      ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const statCards = [
    {
      title: 'Sessions totales',
      value: stats.totalSessions,
      change: '+12%',
      changeType: 'up',
      icon: Activity,
      gradient: 'from-emerald-400 via-teal-400 to-cyan-400',
      bgGradient: 'from-emerald-900/20 to-cyan-900/20',
      pulse: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]'
    },
    {
      title: 'Distance totale',
      value: `${stats.totalDistance.toFixed(2)}`,
      unit: 'km',
      change: '+8.5%',
      changeType: 'up',
      icon: MapPin,
      gradient: 'from-blue-400 via-purple-400 to-pink-400',
      bgGradient: 'from-blue-900/20 to-purple-900/20',
      pulse: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]'
    },
    {
      title: 'Temps total',
      value: `${Math.floor(stats.totalDuration / 60)}h`,
      unit: `${stats.totalDuration % 60}m`,
      change: '+15%',
      changeType: 'up',
      icon: Timer,
      gradient: 'from-orange-400 via-red-400 to-pink-400',
      bgGradient: 'from-orange-900/20 to-red-900/20',
      pulse: 'shadow-[0_0_30px_rgba(251,146,60,0.3)]'
    },
    {
      title: 'Allure moyenne',
      value: stats.avgPace,
      unit: '/km',
      change: '-3%',
      changeType: 'down',
      icon: Gauge,
      gradient: 'from-violet-400 via-purple-400 to-indigo-400',
      bgGradient: 'from-violet-900/20 to-purple-900/20',
      pulse: 'shadow-[0_0_30px_rgba(139,92,246,0.3)]'
    }
  ];

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
        <title>Dashboard | RunCoach AI</title>
        <meta name="description" content="Tableau de bord RunCoach AI - Suivez vos performances, obtenez des prédictions IA et planifiez vos entraînements de course à pied" />
        <meta property="og:title" content="Dashboard RunCoach AI" />
        <meta property="og:description" content="Intelligence artificielle pour optimiser vos entraînements de course à pied" />
        <link rel="canonical" href="/dashboard" />
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="text-center space-y-6"
        >
          <div className="relative inline-block">
            <motion.h1
              className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400"
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
              Dashboard Elite
            </motion.h1>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
          </div>

          <motion.p
            className="text-lg text-emerald-100/80 max-w-2xl mx-auto font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Analyse IA temps réel • Performance tracking • Coaching adaptatif
          </motion.p>

          {/* Live Status Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center space-x-4 px-6 py-3 bg-black/40 backdrop-blur-xl rounded-full border border-emerald-500/30"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-300 font-medium">IA Active</span>
            </div>
            <div className="w-px h-4 bg-emerald-500/30" />
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-red-400 animate-pulse" />
              <span className="text-xs text-emerald-300 font-medium">Zone optimale</span>
            </div>
            <div className="w-px h-4 bg-emerald-500/30" />
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-emerald-300 font-medium">Niveau 12</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`relative group cursor-pointer`}
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition-opacity ${stat.pulse}`} />

                {/* Card Content */}
                <div className={`relative bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-emerald-100/60">{stat.title}</p>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-3xl font-black text-white">{stat.value}</span>
                        {stat.unit && (
                          <span className="text-lg font-semibold text-emerald-300">{stat.unit}</span>
                        )}
                      </div>
                    </div>

                    {/* Animated Icon */}
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.bgGradient} backdrop-blur-sm flex items-center justify-center border border-white/10`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </motion.div>
                  </div>

                  {/* Change Indicator */}
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      stat.changeType === 'up'
                        ? 'bg-green-900/30 text-green-400 border border-green-500/20'
                        : 'bg-red-900/30 text-red-400 border border-red-500/20'
                    }`}>
                      {stat.changeType === 'up' ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : (
                        <ArrowDown className="w-3 h-3" />
                      )}
                      <span>{stat.change}</span>
                    </div>

                    {/* Mini Progress */}
                    <div className="flex items-center space-x-1">
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          className={`w-1 h-6 rounded-full ${i < 3 ? `bg-gradient-to-t ${stat.gradient}` : 'bg-white/10'}`}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: index * 0.1 + i * 0.1 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* AI Prediction Card - Enhanced */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.5 }}
          className="relative group"
        >
          {/* Dynamic Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-emerald-600/20 rounded-3xl blur-xl opacity-60" />
          <motion.div
            animate={{
              background: [
                'linear-gradient(45deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1), rgba(16,185,129,0.1))',
                'linear-gradient(45deg, rgba(16,185,129,0.1), rgba(139,92,246,0.1), rgba(59,130,246,0.1))',
                'linear-gradient(45deg, rgba(59,130,246,0.1), rgba(16,185,129,0.1), rgba(139,92,246,0.1))'
              ]
            }}
            transition={{ duration: 5, repeat: Infinity }}
            className="relative bg-black/70 backdrop-blur-2xl rounded-3xl p-8 border border-emerald-500/30 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center relative"
                  whileHover={{ rotate: 5 }}
                >
                  <Zap className="w-8 h-8 text-white" />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl opacity-30"
                  />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">Prédiction IA Elite</h3>
                  <p className="text-emerald-300/80">Analyse prédictive avancée</p>
                </div>
              </div>

              {/* Confidence Score */}
              <div className="text-right">
                <div className="text-sm text-emerald-400 font-medium mb-1">Précision IA</div>
                <div className="flex items-center space-x-2">
                  <motion.div
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    <span className="text-lg font-black text-black">{prediction.confidence}</span>
                  </motion.div>
                  <span className="text-2xl font-black text-white">%</span>
                </div>
              </div>
            </div>

            {/* Prediction Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: 'Type d\'entraînement', value: prediction.nextWorkoutType, icon: Activity, color: 'from-blue-400 to-cyan-400' },
                { label: 'Allure optimale', value: `${prediction.recommendedPace}/km`, icon: Gauge, color: 'from-purple-400 to-pink-400' },
                { label: 'Durée recommandée', value: `${prediction.estimatedDuration} min`, icon: Clock, color: 'from-orange-400 to-red-400' }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs text-emerald-300/80 font-medium">{item.label}</span>
                    </div>
                    <p className="text-lg font-bold text-white">{item.value}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span className="text-sm text-white font-medium">Intensité: {prediction.difficulty}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-400 animate-pulse" />
                  <span className="text-sm text-white font-medium">Zone cardiaque optimale</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 px-6 py-3 rounded-xl font-bold text-black transition-all flex items-center space-x-2 shadow-lg"
              >
                <PlayCircle className="w-5 h-5" />
                <span>Lancer la séance</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Charts Grid - Enhanced */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Weekly Progress - Enhanced */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ delay: 0.6 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Progression hebdomadaire</h3>
                    <p className="text-xs text-emerald-300/60">Objectif intelligent adaptatif</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-white">{stats.weeklyProgress}</div>
                  <div className="text-sm text-emerald-300">/ {stats.weeklyGoal} km</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-emerald-200 mb-3">
                  <span className="font-medium">Objectif de la semaine</span>
                  <span className="font-bold">{Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats.weeklyProgress / stats.weeklyGoal) * 100}%` }}
                    transition={{ duration: 2, delay: 0.8, type: "spring" }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full relative"
                  >
                    <motion.div
                      animate={{ x: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                  </motion.div>
                </div>
              </div>

              {/* Enhanced Chart */}
              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="distanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6EE7B7', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6EE7B7', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: '12px',
                        color: 'white'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="distance"
                      stroke="#10B981"
                      strokeWidth={3}
                      fill="url(#distanceGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Monthly Evolution - Enhanced */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ delay: 0.7 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Évolution mensuelle</h3>
                    <p className="text-xs text-blue-300/60">Tendance sur 6 mois</p>
                  </div>
                </div>
              </div>

              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyData}>
                    <defs>
                      <linearGradient id="distanceLineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                      <linearGradient id="sessionsLineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#93C5FD', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#93C5FD', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(59,130,246,0.3)',
                        borderRadius: '12px',
                        color: 'white'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="distance"
                      stroke="url(#distanceLineGradient)"
                      strokeWidth={4}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      stroke="url(#sessionsLineGradient)"
                      strokeWidth={4}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Workout Types - Enhanced */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ delay: 0.8 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Répartition des entraînements</h3>
                  <p className="text-xs text-orange-300/60">Distribution optimale IA</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={workoutTypes}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {workoutTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: '1px solid rgba(251,146,60,0.3)',
                          borderRadius: '12px',
                          color: 'white'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  {workoutTypes.map((type, index) => (
                    <motion.div
                      key={type.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/5"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full shadow-lg"
                          style={{ backgroundColor: type.color }}
                        />
                        <div>
                          <span className="text-sm font-medium text-white">{type.name}</span>
                          <p className="text-xs text-white/60">{type.sessions} sessions</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-white">{type.value}%</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions - Enhanced */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ delay: 0.9 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-indigo-400 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Actions rapides</h3>
                  <p className="text-xs text-violet-300/60">Accès direct aux fonctions</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { title: 'Nouvelle séance IA', icon: Activity, href: '/workouts/new', color: 'from-emerald-400 to-green-400', desc: 'Générer un entraînement' },
                  { title: 'Plan personnalisé', icon: Calendar, href: '/training-plan', color: 'from-blue-400 to-cyan-400', desc: 'Mise à jour automatique' },
                  { title: 'Objectifs avancés', icon: Target, href: '/goals', color: 'from-orange-400 to-red-400', desc: 'Suivi intelligent' },
                  { title: 'Communauté Elite', icon: Users, href: '/community', color: 'from-purple-400 to-pink-400', desc: 'Réseau d\'athlètes' }
                ].map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.title}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-black/30 hover:bg-black/50 border border-white/10 hover:border-white/20 transition-all group/action"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-bold text-white">{action.title}</div>
                          <div className="text-xs text-white/60">{action.desc}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/40 group-hover/action:text-white group-hover/action:translate-x-1 transition-all" />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* API Test Component */}
          <APITestComponent />
        </div>
      </div>
    </>
  );
};

export default Dashboard;