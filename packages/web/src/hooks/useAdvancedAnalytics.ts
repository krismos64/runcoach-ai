import { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { apiService } from '../services/apiService';
import type {
  WorkoutAnalysis,
  PerformanceTrend,
  InjuryRiskAssessment,
  PerformancePrediction,
  AthleteComparison
} from '../shared/types';

export const useAdvancedAnalytics = () => {
  const { userData } = useData();
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États pour différents types d'analyse
  const [workoutAnalysis, setWorkoutAnalysis] = useState<WorkoutAnalysis | null>(null);
  const [performanceTrend, setPerformanceTrend] = useState<PerformanceTrend | null>(null);
  const [injuryRisk, setInjuryRisk] = useState<InjuryRiskAssessment | null>(null);
  const [performancePrediction, setPerformancePrediction] = useState<PerformancePrediction | null>(null);
  const [athleteComparison, setAthleteComparison] = useState<AthleteComparison | null>(null);

  // Test de connexion API au chargement
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const connected = await apiService.testConnection();
        setIsApiConnected(connected);
        if (!connected) {
          console.warn('Python API non disponible - fonctionnalités avancées désactivées');
        }
      } catch (error) {
        console.error('Erreur test connexion API:', error);
        setIsApiConnected(false);
      }
    };

    checkApiConnection();
  }, []);

  // Analyse de l'entraînement le plus récent
  const analyzeLatestWorkout = async () => {
    if (!isApiConnected || userData.workouts.length === 0) return null;

    setIsLoading(true);
    setError(null);

    try {
      const analysis = await apiService.analyzeWorkout(userData.workouts);
      setWorkoutAnalysis(analysis);
      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur analyse entraînement';
      setError(errorMessage);
      console.error('Erreur analyse workout:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Analyse des tendances de performance
  const analyzePerformanceTrends = async () => {
    if (!isApiConnected || userData.workouts.length < 3) return null;

    setIsLoading(true);
    setError(null);

    try {
      const trend = await apiService.analyzePerformanceTrend(userData.workouts);
      setPerformanceTrend(trend);
      return trend;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur analyse tendances';
      setError(errorMessage);
      console.error('Erreur analyse tendances:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Évaluation du risque de blessure
  const assessInjuryRisk = async () => {
    if (!isApiConnected || userData.workouts.length < 5) return null;

    setIsLoading(true);
    setError(null);

    try {
      const risk = await apiService.analyzeInjuryRisk(userData.workouts);
      setInjuryRisk(risk);
      return risk;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur évaluation risque';
      setError(errorMessage);
      console.error('Erreur évaluation risque:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Prédiction de performance
  const predictRaceTime = async (targetDistance: number, targetDate: string) => {
    if (!isApiConnected || userData.workouts.length < 5) return null;

    setIsLoading(true);
    setError(null);

    try {
      const prediction = await apiService.predictPerformance(
        userData.workouts,
        targetDistance,
        targetDate
      );
      setPerformancePrediction(prediction);
      return prediction;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur prédiction performance';
      setError(errorMessage);
      console.error('Erreur prédiction:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Comparaison avec d'autres athlètes
  const compareWithPeers = async (age: number, gender: string, experienceLevel: string) => {
    if (!isApiConnected || userData.workouts.length < 5) return null;

    setIsLoading(true);
    setError(null);

    try {
      const comparison = await apiService.compareAthleteProfile(
        userData.workouts,
        age,
        gender,
        experienceLevel
      );
      setAthleteComparison(comparison);
      return comparison;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur comparaison athlètes';
      setError(errorMessage);
      console.error('Erreur comparaison:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Analyse complète (toutes les analyses disponibles)
  const runCompleteAnalysis = async (userProfile?: {
    age: number;
    gender: string;
    experienceLevel: string;
  }) => {
    if (!isApiConnected) return null;

    setIsLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled([
        analyzeLatestWorkout(),
        analyzePerformanceTrends(),
        assessInjuryRisk(),
        userProfile ? compareWithPeers(userProfile.age, userProfile.gender, userProfile.experienceLevel) : null
      ]);

      const analyses = {
        workout: results[0].status === 'fulfilled' ? results[0].value : null,
        trend: results[1].status === 'fulfilled' ? results[1].value : null,
        injury: results[2].status === 'fulfilled' ? results[2].value : null,
        comparison: results[3] && results[3].status === 'fulfilled' ? results[3].value : null,
      };

      return analyses;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur analyse complète';
      setError(errorMessage);
      console.error('Erreur analyse complète:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Réinitialisation des données
  const clearAnalytics = () => {
    setWorkoutAnalysis(null);
    setPerformanceTrend(null);
    setInjuryRisk(null);
    setPerformancePrediction(null);
    setAthleteComparison(null);
    setError(null);
  };

  // Indicateurs de disponibilité des fonctionnalités
  const canAnalyzeWorkout = isApiConnected && userData.workouts.length > 0;
  const canAnalyzeTrends = isApiConnected && userData.workouts.length >= 3;
  const canAssessRisk = isApiConnected && userData.workouts.length >= 5;
  const canPredict = isApiConnected && userData.workouts.length >= 5;
  const canCompare = isApiConnected && userData.workouts.length >= 5;

  return {
    // État de l'API
    isApiConnected,
    isLoading,
    error,

    // Données d'analyse
    workoutAnalysis,
    performanceTrend,
    injuryRisk,
    performancePrediction,
    athleteComparison,

    // Fonctions d'analyse
    analyzeLatestWorkout,
    analyzePerformanceTrends,
    assessInjuryRisk,
    predictRaceTime,
    compareWithPeers,
    runCompleteAnalysis,
    clearAnalytics,

    // Indicateurs de disponibilité
    canAnalyzeWorkout,
    canAnalyzeTrends,
    canAssessRisk,
    canPredict,
    canCompare,

    // Métadonnées
    hasEnoughDataForBasicAnalysis: userData.workouts.length >= 3,
    hasEnoughDataForAdvancedAnalysis: userData.workouts.length >= 10,
    totalWorkouts: userData.workouts.length,
  };
};

// Hook spécialisé pour les prédictions de course
export const useRacePrediction = () => {
  const { predictRaceTime, isApiConnected, isLoading, error } = useAdvancedAnalytics();
  const [predictions, setPredictions] = useState<PerformancePrediction[]>([]);

  const addPrediction = async (distance: number, date: string) => {
    const prediction = await predictRaceTime(distance, date);
    if (prediction) {
      setPredictions(prev => [...prev, prediction]);
    }
    return prediction;
  };

  const clearPredictions = () => {
    setPredictions([]);
  };

  return {
    predictions,
    addPrediction,
    clearPredictions,
    isApiConnected,
    isLoading,
    error,
  };
};

// Hook pour l'analyse en temps réel
export const useRealtimeAnalysis = () => {
  const { userData } = useData();
  const analytics = useAdvancedAnalytics();
  const [autoAnalysisEnabled, setAutoAnalysisEnabled] = useState(false);

  // Auto-analyse quand de nouveaux workouts sont ajoutés
  useEffect(() => {
    if (autoAnalysisEnabled && analytics.isApiConnected && userData.workouts.length > 0) {
      const runAutoAnalysis = async () => {
        await analytics.analyzeLatestWorkout();
        if (userData.workouts.length >= 5) {
          await analytics.analyzePerformanceTrends();
          await analytics.assessInjuryRisk();
        }
      };

      // Délai pour éviter les appels trop fréquents
      const timeoutId = setTimeout(runAutoAnalysis, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [userData.workouts.length, autoAnalysisEnabled, analytics.isApiConnected]);

  return {
    ...analytics,
    autoAnalysisEnabled,
    setAutoAnalysisEnabled,
  };
};