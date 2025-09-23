import * as tf from '@tensorflow/tfjs-node';
import { IWorkout } from '../models/Workout.model';

export interface PredictionInput {
  recentWorkouts: IWorkout[];
  userProfile: {
    age: number;
    weight: number;
    height: number;
    vo2Max: number;
    restingHeartRate: number;
  };
  targetRace: {
    type: string;
    daysUntil: number;
  };
}

export interface WorkoutPrediction {
  type: 'endurance' | 'interval' | 'trail' | 'recovery' | 'tempo' | 'long';
  estimatedDistance: number;
  estimatedDuration: number;
  estimatedPace: number;
  targetHeartRateZone: [number, number];
  confidence: number;
  recommendations: string[];
}

export class MLPredictionService {
  private model: tf.LayersModel | null = null;
  private static instance: MLPredictionService;

  private constructor() {
    this.initializeModel();
  }

  public static getInstance(): MLPredictionService {
    if (!MLPredictionService.instance) {
      MLPredictionService.instance = new MLPredictionService();
    }
    return MLPredictionService.instance;
  }

  private async initializeModel() {
    try {
      this.model = await this.createModel();
    } catch (error) {
      console.error('Error initializing ML model:', error);
    }
  }

  private async createModel(): Promise<tf.LayersModel> {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [20],
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 7,
          activation: 'softmax'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async predictNextWorkout(input: PredictionInput): Promise<WorkoutPrediction> {
    const features = this.extractFeatures(input);
    const weeklyLoad = this.calculateWeeklyLoad(input.recentWorkouts);
    const fatigueLevel = this.calculateFatigueLevel(input.recentWorkouts);
    const progressionRate = this.calculateProgressionRate(input.recentWorkouts);

    const workoutType = this.determineOptimalWorkoutType(
      input.recentWorkouts,
      input.targetRace.daysUntil,
      fatigueLevel
    );

    const targetDistance = this.calculateTargetDistance(
      workoutType,
      weeklyLoad,
      progressionRate,
      input.targetRace.daysUntil
    );

    const targetPace = this.calculateTargetPace(
      workoutType,
      input.userProfile.vo2Max,
      input.recentWorkouts
    );

    const targetHeartRateZone = this.calculateHeartRateZone(
      workoutType,
      input.userProfile.age,
      input.userProfile.restingHeartRate
    );

    const recommendations = this.generateRecommendations(
      workoutType,
      fatigueLevel,
      input.targetRace.daysUntil
    );

    return {
      type: workoutType,
      estimatedDistance: targetDistance,
      estimatedDuration: targetDistance / targetPace * 60,
      estimatedPace: targetPace,
      targetHeartRateZone,
      confidence: 0.85,
      recommendations
    };
  }

  private extractFeatures(input: PredictionInput): number[] {
    const recentWorkouts = input.recentWorkouts.slice(-10);

    const features = [
      input.userProfile.age,
      input.userProfile.weight,
      input.userProfile.height,
      input.userProfile.vo2Max,
      input.userProfile.restingHeartRate,
      input.targetRace.daysUntil,
      recentWorkouts.reduce((sum, w) => sum + w.distance, 0) / recentWorkouts.length,
      recentWorkouts.reduce((sum, w) => sum + w.duration, 0) / recentWorkouts.length,
      recentWorkouts.reduce((sum, w) => sum + (w.averagePace || 0), 0) / recentWorkouts.length,
      recentWorkouts.reduce((sum, w) => sum + (w.averageHeartRate || 0), 0) / recentWorkouts.length,
      recentWorkouts.reduce((sum, w) => sum + (w.elevationGain || 0), 0) / recentWorkouts.length,
      this.calculateWeeklyLoad(recentWorkouts),
      this.calculateFatigueLevel(recentWorkouts),
      this.calculateProgressionRate(recentWorkouts),
      this.getDaysSinceLastWorkout(recentWorkouts),
      this.getWorkoutTypeDistribution(recentWorkouts, 'endurance'),
      this.getWorkoutTypeDistribution(recentWorkouts, 'interval'),
      this.getWorkoutTypeDistribution(recentWorkouts, 'trail'),
      this.getWorkoutTypeDistribution(recentWorkouts, 'recovery'),
      this.getWorkoutTypeDistribution(recentWorkouts, 'long')
    ];

    return features;
  }

  private calculateWeeklyLoad(workouts: IWorkout[]): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyWorkouts = workouts.filter(w => w.startDate > oneWeekAgo);

    return weeklyWorkouts.reduce((total, workout) => {
      const intensity = (workout.averageHeartRate || 140) / 180;
      return total + (workout.duration * intensity * workout.distance / 1000);
    }, 0);
  }

  private calculateFatigueLevel(workouts: IWorkout[]): number {
    const recentWorkouts = workouts.slice(-5);
    if (recentWorkouts.length === 0) return 0;

    const acuteLoad = this.calculateWeeklyLoad(recentWorkouts);
    const chronicLoad = this.calculateWeeklyLoad(workouts.slice(-28));

    const ratio = chronicLoad > 0 ? acuteLoad / (chronicLoad / 4) : 1;

    if (ratio > 1.5) return 0.9;
    if (ratio > 1.3) return 0.7;
    if (ratio > 1.1) return 0.5;
    if (ratio < 0.8) return 0.3;
    return 0.4;
  }

