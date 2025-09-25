import type { WorkoutData, UserData, StatsData, GoalData } from '../shared/types';
import { apiService } from './apiService';

export interface ChatbotCapabilities {
  // Données disponibles
  hasWorkoutHistory: boolean;
  hasProfileComplete: boolean;
  hasGoals: boolean;
  hasWeatherData: boolean;
  hasHeartRateData: boolean;
  hasAdvancedMetrics: boolean;

  // Analyses possibles
  canPredictPerformance: boolean;
  canAssessInjuryRisk: boolean;
  canCreateTrainingPlan: boolean;
  canOptimizeRecovery: boolean;
  canAnalyzeTrends: boolean;
}

export interface EnhancedChatbotResponse {
  text: string;
  insights: string[];
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  dataVisualization?: {
    type: 'chart' | 'progress' | 'prediction';
    data: any;
  };
  actionableSteps?: string[];
  goalProgress?: {
    current: number;
    target: number;
    timeline: string;
    onTrack: boolean;
  };
}

export class ChatbotEnhancementService {

  /**
   * Analyse les capacités du chatbot basées sur les données disponibles
   */
  static analyzeChatbotCapabilities(userData: UserData): ChatbotCapabilities {
    const { workouts, profile, goals } = userData;

    return {
      hasWorkoutHistory: workouts.length > 0,
      hasProfileComplete: !!(profile.age && profile.weight && profile.height && profile.sex),
      hasGoals: goals.length > 0,
      hasWeatherData: workouts.some(w => w.weather),
      hasHeartRateData: workouts.some(w => w.heartRate),
      hasAdvancedMetrics: workouts.some(w => w.cadence || w.power || w.elevation),

      canPredictPerformance: workouts.length >= 5 && !!(profile.age && profile.sex),
      canAssessInjuryRisk: workouts.length >= 3,
      canCreateTrainingPlan: !!(profile.age && profile.runningExperience) && workouts.length >= 2,
      canOptimizeRecovery: workouts.some(w => w.heartRate || w.duration > 30),
      canAnalyzeTrends: workouts.length >= 7
    };
  }

  /**
   * Génère des insights basés sur l'historique complet
   */
  static async generateAdvancedInsights(userData: UserData): Promise<string[]> {
    const insights: string[] = [];
    const { workouts, stats, profile } = userData;

    if (workouts.length === 0) return insights;

    try {
      // 1. Analyse des tendances de performance
      if (workouts.length >= 7) {
        const trend = await apiService.analyzePerformanceTrend(workouts);
        insights.push(
          `📈 Tendance forme : ${trend.fitness_trend}`,
          `🏃‍♂️ Évolution vitesse : ${trend.speed_evolution.trend > 0 ? 'amélioration' : 'stabilisation'} (${trend.speed_evolution.average_pace})`
        );
      }

      // 2. Évaluation du risque de blessure
      if (workouts.length >= 3) {
        const riskAssessment = await apiService.analyzeInjuryRisk(workouts);
        if (riskAssessment.overall_risk !== 'low') {
          insights.push(`⚠️ Risque blessure : ${riskAssessment.overall_risk} - ${riskAssessment.risk_factors[0]?.description}`);
        } else {
          insights.push(`✅ Risque blessure faible - continuez votre approche !`);
        }
      }

      // 3. Comparaison avec profils similaires
      if (profile.age && profile.sex && workouts.length >= 5) {
        const comparison = await apiService.compareAthleteProfile(
          workouts,
          profile.age,
          profile.sex,
          profile.runningExperience || 'intermediate'
        );
        insights.push(
          `🏆 Vous êtes dans le ${comparison.user_percentile}e percentile de votre catégorie`,
          `💪 Force principale : ${comparison.strengths[0]}`
        );
      }

    } catch (error) {
      console.log('Analyses ML non disponibles, utilisation des données locales');
    }

    // Analyses locales basées sur les données riches
    this.addWeatherInsights(workouts, insights);
    this.addHeartRateInsights(workouts, insights);
    this.addAdvancedMetricsInsights(workouts, insights);

    return insights;
  }

