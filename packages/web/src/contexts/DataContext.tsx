import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface WorkoutData {
  id: string;
  date: string;
  type: 'course' | 'fractionné' | 'endurance' | 'récupération';
  duration: number; // en minutes
  distance: number; // en km
  pace: string; // format "mm:ss"
  heartRate?: number;
  calories?: number;
  notes?: string;
}

export interface StatsData {
  totalDistance: number;
  totalWorkouts: number;
  averagePace: string;
  totalTime: number; // en minutes
  currentWeekDistance: number;
  monthlyDistances: { month: string; distance: number }[];
  weeklyProgress: { week: string; distance: number }[];
}

export interface GoalData {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  category: string;
  status: 'active' | 'completed' | 'paused';
  createdDate: string;
}

export interface UserData {
  workouts: WorkoutData[];
  stats: StatsData;
  goals: GoalData[];
  trainingPlan: any[];
  profile: {
    name: string;
    email: string;
    preferences: {
      units: 'metric' | 'imperial';
      theme: 'light' | 'dark';
    };
  };
}

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

    return {
      totalDistance,
      totalWorkouts,
      averagePace,
      totalTime,
      currentWeekDistance,
      monthlyDistances: [], // À calculer selon les besoins
      weeklyProgress: [] // À calculer selon les besoins
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