  private calculateProgressionRate(workouts: IWorkout[]): number {
    if (workouts.length < 4) return 1.0;

    const oldWorkouts = workouts.slice(0, Math.floor(workouts.length / 2));
    const newWorkouts = workouts.slice(Math.floor(workouts.length / 2));

    const oldAvgDistance = oldWorkouts.reduce((sum, w) => sum + w.distance, 0) / oldWorkouts.length;
    const newAvgDistance = newWorkouts.reduce((sum, w) => sum + w.distance, 0) / newWorkouts.length;

    return newAvgDistance / oldAvgDistance;
  }

  private determineOptimalWorkoutType(
    recentWorkouts: IWorkout[],
    daysUntilRace: number,
    fatigueLevel: number
  ): 'endurance' | 'interval' | 'trail' | 'recovery' | 'tempo' | 'long' {
    const lastWorkouts = recentWorkouts.slice(-3);
    const workoutCounts = {
      endurance: 0,
      interval: 0,
      trail: 0,
      recovery: 0,
      tempo: 0,
      long: 0
    };

    lastWorkouts.forEach(w => {
      const type = w.trainingType || 'endurance';
      workoutCounts[type as keyof typeof workoutCounts]++;
    });

    if (fatigueLevel > 0.7) return 'recovery';

    if (daysUntilRace < 14) {
      return workoutCounts.interval > 0 ? 'endurance' : 'interval';
    }

    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0 && workoutCounts.long === 0) return 'long';
    if (dayOfWeek === 2 && workoutCounts.interval === 0) return 'interval';
    if (dayOfWeek === 4 && workoutCounts.trail === 0) return 'trail';

    return 'endurance';
  }

  private calculateTargetDistance(
    workoutType: string,
    weeklyLoad: number,
    progressionRate: number,
    daysUntilRace: number
  ): number {
    const baseDistances = {
      endurance: 8000,
      interval: 6000,
      trail: 10000,
      recovery: 5000,
      tempo: 7000,
      long: 15000
    };

    let distance = baseDistances[workoutType as keyof typeof baseDistances] || 8000;

    if (daysUntilRace > 30) {
      distance *= Math.min(progressionRate, 1.1);
    } else {
      distance *= 0.9;
    }

    return Math.round(distance);
  }

  private calculateTargetPace(
    workoutType: string,
    vo2Max: number,
    recentWorkouts: IWorkout[]
  ): number {
    const vdot = vo2Max;
    const racePace = 295 - (vdot - 30) * 2.5;

    const paceMultipliers = {
      endurance: 1.15,
      interval: 0.95,
      trail: 1.25,
      recovery: 1.35,
      tempo: 1.05,
      long: 1.2
    };

    const multiplier = paceMultipliers[workoutType as keyof typeof paceMultipliers] || 1.15;
    return racePace * multiplier;
  }

  private calculateHeartRateZone(
    workoutType: string,
    age: number,
    restingHR: number
  ): [number, number] {
    const maxHR = 220 - age;
    const hrReserve = maxHR - restingHR;

    const zones = {
      endurance: [0.60, 0.70],
      interval: [0.80, 0.90],
      trail: [0.65, 0.75],
      recovery: [0.50, 0.60],
      tempo: [0.75, 0.85],
      long: [0.65, 0.75]
    };

    const [minPct, maxPct] = zones[workoutType as keyof typeof zones] || [0.60, 0.70];

    return [
      Math.round(restingHR + hrReserve * minPct),
      Math.round(restingHR + hrReserve * maxPct)
    ];
  }

  private generateRecommendations(
    workoutType: string,
    fatigueLevel: number,
    daysUntilRace: number
  ): string[] {
    const recommendations: string[] = [];

    const workoutTips = {
      endurance: "Maintenez un rythme confortable, vous devriez pouvoir tenir une conversation",
      interval: "Échauffez-vous 15 min, alternez efforts intenses et récupération active",
      trail: "Concentrez-vous sur la technique en montée, récupérez en descente",
      recovery: "Gardez un rythme très léger, privilégiez la récupération active",
      tempo: "Maintenez un rythme soutenu mais contrôlé pendant toute la durée",
      long: "Commencez doucement et augmentez progressivement le rythme"
    };

    recommendations.push(workoutTips[workoutType as keyof typeof workoutTips] || "");

    if (fatigueLevel > 0.6) {
      recommendations.push("⚠️ Niveau de fatigue élevé détecté - écoutez votre corps");
    }

    if (daysUntilRace < 30) {
      recommendations.push(`📅 J-${daysUntilRace} avant votre semi-marathon - phase d'affûtage`);
    }

    recommendations.push("💧 Hydratez-vous avant, pendant et après l'effort");

    return recommendations;
  }

  private getDaysSinceLastWorkout(workouts: IWorkout[]): number {
    if (workouts.length === 0) return 7;

    const lastWorkout = workouts[workouts.length - 1];
    const daysDiff = (Date.now() - lastWorkout.startDate.getTime()) / (1000 * 60 * 60 * 24);

    return Math.round(daysDiff);
  }

  private getWorkoutTypeDistribution(workouts: IWorkout[], type: string): number {
    const typeCount = workouts.filter(w => w.trainingType === type).length;
    return workouts.length > 0 ? typeCount / workouts.length : 0;
  }
}

export default MLPredictionService.getInstance();