import React, { useState, useEffect } from 'react';
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
  PlayCircle
} from 'lucide-react';

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
  const [stats] = useState<WorkoutStats>({
    totalSessions: 195,
    totalDistance: 1247.5,
    totalDuration: 8420, // minutes
    avgPace: '5:12',
    weeklyGoal: 40, // km
    weeklyProgress: 28.5
  });

  const [prediction] = useState<PredictionData>({
    nextWorkoutType: 'Course d\'endurance',
    recommendedPace: '5:30',
    estimatedDuration: 45,
    difficulty: 'Modéré',
    confidence: 87
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Mock data for charts
  const weeklyData = [
    { day: 'Lun', distance: 8.2, pace: 312 },
    { day: 'Mar', distance: 0, pace: 0 },
    { day: 'Mer', distance: 6.5, pace: 295 },
    { day: 'Jeu', distance: 0, pace: 0 },
    { day: 'Ven', distance: 10.1, pace: 318 },
    { day: 'Sam', distance: 0, pace: 0 },
    { day: 'Dim', distance: 15.3, pace: 338 }
  ];

  const monthlyData = [
    { month: 'Jan', distance: 156, sessions: 18 },
    { month: 'Fév', distance: 142, sessions: 16 },
    { month: 'Mar', distance: 178, sessions: 21 },
    { month: 'Avr', distance: 165, sessions: 19 },
    { month: 'Mai', distance: 189, sessions: 23 },
    { month: 'Jun', distance: 156, sessions: 18 }
  ];

  const workoutTypes = [
    { name: 'Endurance', value: 60, color: '#3B82F6' },
    { name: 'Fractionné', value: 25, color: '#10B981' },
    { name: 'Récupération', value: 10, color: '#F59E0B' },
    { name: 'Course longue', value: 5, color: '#EF4444' }
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

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
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tableau de bord
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Suivez vos performances et obtenez des recommandations personnalisées basées sur l'IA
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Sessions totales',
              value: stats.totalSessions,
              icon: Activity,
              color: 'from-blue-500 to-blue-600',
              bgColor: 'bg-blue-50',
              textColor: 'text-blue-600'
            },
            {
              title: 'Distance totale',
              value: `${stats.totalDistance} km`,
              icon: MapPin,
              color: 'from-green-500 to-green-600',
              bgColor: 'bg-green-50',
              textColor: 'text-green-600'
            },
            {
              title: 'Temps total',
              value: `${Math.floor(stats.totalDuration / 60)}h ${stats.totalDuration % 60}m`,
              icon: Clock,
              color: 'from-purple-500 to-purple-600',
              bgColor: 'bg-purple-50',
              textColor: 'text-purple-600'
            },
            {
              title: 'Allure moyenne',
              value: `${stats.avgPace}/km`,
              icon: TrendingUp,
              color: 'from-orange-500 to-orange-600',
              bgColor: 'bg-orange-50',
              textColor: 'text-orange-600'
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* AI Prediction Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Prédiction IA</h3>
                <p className="text-blue-100">Prochaine séance recommandée</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">Confiance</div>
              <div className="text-2xl font-bold">{prediction.confidence}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-blue-100 mb-1">Type d'entraînement</div>
              <div className="text-lg font-semibold">{prediction.nextWorkoutType}</div>
            </div>
            <div>
              <div className="text-sm text-blue-100 mb-1">Allure recommandée</div>
              <div className="text-lg font-semibold">{prediction.recommendedPace}/km</div>
            </div>
            <div>
              <div className="text-sm text-blue-100 mb-1">Durée estimée</div>
              <div className="text-lg font-semibold">{prediction.estimatedDuration} min</div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <span className="text-sm">Difficulté: {prediction.difficulty}</span>
            </div>
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
              <PlayCircle className="w-4 h-4" />
              <span>Commencer</span>
            </button>
          </div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Progress */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ delay: 0.6 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Progression hebdomadaire</h3>
              <div className="text-sm text-gray-500">
                {stats.weeklyProgress}/{stats.weeklyGoal} km
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Objectif hebdomadaire</span>
                <span>{Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.weeklyProgress / stats.weeklyGoal) * 100}%` }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                />
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="distance" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Monthly Stats */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ delay: 0.7 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Évolution mensuelle</h3>

            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="distance" stroke="#3B82F6" strokeWidth={3} />
                <Line type="monotone" dataKey="sessions" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Workout Types Distribution */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ delay: 0.8 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Types d'entraînement</h3>

            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={workoutTypes}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {workoutTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-2">
              {workoutTypes.map((type) => (
                <div key={type.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-sm text-gray-600">{type.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{type.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ delay: 0.9 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Actions rapides</h3>

            <div className="space-y-3">
              {[
                { title: 'Nouvelle séance', icon: Activity, href: '/workouts/new' },
                { title: 'Plan d\'entraînement', icon: Calendar, href: '/training-plan' },
                { title: 'Objectifs', icon: Target, href: '/goals' },
                { title: 'Communauté', icon: Users, href: '/community' }
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.title}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">{action.title}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;