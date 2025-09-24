import React, { useState, useEffect } from 'react';
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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  Activity,
  Heart,
  Clock,
  Calendar,
  Target,
  MapPin,
  Flame,
  Award,
  Gauge,
  Trophy,
  Timer,
  Zap,
  Brain,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  Share2,
  RefreshCw
} from 'lucide-react';

interface StatsData {
  performance: {
    totalDistance: number;
    totalTime: number;
    totalSessions: number;
    avgPace: string;
    bestPace: string;
    totalCalories: number;
    avgHeartRate: number;
    maxHeartRate: number;
  };
  trends: {
    distanceChange: number;
    paceImprovement: number;
    consistencyScore: number;
    fitnessLevel: number;
  };
  monthlyData: Array<{
    month: string;
    distance: number;
    sessions: number;
    avgPace: number;
    calories: number;
  }>;
  weeklyData: Array<{
    week: string;
    distance: number;
    intensity: number;
    recovery: number;
  }>;
  paceZones: Array<{
    zone: string;
    time: number;
    percentage: number;
    color: string;
  }>;
  workoutTypes: Array<{
    type: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  fitnessMetrics: Array<{
    metric: string;
    current: number;
    max: number;
  }>;
}

const Stats: React.FC = () => {
  const { userData, isDataLoaded } = useData();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'distance' | 'pace' | 'heartRate'>('distance');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isDataLoaded) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isDataLoaded]);

  // Fonction pour filtrer les workouts par période
  const getFilteredWorkouts = (workouts: any[], range: 'week' | 'month' | 'year') => {
    const now = new Date();
    const startDate = new Date();

    switch (range) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return workouts.filter(workout => new Date(workout.date) >= startDate);
  };

  // Générer des statistiques basées sur les données réelles et filtrées
  const filteredWorkouts = getFilteredWorkouts(userData.workouts, timeRange);
  const statsData: StatsData = filteredWorkouts.length > 0 ? {
    performance: {
      totalDistance: filteredWorkouts.reduce((sum, w) => sum + w.distance, 0),
      totalTime: filteredWorkouts.reduce((sum, w) => sum + w.duration, 0),
      totalSessions: filteredWorkouts.length,
      avgPace: (() => {
        const totalSeconds = filteredWorkouts.reduce((sum, w) => {
          const [min, sec] = w.pace.split(':').map(Number);
          return sum + (min * 60 + sec);
        }, 0);
        const avgSeconds = totalSeconds / filteredWorkouts.length;
        const avgMin = Math.floor(avgSeconds / 60);
        const avgSec = Math.floor(avgSeconds % 60);
        return `${avgMin}:${avgSec.toString().padStart(2, '0')}`;
      })(),
      bestPace: filteredWorkouts.reduce((best, workout) => {
        const [min, sec] = workout.pace.split(':').map(Number);
        const seconds = min * 60 + sec;
        const [bestMin, bestSec] = best.split(':').map(Number);
        const bestSeconds = bestMin * 60 + bestSec;
        return seconds < bestSeconds ? workout.pace : best;
      }, filteredWorkouts[0].pace),
      totalCalories: filteredWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0),
      avgHeartRate: filteredWorkouts.filter(w => w.heartRate).length > 0
        ? Math.round(filteredWorkouts
            .filter(w => w.heartRate)
            .reduce((sum, w) => sum + (w.heartRate || 0), 0) /
          filteredWorkouts.filter(w => w.heartRate).length)
        : 0,
      maxHeartRate: filteredWorkouts.filter(w => w.heartRate).length > 0
        ? Math.max(...filteredWorkouts.filter(w => w.heartRate).map(w => w.heartRate || 0))
        : 0
    },
    trends: {
      distanceChange: 0, // À calculer plus tard
      paceImprovement: 0, // À calculer plus tard
      consistencyScore: 0, // À calculer plus tard
      fitnessLevel: 0 // À calculer plus tard
    },
    monthlyData: (() => {
      // Générer les données mensuelles basées sur les workouts filtrés
      const monthlyStats = filteredWorkouts.reduce((acc, workout) => {
        const date = new Date(workout.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!acc[monthKey]) {
          acc[monthKey] = {
            month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
            distance: 0,
            sessions: 0,
            avgPace: 0,
            calories: 0,
            totalPaceSeconds: 0
          };
        }

        acc[monthKey].distance += workout.distance;
        acc[monthKey].sessions += 1;
        acc[monthKey].calories += workout.calories || 0;

        const [min, sec] = workout.pace.split(':').map(Number);
        acc[monthKey].totalPaceSeconds += (min * 60 + sec);

        return acc;
      }, {} as Record<string, any>);

      return Object.values(monthlyStats).map((month: any) => ({
        ...month,
        avgPace: Math.round(month.totalPaceSeconds / month.sessions),
        distance: Math.round(month.distance * 100) / 100
      })).sort((a: any, b: any) => a.month.localeCompare(b.month));
    })(),
    weeklyData: (() => {
      // Générer les données hebdomadaires basées sur les workouts filtrés
      const weeklyStats = filteredWorkouts.reduce((acc, workout) => {
        const date = new Date(workout.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!acc[weekKey]) {
          acc[weekKey] = {
            week: weekStart.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
            distance: 0,
            intensity: 0,
            sessions: 0
          };
        }

        acc[weekKey].distance += workout.distance;
        acc[weekKey].sessions += 1;
        // Intensité basée sur la durée et la fréquence cardiaque si disponible
        acc[weekKey].intensity = Math.min(100, (workout.heartRate || 50) / 2);

        return acc;
      }, {} as Record<string, any>);

      return Object.values(weeklyStats).map((week: any) => ({
        ...week,
        distance: Math.round(week.distance * 100) / 100
      })).sort((a: any, b: any) => a.week.localeCompare(b.week));
    })(),
    paceZones: (() => {
      if (filteredWorkouts.length === 0) {
        return [{ zone: 'Aucune donnée', time: 0, percentage: 100, color: '#6B7280' }];
      }

      // Calculer les zones de pace basées sur les données réelles
      const paceSeconds = filteredWorkouts.map(w => {
        const [min, sec] = w.pace.split(':').map(Number);
        return min * 60 + sec;
      }).sort((a, b) => a - b);

      const avgPace = paceSeconds.reduce((sum, pace) => sum + pace, 0) / paceSeconds.length;

      // Définir les zones de pace (en secondes par km)
      const zones = [
        { name: 'Très rapide', min: 0, max: avgPace - 60, color: '#EF4444' },
        { name: 'Rapide', min: avgPace - 60, max: avgPace - 20, color: '#F59E0B' },
        { name: 'Modérée', min: avgPace - 20, max: avgPace + 20, color: '#10B981' },
        { name: 'Lente', min: avgPace + 20, max: avgPace + 60, color: '#3B82F6' },
        { name: 'Très lente', min: avgPace + 60, max: Infinity, color: '#8B5CF6' }
      ];

      // Calculer les pourcentages pour chaque zone
      const zoneStats = zones.map(zone => {
        const workoutsInZone = paceSeconds.filter(pace => pace >= zone.min && pace < zone.max);
        const percentage = Math.round((workoutsInZone.length / paceSeconds.length) * 100);
        return {
          zone: zone.name,
          time: workoutsInZone.length,
          percentage,
          color: zone.color
        };
      }).filter(zone => zone.percentage > 0); // Ne garder que les zones avec des données

      return zoneStats.length > 0 ? zoneStats : [{ zone: 'Aucune donnée', time: 0, percentage: 100, color: '#6B7280' }];
    })(),
    workoutTypes: (() => {
      const typeCount = filteredWorkouts.reduce((acc, workout) => {
        const type = workout.type.charAt(0).toUpperCase() + workout.type.slice(1);
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const total = Object.values(typeCount).reduce((sum, count) => sum + count, 0);

      return Object.entries(typeCount).map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / total) * 100),
        color: type === 'Course' ? '#10B981' :
               type === 'Fractionné' ? '#F59E0B' :
               type === 'Endurance' ? '#3B82F6' : '#EF4444'
      }));
    })(),
    fitnessMetrics: (() => {
      // Calculs IA basés sur les données réelles d'entraînement

      // Endurance : basée sur la distance totale et la fréquence des entraînements longs
      const longRuns = filteredWorkouts.filter(w => w.distance > 10).length;
      const totalDistance = filteredWorkouts.reduce((sum, w) => sum + w.distance, 0);
      const enduranceScore = Math.min(100, Math.round((totalDistance / filteredWorkouts.length * 2) + (longRuns * 10)));

      // Vitesse : basée sur la pace moyenne et les entraînements fractionnés
      const intervalWorkouts = filteredWorkouts.filter(w => w.type === 'fractionné').length;
      const avgPaceSeconds = filteredWorkouts.reduce((sum, w) => {
        const [min, sec] = w.pace.split(':').map(Number);
        return sum + (min * 60 + sec);
      }, 0) / filteredWorkouts.length;
      // Inversion : plus la pace est rapide, plus le score est élevé (6:00 = 80pts, 4:00 = 100pts)
      const speedScore = Math.min(100, Math.max(0, Math.round(100 - (avgPaceSeconds - 240) / 3.6) + (intervalWorkouts * 5)));

      // Force : basée sur les entraînements en côte, la régularité et l'intensité
      const regularityScore = Math.min(100, (filteredWorkouts.length / (timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365)) * 100);
      const forceScore = Math.round((regularityScore * 0.7) + (intervalWorkouts * 3));

      // Récupération : basée sur la FC moyenne et les entraînements de récupération
      const recoveryWorkouts = filteredWorkouts.filter(w => w.type === 'récupération').length;
      const avgHR = filteredWorkouts.filter(w => w.heartRate).length > 0
        ? filteredWorkouts.reduce((sum, w) => sum + (w.heartRate || 0), 0) / filteredWorkouts.filter(w => w.heartRate).length
        : 150;
      // Plus la FC est basse, meilleure est la récupération
      const recoveryScore = Math.min(100, Math.max(20, Math.round(100 - (avgHR - 120) / 2) + (recoveryWorkouts * 5)));

      // Technique : basée sur la consistance de la pace et la variété des entraînements
      const paceVariability = filteredWorkouts.reduce((sum, w, i, arr) => {
        if (i === 0) return 0;
        const currentPace = w.pace.split(':').reduce((min, sec) => parseInt(min) * 60 + parseInt(sec));
        const prevPace = arr[i-1].pace.split(':').reduce((min, sec) => parseInt(min) * 60 + parseInt(sec));
        return sum + Math.abs(currentPace - prevPace);
      }, 0) / Math.max(1, filteredWorkouts.length - 1);
      const workoutVariety = new Set(filteredWorkouts.map(w => w.type)).size;
      const techniqueScore = Math.min(100, Math.max(30, Math.round(100 - (paceVariability / 10)) + (workoutVariety * 10)));

      // Mental : basée sur la consistance des entraînements et la progression
      const consistency = filteredWorkouts.length >= 3 ?
        Math.min(100, (filteredWorkouts.length / Math.max(1, (timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365) / 7)) * 30) : 20;
      const mentalScore = Math.min(100, Math.max(40, Math.round(consistency + (longRuns * 5) + (intervalWorkouts * 3))));

      return [
        { metric: 'Endurance', current: enduranceScore, max: 100 },
        { metric: 'Vitesse', current: speedScore, max: 100 },
        { metric: 'Force', current: forceScore, max: 100 },
        { metric: 'Récupération', current: recoveryScore, max: 100 },
        { metric: 'Technique', current: techniqueScore, max: 100 },
        { metric: 'Mental', current: mentalScore, max: 100 }
      ];
    })()
  } : {
    performance: {
      totalDistance: 0,
      totalTime: 0,
      totalSessions: 0,
      avgPace: '0:00',
      bestPace: '0:00',
      totalCalories: 0,
      avgHeartRate: 0,
      maxHeartRate: 0
    },
    trends: {
      distanceChange: 0,
      paceImprovement: 0,
      consistencyScore: 0,
      fitnessLevel: 0
    },
    monthlyData: [],
    weeklyData: [],
    paceZones: [
      { zone: 'Aucune donnée', time: 0, percentage: 100, color: '#6B7280' }
    ],
    workoutTypes: [
      { type: 'Aucune donnée', count: 0, percentage: 100, color: '#6B7280' }
    ],
    fitnessMetrics: [
      { metric: 'Endurance', current: 0, max: 100 },
      { metric: 'Vitesse', current: 0, max: 100 },
      { metric: 'Force', current: 0, max: 100 },
      { metric: 'Récupération', current: 0, max: 100 },
      { metric: 'Technique', current: 0, max: 100 },
      { metric: 'Mental', current: 0, max: 100 }
    ]
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatPace = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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


  return (
    <>
      <Helmet>
        <title>Statistiques | RunCoach AI</title>
        <meta name="description" content="Analyses détaillées de vos performances de course à pied avec statistiques avancées et insights IA" />
        <meta property="og:title" content="Statistiques RunCoach AI" />
        <meta property="og:description" content="Visualisez vos progrès et performances avec des analyses poussées" />
        <link rel="canonical" href="/stats" />
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
              className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400"
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
              Analytics Elite
            </motion.h1>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2"
            >
              <BarChart3 className="w-6 h-6 text-yellow-400" />
            </motion.div>
          </div>

          <motion.p
            className="text-lg text-emerald-100/80 max-w-2xl mx-auto font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Analyses avancées • Insights IA • Performance tracking • Prédictions
          </motion.p>

          {/* Control Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center items-center space-x-4"
          >
            <div className="flex bg-black/40 backdrop-blur-xl rounded-xl p-1 border border-blue-500/30">
              {(['week', 'month', 'year'] as const).map((range) => (
                <motion.button
                  key={range}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-black shadow-lg'
                      : 'text-blue-300 hover:text-white'
                  }`}
                >
                  {range === 'week' ? 'Semaine' : range === 'month' ? 'Mois' : 'Année'}
                </motion.button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-white/60 hover:text-cyan-400 transition-colors"
              >
                <Download className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-white/60 hover:text-emerald-400 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-white/60 hover:text-blue-400 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            {
              title: 'Distance totale',
              value: `${statsData.performance.totalDistance.toFixed(2)}`,
              unit: 'km',
              change: `+${statsData.trends.distanceChange}%`,
              changeType: 'up',
              icon: MapPin,
              gradient: 'from-blue-400 to-cyan-400',
              bgGradient: 'from-blue-900/20 to-cyan-900/20'
            },
            {
              title: 'Temps total',
              value: formatDuration(statsData.performance.totalTime),
              change: '+12.5%',
              changeType: 'up',
              icon: Clock,
              gradient: 'from-emerald-400 to-green-400',
              bgGradient: 'from-emerald-900/20 to-green-900/20'
            },
            {
              title: 'Allure moyenne',
              value: statsData.performance.avgPace,
              unit: '/km',
              change: `${statsData.trends.paceImprovement}%`,
              changeType: 'down',
              icon: Gauge,
              gradient: 'from-purple-400 to-pink-400',
              bgGradient: 'from-purple-900/20 to-pink-900/20'
            },
            {
              title: 'Niveau fitness',
              value: `${statsData.trends.fitnessLevel}`,
              unit: '%',
              change: '+8.2%',
              changeType: 'up',
              icon: Trophy,
              gradient: 'from-orange-400 to-red-400',
              bgGradient: 'from-orange-900/20 to-red-900/20'
            }
          ].map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative group cursor-pointer"
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${kpi.gradient} rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition-opacity`} />

                {/* Card Content */}
                <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white/60">{kpi.title}</p>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-3xl font-black text-white">{kpi.value}</span>
                        {kpi.unit && (
                          <span className="text-lg font-semibold text-white/60">{kpi.unit}</span>
                        )}
                      </div>
                    </div>

                    {/* Animated Icon */}
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.bgGradient} backdrop-blur-sm flex items-center justify-center border border-white/10`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>

                  {/* Change Indicator */}
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      kpi.changeType === 'up'
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {kpi.changeType === 'up' ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : (
                        <ArrowDown className="w-3 h-3" />
                      )}
                      <span>{kpi.change}</span>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center space-x-1">
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          className={`w-1 h-6 rounded-full ${
                            i < (kpi.changeType === 'up' ? 4 : 2)
                              ? `bg-gradient-to-t ${kpi.gradient}`
                              : 'bg-white/10'
                          }`}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Monthly Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Progression mensuelle</h3>
                    <p className="text-xs text-emerald-300/60">Évolution de vos performances</p>
                  </div>
                </div>

                {/* Metric Selector */}
                <div className="flex bg-black/40 rounded-lg p-1">
                  {(['distance', 'pace', 'heartRate'] as const).map((metric) => (
                    <motion.button
                      key={metric}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedMetric(metric)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                        selectedMetric === metric
                          ? 'bg-emerald-500 text-black'
                          : 'text-emerald-400 hover:text-white'
                      }`}
                    >
                      {metric === 'distance' ? 'Distance' : metric === 'pace' ? 'Allure' : 'FC'}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={statsData.monthlyData}>
                    <defs>
                      <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6EE7B7', fontSize: 12 }} />
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
                      dataKey={selectedMetric === 'distance' ? 'distance' : selectedMetric === 'pace' ? 'avgPace' : 'sessions'}
                      stroke="#10B981"
                      strokeWidth={3}
                      fill="url(#monthlyGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Fitness Radar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Profil athlétique IA</h3>
                  <p className="text-xs text-purple-300/60">Analyse multidimensionnelle</p>
                </div>
              </div>

              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={statsData.fitnessMetrics}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#C084FC', fontSize: 12 }} />
                    <PolarRadiusAxis
                      angle={45}
                      domain={[0, 100]}
                      tick={{ fill: '#C084FC', fontSize: 10 }}
                      axisLine={false}
                    />
                    <Radar
                      name="Current"
                      dataKey="current"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                      strokeWidth={3}
                      dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(139,92,246,0.3)',
                        borderRadius: '12px',
                        color: 'white'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Pace Zones Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Distribution zones d'allure</h3>
                  <p className="text-xs text-orange-300/60">Répartition de votre effort</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={statsData.paceZones}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="time"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {statsData.paceZones.map((entry, index) => (
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
                  {statsData.paceZones.map((zone, index) => (
                    <motion.div
                      key={zone.zone}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/5"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full shadow-lg"
                          style={{ backgroundColor: zone.color }}
                        />
                        <div>
                          <span className="text-sm font-medium text-white">{zone.zone}</span>
                          <p className="text-xs text-white/60">{zone.time}min</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-white">{zone.percentage}%</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Workout Types Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Types d'entraînement</h3>
                  <p className="text-xs text-cyan-300/60">Répartition et efficacité</p>
                </div>
              </div>

              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={statsData.workoutTypes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fill: '#67E8F9', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#67E8F9', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(6,182,212,0.3)',
                        borderRadius: '12px',
                        color: 'white'
                      }}
                    />
                    <Bar dataKey="count" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>

        {/* AI Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-xl opacity-60" />
          <motion.div
            animate={{
              background: [
                'linear-gradient(45deg, rgba(79,70,229,0.1), rgba(139,92,246,0.1), rgba(236,72,153,0.1))',
                'linear-gradient(45deg, rgba(236,72,153,0.1), rgba(79,70,229,0.1), rgba(139,92,246,0.1))',
                'linear-gradient(45deg, rgba(139,92,246,0.1), rgba(236,72,153,0.1), rgba(79,70,229,0.1))'
              ]
            }}
            transition={{ duration: 5, repeat: Infinity }}
            className="relative bg-black/70 backdrop-blur-2xl rounded-3xl p-8 border border-purple-500/30 shadow-2xl"
          >
            <div className="flex items-center space-x-4 mb-6">
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center relative"
                whileHover={{ rotate: 5 }}
              >
                <Sparkles className="w-8 h-8 text-white" />
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl opacity-30"
                />
              </motion.div>
              <div>
                <h3 className="text-2xl font-black text-white mb-1">Insights IA Elite</h3>
                <p className="text-purple-300/80">Analyses prédictives et recommandations personnalisées</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Prédiction Performance',
                  content: 'Votre allure devrait s\'améliorer de 8-12 secondes sur 10km d\'ici 4 semaines avec votre progression actuelle.',
                  icon: TrendingUp,
                  color: 'from-green-400 to-emerald-400'
                },
                {
                  title: 'Zone d\'Optimisation',
                  content: 'Augmentez votre volume en Zone 2 de 15% pour améliorer votre endurance aérobie de base.',
                  icon: Target,
                  color: 'from-blue-400 to-cyan-400'
                },
                {
                  title: 'Risque Blessure',
                  content: 'Risque faible (12%). Maintenez 48h de récupération entre séances intensives.',
                  icon: Heart,
                  color: 'from-orange-400 to-red-400'
                }
              ].map((insight, index) => (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${insight.color} flex items-center justify-center`}>
                      <insight.icon className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-sm font-bold text-white">{insight.title}</h4>
                  </div>
                  <p className="text-sm text-white/80">{insight.content}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default Stats;