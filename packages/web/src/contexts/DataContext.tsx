import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import type { WorkoutData, StatsData, GoalData, UserData } from '../shared/types';

// Ré-exports pour compatibilité
export type { WorkoutData, StatsData, GoalData, UserData } from '../shared/types';

interface DataContextType {
  userData: UserData;
  updateWorkouts: (workouts: WorkoutData[]) => void;
  addWorkout: (workout: WorkoutData) => void;
  updateStats: () => void;
  addGoal: (goal: GoalData) => void;
  updateGoal: (goalId: string, updates: Partial<GoalData>) => void;
  resetUserData: () => void;
  isDataLoaded: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

const getEmptyUserData = (user: any): UserData => ({
  workouts: [],
  stats: {
    totalDistance: 0,
    totalWorkouts: 0,
    averagePace: "0:00",
    totalTime: 0,
    currentWeekDistance: 0,
    monthlyDistances: [],
    weeklyProgress: []
  },
  goals: [],
  trainingPlan: [],
  profile: {
    name: user?.name || 'Utilisateur',
    email: user?.email || '',
    preferences: {
      units: 'metric',
      theme: 'dark'
    }
  }
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData>(getEmptyUserData(user));
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Charger les données utilisateur depuis le localStorage
  useEffect(() => {
    if (user?.id) {
      const savedData = localStorage.getItem(`userData_${user.id}`);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setUserData({
            ...getEmptyUserData(user),
            ...parsedData,
            profile: {
              ...getEmptyUserData(user).profile,
              ...parsedData.profile,
              name: user.name,
              email: user.email
            }
          });
        } catch (error) {
          console.error('Erreur lors du chargement des données utilisateur:', error);
          setUserData(getEmptyUserData(user));
        }
      } else {
        setUserData(getEmptyUserData(user));
      }
      setIsDataLoaded(true);
    }
  }, [user]);

  // Sauvegarder les données dans le localStorage à chaque changement
  const saveUserData = (data: UserData) => {
    if (user?.id) {
      localStorage.setItem(`userData_${user.id}`, JSON.stringify(data));
    }
  };

  const updateWorkouts = (workouts: WorkoutData[]) => {
    console.log('DataContext updateWorkouts called with', workouts.length, 'workouts');

    // Calculer les nouvelles stats avec les nouveaux workouts
    const newStats = calculateStats(workouts);
    console.log('Calculated stats:', newStats);

    // Créer les nouvelles données complètes
    const newData = { ...userData, workouts, stats: newStats };

    // Mettre à jour l'état et sauvegarder
    setUserData(newData);
    saveUserData(newData);

    console.log('UserData updated, localStorage saved');
  };

