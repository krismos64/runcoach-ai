import type {
  WorkoutData,
  WorkoutAnalysis,
  PerformanceTrend,
  InjuryRiskAssessment,
  PerformancePrediction,
  AthleteComparison
} from '../shared/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';


class APIService {
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    data?: any
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error calling ${endpoint}:`, error);
      throw error;
    }
  }

  // Analyse d'entraînement avancée
  async analyzeWorkout(workouts: WorkoutData[]): Promise<WorkoutAnalysis> {
    return this.makeRequest<WorkoutAnalysis>('/analyze/workout', 'POST', workouts);
  }

  // Analyse des tendances de performance
  async analyzePerformanceTrend(workouts: WorkoutData[]): Promise<PerformanceTrend> {
    return this.makeRequest<PerformanceTrend>('/analyze/performance-trend', 'POST', workouts);
  }

  // Prédiction de performance
  async predictPerformance(
    workoutHistory: WorkoutData[],
    targetDistance: number,
    targetDate: string
  ): Promise<PerformancePrediction> {
    return this.makeRequest<PerformancePrediction>('/predict/performance', 'POST', {
      workout_history: workoutHistory,
      target_distance: targetDistance,
      target_date: targetDate,
    });
  }

  // Analyse des zones d'entraînement
  async analyzeTrainingZones(workouts: WorkoutData[]) {
    return this.makeRequest('/analyze/training-zones', 'POST', workouts);
  }

  // Évaluation du risque de blessure
  async analyzeInjuryRisk(workouts: WorkoutData[]): Promise<InjuryRiskAssessment> {
    return this.makeRequest<InjuryRiskAssessment>('/analyze/injury-risk', 'POST', workouts);
  }

  // Comparaison du profil athlète
  async compareAthleteProfile(
    userWorkouts: WorkoutData[],
    age: number,
    gender: string,
    experienceLevel: string
  ): Promise<AthleteComparison> {
    return this.makeRequest<AthleteComparison>('/compare/athlete-profile', 'POST', {
      user_workouts: userWorkouts,
      age,
      gender,
      experience_level: experienceLevel,
    });
  }

  // Récupération des benchmarks
  async getRunningBenchmarks() {
    return this.makeRequest('/datasets/running-benchmarks');
  }

  // Health check de l'API
  async healthCheck(): Promise<{ status: string; version: string }> {
    return this.makeRequest('/health');
  }

  // Test de connexion
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error('API connection failed:', error);
      return false;
    }
  }
}

export const apiService = new APIService();