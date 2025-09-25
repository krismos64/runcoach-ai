// Types partagés pour RunCoach AI
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

// Interfaces pour l'analyse avancée
export interface WorkoutAnalysis {
  workout_id: string;
  overall_score: number;
  pace_analysis: {
    current_pace: string;
    pace_category: string;
    consistency: string;
    trend?: string;
  };
  heart_rate_zones?: {
    zone1: number;
    zone2: number;
    zone3: number;
    zone4: number;
  };
  effort_consistency: number;
  fatigue_level: string;
  recovery_recommendation: string;
  performance_insights: string[];
  comparison_to_history: {
    distance_vs_average?: string;
    pace_vs_average?: string;
  };
}

export interface PerformanceTrend {
  period: string;
  fitness_trend: string;
  endurance_evolution: {
    trend: number;
    average_distance: number;
    consistency: number;
  };
  speed_evolution: {
    trend: number;
    average_pace: number;
    best_pace: number;
  };
  volume_analysis: {
    total_distance: number;
    total_time: number;
    average_per_workout: number;
    weekly_estimate: number;
  };
  recommendations: string[];
  risk_factors: string[];
}

export interface InjuryRiskAssessment {
  overall_risk: 'low' | 'medium' | 'high';
  risk_score: number;
  risk_factors: Array<{
    factor: string;
    description: string;
    severity: string;
    value: string;
  }>;
  prevention_tips: string[];
  recommended_actions: string[];
}

export interface PerformancePrediction {
  target_distance: number;
  target_date: string;
  predicted_time: string;
  confidence_level: number;
  current_fitness_level: string;
  improvement_potential: string;
  training_recommendations: string[];
  milestone_predictions: Array<{
    checkpoint_days: number;
    predicted_time: string;
    expected_improvement: string;
    confidence: number;
  }>;
}

export interface AthleteComparison {
  user_percentile: number;
  peer_comparison: {
    distance_vs_peers: string;
    pace_vs_peers: string;
    consistency_vs_peers: string;
    peer_group: string;
  };
  strengths: string[];
  areas_for_improvement: string[];
  benchmark_data: any;
  progression_potential: string;
}