  const calculateStats = (workouts: WorkoutData[]) => {
    if (!workouts.length) {
      return {
        totalDistance: 0,
        totalWorkouts: 0,
        averagePace: "0:00",
        totalTime: 0,
        currentWeekDistance: 0,
        monthlyDistances: [],
        weeklyProgress: []
      };
    }

    const totalDistance = workouts.reduce((sum, w) => sum + w.distance, 0);
    const totalTime = workouts.reduce((sum, w) => sum + w.duration, 0);
    const totalWorkouts = workouts.length;

    // Calcul de la pace moyenne
    const averagePaceSeconds = workouts.reduce((sum, w) => {
      const [min, sec] = w.pace.split(':').map(Number);
      return sum + (min * 60 + sec);
    }, 0) / totalWorkouts;

    const avgMin = Math.floor(averagePaceSeconds / 60);
    const avgSec = Math.floor(averagePaceSeconds % 60);
    const averagePace = `${avgMin}:${avgSec.toString().padStart(2, '0')}`;

    // Distance de la semaine courante
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const currentWeekDistance = workouts
      .filter(w => new Date(w.date) >= weekStart)
      .reduce((sum, w) => sum + w.distance, 0);

    // 🚀 NOUVELLES STATISTIQUES ÉTENDUES

    // Dénivelé total
    const totalElevationGain = workouts
      .filter(w => w.elevation?.gain)
      .reduce((sum, w) => sum + (w.elevation?.gain || 0), 0);

    // Cadence moyenne
    const workoutsWithCadence = workouts.filter(w => w.cadence);
    const averageCadence = workoutsWithCadence.length > 0
      ? Math.round(workoutsWithCadence.reduce((sum, w) => sum + (w.cadence || 0), 0) / workoutsWithCadence.length)
      : undefined;

    // Puissance moyenne
    const workoutsWithPower = workouts.filter(w => w.power);
    const averagePower = workoutsWithPower.length > 0
      ? Math.round(workoutsWithPower.reduce((sum, w) => sum + (w.power || 0), 0) / workoutsWithPower.length)
      : undefined;

    // FC moyenne
    const workoutsWithHR = workouts.filter(w => w.heartRate);
    const averageHeartRate = workoutsWithHR.length > 0
      ? Math.round(workoutsWithHR.reduce((sum, w) => sum + (w.heartRate || 0), 0) / workoutsWithHR.length)
      : undefined;

    // Statistiques météo
    const weatherStats = {
      clearDays: workouts.filter(w => w.weather?.condition?.toLowerCase().includes('clear')).length,
      rainyDays: workouts.filter(w => w.weather?.condition?.toLowerCase().includes('rain')).length,
      coldRuns: workouts.filter(w => w.weather?.temperature && w.weather.temperature < 10).length,
      hotRuns: workouts.filter(w => w.weather?.temperature && w.weather.temperature > 25).length,
    };

    // Métriques de performance
    const paceSeconds = workouts.map(w => {
      const [min, sec] = w.pace.split(':').map(Number);
      return min * 60 + sec;
    });
    const bestPaceSeconds = Math.min(...paceSeconds);
    const bestPaceMin = Math.floor(bestPaceSeconds / 60);
    const bestPaceSec = bestPaceSeconds % 60;
    const bestPace = `${bestPaceMin}:${Math.floor(bestPaceSec).toString().padStart(2, '0')}`;

    const performanceMetrics = {
      bestPace,
      longestRun: Math.max(...workouts.map(w => w.distance)),
      highestPower: Math.max(...workouts.filter(w => w.power).map(w => w.power || 0)),
      maxElevationGain: Math.max(...workouts.filter(w => w.elevation?.gain).map(w => w.elevation?.gain || 0))
    };

    return {
      totalDistance,
      totalWorkouts,
      averagePace,
      totalTime,
      currentWeekDistance,
      monthlyDistances: [], // À calculer selon les besoins
      weeklyProgress: [], // À calculer selon les besoins

      // Nouvelles statistiques
      totalElevationGain: totalElevationGain > 0 ? totalElevationGain : undefined,
      averageCadence,
      averagePower,
      averageHeartRate,
      weatherStats: weatherStats.clearDays + weatherStats.rainyDays + weatherStats.coldRuns + weatherStats.hotRuns > 0
        ? weatherStats
        : undefined,
      performanceMetrics
    };
  };

  const addWorkout = (workout: WorkoutData) => {
    const newWorkouts = [...userData.workouts, workout];
    updateWorkouts(newWorkouts);
  };

  const updateStats = () => {
    const newStats = calculateStats(userData.workouts);
    const newData = { ...userData, stats: newStats };
    setUserData(newData);
    saveUserData(newData);
  };

  const addGoal = (goal: GoalData) => {
    const newGoals = [...userData.goals, goal];
    const newData = { ...userData, goals: newGoals };
    setUserData(newData);
    saveUserData(newData);
  };

  const updateGoal = (goalId: string, updates: Partial<GoalData>) => {
    const newGoals = userData.goals.map(goal =>
      goal.id === goalId ? { ...goal, ...updates } : goal
    );
    const newData = { ...userData, goals: newGoals };
    setUserData(newData);
    saveUserData(newData);
  };


  const resetUserData = () => {
    const emptyData = getEmptyUserData(user);
    setUserData(emptyData);
    if (user?.id) {
      localStorage.removeItem(`userData_${user.id}`);
    }
  };

  return (
    <DataContext.Provider value={{
      userData,
      updateWorkouts,
      addWorkout,
      updateStats,
      addGoal,
      updateGoal,
      resetUserData,
      isDataLoaded
    }}>
      {children}
    </DataContext.Provider>
  );
};