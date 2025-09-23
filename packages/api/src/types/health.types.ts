export interface AppleHealthRecord {
  type: string;
  unit?: string;
  value?: string;
  sourceName: string;
  sourceVersion?: string;
  device?: string;
  creationDate?: string;
  startDate: string;
  endDate: string;
}

export interface Workout {
  workoutActivityType: string;
  duration?: number;
  durationUnit?: string;
  totalDistance?: number;
  totalDistanceUnit?: string;
  totalEnergyBurned?: number;
  totalEnergyBurnedUnit?: string;
  sourceName: string;
  sourceVersion?: string;
  device?: string;
  creationDate?: string;
  startDate: string;
  endDate: string;
  averageHeartRate?: number;
  maxHeartRate?: number;
  elevationGain?: number;
  route?: WorkoutRoute;
  statistics?: WorkoutStatistic[];
}

export interface WorkoutRoute {
  sourceName: string;
  sourceVersion?: string;
  device?: string;
  creationDate?: string;
  startDate: string;
  endDate: string;
  path?: string;
  coordinates?: GeoCoordinate[];
}

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
  altitude?: number;
  timestamp: string;
  speed?: number;
  course?: number;
}

export interface WorkoutStatistic {
  type: string;
  startDate: string;
  endDate: string;
  average?: number;
  minimum?: number;
  maximum?: number;
  sum?: number;
  unit?: string;
}

export interface UserProfile {
  dateOfBirth?: string;
  biologicalSex?: string;
  bloodType?: string;
  fitzpatrickSkinType?: string;
  height?: number;
  currentWeight: number;
  targetWeight: number;
  vo2Max?: number;
}

export interface TrainingPlan {
  userId: string;
  targetRace: 'semi-marathon' | 'marathon' | '10k' | '5k';
  targetDate: Date;
  weeklyPlan: WeeklyPlan[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklyPlan {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  sessions: TrainingSession[];
  totalDistance: number;
  totalDuration: number;
}

export interface TrainingSession {
  date: Date;
  type: 'endurance' | 'interval' | 'trail' | 'recovery' | 'race';
  plannedDistance: number;
  plannedDuration: number;
  plannedPace: number;
  plannedHeartRateZone: string;
  description: string;
  completed: boolean;
  actualWorkoutId?: string;
  elevationGain?: number;
  notes?: string;
}

export interface PredictionResult {
  nextWorkout: {
    type: string;
    estimatedDistance: number;
    estimatedDuration: number;
    estimatedPace: number;
    targetHeartRate: number;
    confidence: number;
  };
  performanceMetrics: {
    estimatedVO2Max: number;
    raceTimePrediction: number;
    currentFitnessLevel: number;
    fatigueLevel: number;
  };
  recommendations: string[];
}