  /**
   * Crée un programme d'entraînement personnalisé
   */
  static generatePersonalizedTrainingPlan(userData: UserData, goal: GoalData): {
    weeklyStructure: any[];
    progressionPlan: any[];
    keyWorkouts: any[];
  } {
    const { profile, workouts, stats } = userData;

    // Structure d'entraînement basée sur l'expérience et l'objectif
    const baseVolume = this.calculateBaseVolume(profile.runningExperience, stats.currentWeekDistance);
    const targetDistance = this.extractTargetDistance(goal.title);

    return {
      weeklyStructure: this.buildWeeklyStructure(baseVolume, profile.runningExperience, targetDistance),
      progressionPlan: this.buildProgressionPlan(goal, workouts, stats),
      keyWorkouts: this.generateKeyWorkouts(targetDistance, profile.runningExperience, stats.averagePace)
    };
  }

  /**
   * Prédit les performances futures
   */
  static async predictFuturePerformance(
    userData: UserData,
    targetDistance: number,
    targetDate: string
  ): Promise<{ prediction: string; confidence: number; recommendations: string[] }> {
    try {
      const prediction = await apiService.predictPerformance(userData.workouts, targetDistance, targetDate);

      return {
        prediction: prediction.predicted_time,
        confidence: prediction.confidence_level,
        recommendations: prediction.training_recommendations
      };
    } catch (error) {
      // Prédiction locale basée sur les données
      return this.localPerformancePrediction(userData, targetDistance, targetDate);
    }
  }

