import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
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
  ScatterChart,
  Scatter
} from 'recharts';
import {
  Activity,
  Calendar,
  MapPin,
  Search,
  Play,
  MoreVertical,
  Eye,
  Edit,
  Share,
  Heart,
  Timer,
  Zap,
  Mountain,
  RotateCcw,
  TrendingUp,
  Gauge,
  Filter,
  BarChart3,
  Sparkles,
  Trophy,
  Target,
  Flame,
  Clock
} from 'lucide-react';

interface Workout {
  id: string;
  date: string;
  type: 'Endurance' | 'Fractionné' | 'Récupération' | 'Course longue' | 'Tempo';
  distance: number;
  duration: number; // minutes
  pace: string;
  avgHeartRate: number;
  calories: number;
  elevation: number;
  weather: string;
  route?: {
    name: string;
    coordinates: [number, number][];
  };
  notes?: string;
  aiScore?: number;
  efficiency?: number;
}

const Workouts: React.FC = () => {
  const { userData, isDataLoaded } = useData();
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'distance' | 'duration'>('date');
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');
  const [isLoading, setIsLoading] = useState(true);

  // Utilise les données réelles de l'utilisateur
  const workouts = useMemo(() =>
    userData.workouts.map(workout => ({
      ...workout,
      type: workout.type.charAt(0).toUpperCase() + workout.type.slice(1),
      avgHeartRate: workout.heartRate,
      elevation: 0, // À implémenter plus tard
      weather: 'N/A', // À implémenter plus tard
      route: { name: 'Route personnalisée', coordinates: [] },
      notes: workout.notes || '',
      aiScore: Math.floor(Math.random() * 20) + 80, // Score simulé pour l'instant
      efficiency: Math.floor(Math.random() * 15) + 85 // Efficacité simulée
    })), [userData.workouts]);

  useEffect(() => {
    if (isDataLoaded) {
      setFilteredWorkouts(workouts);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isDataLoaded, workouts]);

  // Filter and search functionality
  useEffect(() => {
    let filtered = workouts;

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(workout => workout.type === filterType);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(workout =>
        workout.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workout.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workout.route?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'distance':
          return b.distance - a.distance;
        case 'duration':
          return b.duration - a.duration;
        default:
          return 0;
      }
    });

    setFilteredWorkouts(filtered);
  }, [workouts, searchTerm, filterType, sortBy]);

  const workoutTypes = ['all', 'Endurance', 'Fractionné', 'Récupération', 'Course longue', 'Tempo'];

  const getTypeConfig = (type: string) => {
    const configs = {
      'Endurance': {
        icon: Activity,
        gradient: 'from-emerald-400 to-green-400',
        bg: 'from-emerald-900/30 to-green-900/30',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400'
      },
      'Fractionné': {
        icon: Zap,
        gradient: 'from-yellow-400 to-orange-400',
        bg: 'from-yellow-900/30 to-orange-900/30',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400'
      },
      'Récupération': {
        icon: RotateCcw,
        gradient: 'from-blue-400 to-cyan-400',
        bg: 'from-blue-900/30 to-cyan-900/30',
        border: 'border-blue-500/30',
        text: 'text-blue-400'
      },
      'Course longue': {
        icon: Mountain,
        gradient: 'from-purple-400 to-pink-400',
        bg: 'from-purple-900/30 to-pink-900/30',
        border: 'border-purple-500/30',
        text: 'text-purple-400'
      },
      'Tempo': {
        icon: Timer,
        gradient: 'from-orange-400 to-red-400',
        bg: 'from-orange-900/30 to-red-900/30',
        border: 'border-orange-500/30',
        text: 'text-orange-400'
      }
    };
    return configs[type as keyof typeof configs] || configs['Endurance'];
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  // Chart data preparation
  const chartData = workouts.map(workout => ({
    date: formatDate(workout.date),
    distance: workout.distance,
    pace: parseInt(workout.pace.split(':')[0]) * 60 + parseInt(workout.pace.split(':')[1]),
    heartRate: workout.avgHeartRate,
    aiScore: workout.aiScore || 0
  }));

  // Calculate stats
  const totalDistance = workouts.reduce((sum, w) => sum + w.distance, 0);
  const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
  const avgAiScore = workouts.reduce((sum, w) => sum + (w.aiScore || 0), 0) / workouts.length;

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
        <title>Entraînements | RunCoach AI</title>
        <meta name="description" content="Consultez l'historique de vos entraînements de course à pied avec analyses détaillées et visualisations" />
        <meta property="og:title" content="Historique des entraînements RunCoach AI" />
        <meta property="og:description" content="Analysez vos performances de course avec des graphiques et statistiques détaillées" />
        <link rel="canonical" href="/workouts" />
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
              className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-orange-400"
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
              Séances Elite
            </motion.h1>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2"
            >
              <Flame className="w-6 h-6 text-yellow-400" />
            </motion.div>
          </div>

          <motion.p
            className="text-lg text-emerald-100/80 max-w-2xl mx-auto font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Historique complet • {filteredWorkouts.length} séances • Analyses IA avancées
          </motion.p>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center items-center space-x-6 px-8 py-4 bg-black/40 backdrop-blur-xl rounded-full border border-orange-500/30"
          >
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white font-medium">{totalDistance.toFixed(1)} km</span>
            </div>
            <div className="w-px h-4 bg-orange-500/30" />
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white font-medium">{Math.floor(totalDuration / 60)}h</span>
            </div>
            <div className="w-px h-4 bg-orange-500/30" />
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white font-medium">IA {Math.round(avgAiScore)}%</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex flex-col xl:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher dans vos séances d'entraînement..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-black/40 border-2 border-emerald-600/30 rounded-xl text-white placeholder-emerald-400/60 focus:outline-none focus:border-emerald-400 focus:bg-black/60 transition-all"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-4">
                {/* Type Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="pl-10 pr-8 py-3 bg-black/40 border-2 border-orange-600/30 rounded-xl text-white focus:outline-none focus:border-orange-400 appearance-none cursor-pointer"
                  >
                    {workoutTypes.map(type => (
                      <option key={type} value={type} className="bg-black">
                        {type === 'all' ? 'Tous types' : type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div className="relative">
                  <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'distance' | 'duration')}
                    className="pl-10 pr-8 py-3 bg-black/40 border-2 border-purple-600/30 rounded-xl text-white focus:outline-none focus:border-purple-400 appearance-none cursor-pointer"
                  >
                    <option value="date" className="bg-black">Par date</option>
                    <option value="distance" className="bg-black">Par distance</option>
                    <option value="duration" className="bg-black">Par durée</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'list'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-black shadow-lg'
                        : 'text-orange-300 hover:text-white'
                    }`}
                  >
                    Liste
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('chart')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'chart'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-black shadow-lg'
                        : 'text-orange-300 hover:text-white'
                    }`}
                  >
                    Graphiques
                  </motion.button>
                </div>

                {/* New Workout Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                >
                  <Play className="w-4 h-4" />
                  <span>Nouvelle séance</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {filteredWorkouts.map((workout, index) => {
                const typeConfig = getTypeConfig(workout.type);
                const TypeIcon = typeConfig.icon;

                return (
                  <motion.div
                    key={workout.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01, x: 5 }}
                    className="group relative"
                  >
                    {/* Glow Effect */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${typeConfig.gradient} rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity`} />

                    <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 transition-all">

                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          {/* Animated Icon */}
                          <motion.div
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${typeConfig.bg} backdrop-blur-sm flex items-center justify-center border border-white/10 relative`}
                          >
                            <TypeIcon className="w-8 h-8 text-white" />
                            {workout.aiScore && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center">
                                <span className="text-xs font-black text-black">{workout.aiScore}</span>
                              </div>
                            )}
                          </motion.div>

                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-black text-white">{workout.type}</h3>
                              <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${typeConfig.bg} ${typeConfig.text} border ${typeConfig.border}`}>
                                {workout.type}
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-emerald-300/80">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(workout.date)}</span>
                              </div>
                              {workout.route && (
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4" />
                                  <span>{workout.route.name}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <span className="text-xs bg-black/30 px-2 py-1 rounded-full">{workout.weather}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Menu */}
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-white/60 hover:text-cyan-400 transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-white/60 hover:text-emerald-400 transition-colors"
                          >
                            <Edit className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-white/60 hover:text-purple-400 transition-colors"
                          >
                            <Share className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-white/60 hover:text-white transition-colors"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                        <div className="text-center bg-black/20 rounded-lg p-3 border border-white/5">
                          <MapPin className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                          <p className="text-xs text-white/60">Distance</p>
                          <p className="text-lg font-black text-white">{workout.distance} km</p>
                        </div>
                        <div className="text-center bg-black/20 rounded-lg p-3 border border-white/5">
                          <Timer className="w-5 h-5 text-green-400 mx-auto mb-2" />
                          <p className="text-xs text-white/60">Durée</p>
                          <p className="text-lg font-black text-white">{formatDuration(workout.duration)}</p>
                        </div>
                        <div className="text-center bg-black/20 rounded-lg p-3 border border-white/5">
                          <Gauge className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                          <p className="text-xs text-white/60">Allure</p>
                          <p className="text-lg font-black text-white">{workout.pace}/km</p>
                        </div>
                        <div className="text-center bg-black/20 rounded-lg p-3 border border-white/5">
                          <Heart className="w-5 h-5 text-red-400 mx-auto mb-2 animate-pulse" />
                          <p className="text-xs text-white/60">FC moy.</p>
                          <p className="text-lg font-black text-white">{workout.avgHeartRate}</p>
                        </div>
                        <div className="text-center bg-black/20 rounded-lg p-3 border border-white/5">
                          <Flame className="w-5 h-5 text-orange-400 mx-auto mb-2" />
                          <p className="text-xs text-white/60">Calories</p>
                          <p className="text-lg font-black text-white">{workout.calories}</p>
                        </div>
                        <div className="text-center bg-black/20 rounded-lg p-3 border border-white/5">
                          <TrendingUp className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                          <p className="text-xs text-white/60">D+</p>
                          <p className="text-lg font-black text-white">{workout.elevation}m</p>
                        </div>
                      </div>

                      {/* Performance Indicators */}
                      {(workout.aiScore || workout.efficiency) && (
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          {workout.aiScore && (
                            <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-xl p-4 border border-cyan-500/30">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-lg flex items-center justify-center">
                                  <Sparkles className="w-4 h-4 text-black" />
                                </div>
                                <div>
                                  <p className="text-xs text-cyan-300 font-medium">Score IA</p>
                                  <p className="text-lg font-black text-white">{workout.aiScore}%</p>
                                </div>
                              </div>
                            </div>
                          )}
                          {workout.efficiency && (
                            <div className="bg-gradient-to-r from-emerald-900/30 to-green-900/30 rounded-xl p-4 border border-emerald-500/30">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-400 rounded-lg flex items-center justify-center">
                                  <Target className="w-4 h-4 text-black" />
                                </div>
                                <div>
                                  <p className="text-xs text-emerald-300 font-medium">Efficacité</p>
                                  <p className="text-lg font-black text-white">{workout.efficiency}%</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Notes */}
                      {workout.notes && (
                        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-4 border border-purple-500/30">
                          <div className="flex items-start space-x-3">
                            <Trophy className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-purple-300 font-medium mb-1">Notes de performance</p>
                              <p className="text-sm text-white/90">{workout.notes}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {filteredWorkouts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Activity className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Aucune séance trouvée</h3>
                  <p className="text-white/60">Modifiez vos critères de recherche ou créez une nouvelle séance</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-black font-bold rounded-xl"
                  >
                    <Play className="w-4 h-4 inline mr-2" />
                    Créer une séance
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="chart"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Enhanced Distance Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Évolution des distances</h3>
                      <p className="text-xs text-emerald-300/60">Progression au fil du temps</p>
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="distanceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6EE7B7', fontSize: 12 }} />
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

              {/* Enhanced Pace vs Heart Rate */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-pink-400 rounded-xl flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Allure vs Fréquence cardiaque</h3>
                      <p className="text-xs text-red-300/60">Corrélation performance-effort</p>
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="pace" name="Allure (s/km)" axisLine={false} tickLine={false} tick={{ fill: '#FBBF24', fontSize: 12 }} />
                        <YAxis dataKey="heartRate" name="FC (bpm)" axisLine={false} tickLine={false} tick={{ fill: '#FBBF24', fontSize: 12 }} />
                        <Tooltip
                          cursor={{ strokeDasharray: '3 3' }}
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '12px',
                            color: 'white'
                          }}
                        />
                        <Scatter dataKey="heartRate" fill="#EF4444" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Performance Trends */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Tendances de performance</h3>
                      <p className="text-xs text-blue-300/60">Évolution multi-métriques</p>
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#93C5FD', fontSize: 12 }} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#93C5FD', fontSize: 12 }} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#93C5FD', fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid rgba(59,130,246,0.3)',
                            borderRadius: '12px',
                            color: 'white'
                          }}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="pace"
                          stroke="#10B981"
                          strokeWidth={3}
                          name="Allure (s/km)"
                          dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                          activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="heartRate"
                          stroke="#EF4444"
                          strokeWidth={3}
                          name="FC moyenne"
                          dot={{ fill: '#EF4444', strokeWidth: 2, r: 6 }}
                          activeDot={{ r: 8, stroke: '#EF4444', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Workouts;