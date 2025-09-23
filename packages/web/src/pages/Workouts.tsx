import React, { useState, useEffect } from 'react';
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
  Heart
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
}

const Workouts: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'distance' | 'duration'>('date');
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');
  const [isLoading, setIsLoading] = useState(true);
  // const [selectedWorkout] = useState<Workout | null>(null);

  // Mock data for workouts
  useEffect(() => {
    const mockWorkouts: Workout[] = [
      {
        id: '1',
        date: '2024-01-15',
        type: 'Endurance',
        distance: 10.5,
        duration: 52,
        pace: '4:57',
        avgHeartRate: 145,
        calories: 687,
        elevation: 120,
        weather: 'Ensoleillé',
        route: {
          name: 'Parc des Buttes-Chaumont',
          coordinates: [[2.3822, 48.8799], [2.3833, 48.8811]]
        },
        notes: 'Excellente séance, bon rythme maintenu'
      },
      {
        id: '2',
        date: '2024-01-12',
        type: 'Fractionné',
        distance: 8.2,
        duration: 35,
        pace: '4:16',
        avgHeartRate: 168,
        calories: 512,
        elevation: 45,
        weather: 'Nuageux',
        notes: '6x800m avec récupération 2min'
      },
      {
        id: '3',
        date: '2024-01-10',
        type: 'Récupération',
        distance: 5.0,
        duration: 28,
        pace: '5:36',
        avgHeartRate: 125,
        calories: 298,
        elevation: 15,
        weather: 'Pluvieux'
      },
      {
        id: '4',
        date: '2024-01-08',
        type: 'Course longue',
        distance: 18.3,
        duration: 98,
        pace: '5:21',
        avgHeartRate: 152,
        calories: 1245,
        elevation: 280,
        weather: 'Ensoleillé',
        route: {
          name: 'Bois de Vincennes',
          coordinates: [[2.4089, 48.8247], [2.4234, 48.8356]]
        },
        notes: 'Préparation semi-marathon, bon feeling'
      },
      {
        id: '5',
        date: '2024-01-05',
        type: 'Tempo',
        distance: 12.0,
        duration: 56,
        pace: '4:40',
        avgHeartRate: 158,
        calories: 756,
        elevation: 95,
        weather: 'Froid'
      }
    ];

    setTimeout(() => {
      setWorkouts(mockWorkouts);
      setFilteredWorkouts(mockWorkouts);
      setIsLoading(false);
    }, 1000);
  }, []);

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

  const getTypeColor = (type: string): string => {
    const colors = {
      'Endurance': 'bg-blue-100 text-blue-800',
      'Fractionné': 'bg-red-100 text-red-800',
      'Récupération': 'bg-green-100 text-green-800',
      'Course longue': 'bg-purple-100 text-purple-800',
      'Tempo': 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Chart data preparation
  const chartData = workouts.map(workout => ({
    date: formatDate(workout.date),
    distance: workout.distance,
    pace: parseInt(workout.pace.split(':')[0]) * 60 + parseInt(workout.pace.split(':')[1]),
    heartRate: workout.avgHeartRate
  }));

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
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes entraînements</h1>
            <p className="text-gray-600 mt-1">
              {filteredWorkouts.length} séance{filteredWorkouts.length > 1 ? 's' : ''} trouvée{filteredWorkouts.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Liste
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'chart'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Graphiques
              </button>
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span>Nouvelle séance</span>
            </button>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher dans les entraînements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {workoutTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'Tous les types' : type}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'distance' | 'duration')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Trier par date</option>
              <option value="distance">Trier par distance</option>
              <option value="duration">Trier par durée</option>
            </select>
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
              className="space-y-4"
            >
              {filteredWorkouts.map((workout, index) => (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">{workout.type}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(workout.type)}`}>
                            {workout.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(workout.date)}</span>
                          {workout.route && (
                            <>
                              <MapPin className="w-4 h-4 ml-2" />
                              <span>{workout.route.name}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Share className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Distance</p>
                      <p className="text-lg font-semibold text-gray-900">{workout.distance} km</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Durée</p>
                      <p className="text-lg font-semibold text-gray-900">{formatDuration(workout.duration)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Allure</p>
                      <p className="text-lg font-semibold text-gray-900">{workout.pace}/km</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">FC moy.</p>
                      <p className="text-lg font-semibold text-gray-900 flex items-center justify-center space-x-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>{workout.avgHeartRate}</span>
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Calories</p>
                      <p className="text-lg font-semibold text-gray-900">{workout.calories}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">D+</p>
                      <p className="text-lg font-semibold text-gray-900">{workout.elevation}m</p>
                    </div>
                  </div>

                  {workout.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{workout.notes}</p>
                    </div>
                  )}
                </motion.div>
              ))}

              {filteredWorkouts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun entraînement trouvé</h3>
                  <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
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
              {/* Distance Chart */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Évolution des distances</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="distance"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Pace vs Heart Rate */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Allure vs Fréquence cardiaque</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="pace" name="Allure (s/km)" />
                    <YAxis dataKey="heartRate" name="FC (bpm)" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter dataKey="heartRate" fill="#EF4444" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Trends */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Tendances de performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="pace"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Allure (s/km)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="heartRate"
                      stroke="#EF4444"
                      strokeWidth={2}
                      name="FC moyenne"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Workouts;