  /**
   * Analyse contextuelle complète pour réponses intelligentes
   */
  static analyzeContext(userInput: string, userData: UserData): {
    intent: string;
    requiredAnalysis: string[];
    suggestedActions: string[];
  } {
    const input = userInput.toLowerCase();

    const intents = {
      performance: ['temps', 'record', 'améliorer', 'objectif', 'vitesse', 'pace'],
      training: ['entraînement', 'programme', 'plan', 'séance', 'workout'],
      recovery: ['récupération', 'repos', 'fatigue', 'courbatures', 'douleur'],
      nutrition: ['alimentation', 'nutrition', 'hydratation', 'énergie'],
      injury: ['blessure', 'douleur', 'mal', 'problème'],
      motivation: ['motivation', 'découragé', 'difficile', 'abandon'],
      data: ['statistiques', 'données', 'analyse', 'tendance', 'évolution']
    };

    let detectedIntent = 'general';
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => input.includes(keyword))) {
        detectedIntent = intent;
        break;
      }
    }

    return {
      intent: detectedIntent,
      requiredAnalysis: this.getRequiredAnalysis(detectedIntent, userData),
      suggestedActions: this.getSuggestedActions(detectedIntent, userData)
    };
  }

  // Méthodes privées d'aide
  private static addWeatherInsights(workouts: WorkoutData[], insights: string[]): void {
    const weatherWorkouts = workouts.filter(w => w.weather);
    if (weatherWorkouts.length === 0) return;

    const coldRuns = weatherWorkouts.filter(w => w.weather!.temperature! < 10).length;
    const hotRuns = weatherWorkouts.filter(w => w.weather!.temperature! > 25).length;

    if (coldRuns > 0) {
      insights.push(`🥶 ${coldRuns} sorties par temps froid - excellente mental !`);
    }
    if (hotRuns > 0) {
      insights.push(`🌞 ${hotRuns} sorties par forte chaleur - hydratation ++`);
    }
  }

  private static addHeartRateInsights(workouts: WorkoutData[], insights: string[]): void {
    const hrWorkouts = workouts.filter(w => w.heartRate);
    if (hrWorkouts.length === 0) return;

    const avgHR = hrWorkouts.reduce((sum, w) => sum + w.heartRate!, 0) / hrWorkouts.length;
    const maxHR = Math.max(...hrWorkouts.map(w => w.heartRate!));

    insights.push(`💓 FC moyenne : ${Math.round(avgHR)} bpm, max : ${maxHR} bpm`);

    if (avgHR > 160) {
      insights.push(`🔥 Intensité élevée moyenne - pensez aux sorties endurance`);
    }
  }

  private static addAdvancedMetricsInsights(workouts: WorkoutData[], insights: string[]): void {
    const cadenceWorkouts = workouts.filter(w => w.cadence);
    if (cadenceWorkouts.length > 0) {
      const avgCadence = cadenceWorkouts.reduce((sum, w) => sum + w.cadence!, 0) / cadenceWorkouts.length;
      insights.push(`🦶 Cadence moyenne : ${Math.round(avgCadence)} pas/min`);
    }

    const powerWorkouts = workouts.filter(w => w.power);
    if (powerWorkouts.length > 0) {
      const avgPower = powerWorkouts.reduce((sum, w) => sum + w.power!, 0) / powerWorkouts.length;
      insights.push(`⚡ Puissance moyenne : ${Math.round(avgPower)}W`);
    }
  }

  private static calculateBaseVolume(experience?: string, currentWeek?: number): number {
    const baseVolumes = {
      'beginner': Math.max(15, currentWeek || 0),
      'intermediate': Math.max(25, currentWeek || 0),
      'advanced': Math.max(40, currentWeek || 0),
      'expert': Math.max(60, currentWeek || 0)
    };
    return baseVolumes[experience as keyof typeof baseVolumes] || 20;
  }

  private static extractTargetDistance(goalTitle: string): number {
    if (goalTitle.toLowerCase().includes('5k')) return 5;
    if (goalTitle.toLowerCase().includes('10k')) return 10;
    if (goalTitle.toLowerCase().includes('semi')) return 21.1;
    if (goalTitle.toLowerCase().includes('marathon')) return 42.2;
    return 10; // par défaut
  }

  private static buildWeeklyStructure(baseVolume: number, experience?: string, targetDistance?: number): any[] {
    // Structure de base selon l'expérience
    if (experience === 'beginner') {
      return [
        { day: 'Lundi', type: 'repos' },
        { day: 'Mardi', type: 'course facile', distance: baseVolume * 0.25 },
        { day: 'Mercredi', type: 'repos' },
        { day: 'Jeudi', type: 'course facile', distance: baseVolume * 0.25 },
        { day: 'Vendredi', type: 'repos' },
        { day: 'Samedi', type: 'sortie longue', distance: baseVolume * 0.4 },
        { day: 'Dimanche', type: 'repos actif' }
      ];
    }

    return [
      { day: 'Lundi', type: 'repos' },
      { day: 'Mardi', type: 'fractionné', distance: baseVolume * 0.25 },
      { day: 'Mercredi', type: 'course facile', distance: baseVolume * 0.2 },
      { day: 'Jeudi', type: 'tempo', distance: baseVolume * 0.3 },
      { day: 'Vendredi', type: 'repos' },
      { day: 'Samedi', type: 'sortie longue', distance: baseVolume * 0.4 },
      { day: 'Dimanche', type: 'récupération', distance: baseVolume * 0.15 }
    ];
  }

  private static buildProgressionPlan(goal: GoalData, workouts: WorkoutData[], stats: StatsData): any[] {
    const timeToGoal = new Date(goal.targetDate).getTime() - Date.now();
    const weeksRemaining = Math.max(1, Math.ceil(timeToGoal / (7 * 24 * 60 * 60 * 1000)));

    return Array.from({ length: Math.min(12, weeksRemaining) }, (_, week) => ({
      week: week + 1,
      focusArea: this.getWeeklyFocus(week, weeksRemaining),
      volumeIncrease: this.calculateVolumeIncrease(week, weeksRemaining),
      keySession: this.getKeySessionForWeek(week, goal)
    }));
  }

  private static generateKeyWorkouts(targetDistance: number, experience?: string, currentPace?: string): any[] {
    const workouts = [];

    if (targetDistance <= 10) {
      workouts.push(
        {
          name: 'Fractionné court',
          description: '6 x 400m avec récup égale',
          purpose: 'Développer la VMA et la tolérance lactique'
        },
        {
          name: 'Tempo run',
          description: '20-30min à allure semi-marathon',
          purpose: 'Améliorer le seuil lactique'
        }
      );
    } else {
      workouts.push(
        {
          name: 'Sortie longue progressive',
          description: 'Commencer facile, finir à allure objectif',
          purpose: 'Endurance spécifique'
        },
        {
          name: 'Fractionné long',
          description: '5 x 1000m à allure 5K',
          purpose: 'Puissance aérobie'
        }
      );
    }

    return workouts;
  }

  private static getRequiredAnalysis(intent: string, userData: UserData): string[] {
    const analysisMap: { [key: string]: string[] } = {
      'performance': ['trend_analysis', 'benchmark_comparison', 'prediction'],
      'training': ['training_zones', 'volume_analysis', 'recovery_status'],
      'recovery': ['injury_risk', 'training_load', 'heart_rate_variability'],
      'data': ['comprehensive_stats', 'trend_analysis', 'goal_progress']
    };

    return analysisMap[intent] || ['basic_stats'];
  }

  private static getSuggestedActions(intent: string, userData: UserData): string[] {
    // Actions suggérées selon l'intention détectée
    const actionMap: { [key: string]: string[] } = {
      'performance': ['Créer un programme personnalisé', 'Fixer un objectif SMART', 'Analyser les benchmarks'],
      'training': ['Générer un plan d\'entraînement', 'Optimiser la récupération', 'Varier les séances'],
      'recovery': ['Évaluer le risque de blessure', 'Planifier les repos', 'Analyser la charge'],
      'motivation': ['Fixer des micro-objectifs', 'Célébrer les progrès', 'Trouver un partenaire']
    };

    return actionMap[intent] || ['Analyser vos données', 'Définir vos objectifs'];
  }

  private static getWeeklyFocus(week: number, totalWeeks: number): string {
    const progressRatio = week / totalWeeks;

    if (progressRatio < 0.3) return 'Base aérobie';
    if (progressRatio < 0.6) return 'Développement de la vitesse';
    if (progressRatio < 0.85) return 'Spécifique objectif';
    return 'Affûtage';
  }

  private static calculateVolumeIncrease(week: number, totalWeeks: number): number {
    // Augmentation progressive avec plateau et affûtage
    if (week <= totalWeeks * 0.7) {
      return 1 + (week * 0.1); // Augmentation progressive
    } else if (week <= totalWeeks * 0.85) {
      return 1.7; // Plateau
    } else {
      return 0.8 - (week - totalWeeks * 0.85) * 0.1; // Diminution pour affûtage
    }
  }

  private static getKeySessionForWeek(week: number, goal: GoalData): string {
    const sessions = [
      'Test VMA', 'Fractionné court', 'Tempo run', 'Sortie longue progressive',
      'Intervalles', 'Fartlek', 'Seuil lactique', 'Simulation course'
    ];

    return sessions[week % sessions.length];
  }

  private static localPerformancePrediction(
    userData: UserData,
    targetDistance: number,
    targetDate: string
  ): { prediction: string; confidence: number; recommendations: string[] } {
    const { stats, workouts } = userData;

    // Prédiction simple basée sur la pace actuelle
    const currentPaceSeconds = this.parsePageToSeconds(stats.averagePace);
    const predictedTime = currentPaceSeconds * targetDistance;

    const hours = Math.floor(predictedTime / 3600);
    const minutes = Math.floor((predictedTime % 3600) / 60);
    const seconds = Math.floor(predictedTime % 60);

    return {
      prediction: `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      confidence: workouts.length >= 10 ? 75 : 50,
      recommendations: [
        'Augmentez le volume progressivement',
        'Intégrez des séances de fractionné',
        'Travaillez l\'endurance de base'
      ]
    };
  }

  private static parsePageToSeconds(pace: string): number {
    const [minutes, seconds] = pace.split(':').map(Number);
    return minutes * 60 + seconds;
  }
}