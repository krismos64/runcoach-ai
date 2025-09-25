import type { UserData, WorkoutData } from '../shared/types';

// Types pour les données collectives externes
export interface CollectiveBenchmark {
  demographic: {
    ageRange: string;
    gender: 'male' | 'female';
    experienceLevel: string;
    bmiRange?: string;
  };
  performance: {
    distance: number;
    averageTime: string;
    medianTime: string;
    percentiles: {
      p25: string;
      p50: string;
      p75: string;
      p90: string;
      p95: string;
    };
  };
  physiological: {
    averageHR?: number;
    hrZoneDistribution?: {
      zone1: number;
      zone2: number;
      zone3: number;
      zone4: number;
      zone5: number;
    };
    elevationTolerance?: {
      flatPreference: number; // % qui préfèrent le plat
      hillTraining: number;   // % qui s'entraînent en côtes
      averageGainPerKm: number; // dénivelé moyen par km
    };
  };
  training: {
    weeklyVolume: number;
    sessionsPerWeek: number;
    longRunPercentage: number;
    intervalPercentage: number;
    recoveryPercentage: number;
  };
  progression: {
    monthlyImprovement: number; // % d'amélioration pace par mois
    plateauDuration: number;    // mois avant plateau
    injuryRate: number;         // % de blessés par an
    dropoutRate: number;        // % qui arrêtent
  };
  source: 'strava' | 'kaggle' | 'worldathletics';
  sampleSize: number;
  lastUpdated: Date;
}

export interface PersonalizedInsight {
  type: 'performance' | 'training' | 'recovery' | 'nutrition' | 'injury_risk';
  confidence: number; // 0-100
  insight: string;
  recommendation: string;
  basedOnSimilarAthletes: number; // nombre d'athlètes similaires dans l'échantillon
  comparisonData: {
    userValue: number | string;
    averageValue: number | string;
    percentile: number;
    trend: 'improving' | 'stable' | 'declining';
  };
}

export interface SmartRecommendation {
  category: 'immediate' | 'weekly' | 'monthly';
  priority: 'high' | 'medium' | 'low';
  action: string;
  reasoning: string;
  successProbability: number; // basé sur les données collectives
  timeline: string;
  similarProfilesSuccess: {
    attempted: number;
    succeeded: number;
    averageTimeToSuccess: number; // en jours
  };
}

class CollectiveDataService {
  private cache = new Map<string, { data: any; expiry: Date }>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24h

  /**
   * Compare l'utilisateur avec des profils similaires globalement
   */
  async compareWithSimilarAthletes(userData: UserData): Promise<PersonalizedInsight[]> {
    const insights: PersonalizedInsight[] = [];
    const profile = userData.profile;

    if (!profile.age || !profile.sex) {
      return []; // Besoin des données de base
    }

    // 1. Analyse Performance vs Pairs
    const performanceInsight = await this.getPerformanceComparison(userData);
    if (performanceInsight) insights.push(performanceInsight);

    // 2. Analyse Fréquence Cardiaque
    const hrInsight = await this.getHeartRateComparison(userData);
    if (hrInsight) insights.push(hrInsight);

    // 3. Analyse Dénivelé et Tolérance
    const elevationInsight = await this.getElevationComparison(userData);
    if (elevationInsight) insights.push(elevationInsight);

    // 4. Analyse Volume d'Entraînement
    const volumeInsight = await this.getVolumeComparison(userData);
    if (volumeInsight) insights.push(volumeInsight);

    // 5. Analyse Risque de Progression
    const progressionInsight = await this.getProgressionRisk(userData);
    if (progressionInsight) insights.push(progressionInsight);

    return insights;
  }

  /**
   * Génère des recommandations intelligentes basées sur les succès collectifs
   */
  async generateSmartRecommendations(userData: UserData): Promise<SmartRecommendation[]> {
    const recommendations: SmartRecommendation[] = [];
    const similarProfiles = await this.findSimilarAthleteProfiles(userData);

    // Recommandations basées sur les patterns de succès
    const trainingRecs = await this.getTrainingRecommendations(userData, similarProfiles);
    const recoveryRecs = await this.getRecoveryRecommendations(userData, similarProfiles);
    const progressionRecs = await this.getProgressionRecommendations(userData, similarProfiles);

    return [...trainingRecs, ...recoveryRecs, ...progressionRecs];
  }

  /**
   * Prédit les chances de succès d'un objectif basé sur les données collectives
   */
  async predictGoalSuccess(
    userData: UserData,
    goalDistance: number,
    targetTime: string,
    timeframe: number // en semaines
  ): Promise<{
    successProbability: number;
    similarAttemptsData: {
      total: number;
      succeeded: number;
      averageTrainingVolume: number;
      criticalFactors: string[];
    };
    recommendations: SmartRecommendation[];
  }> {
    const cacheKey = `goal_prediction_${userData.profile.age}_${userData.profile.sex}_${goalDistance}_${targetTime}`;

    // Vérifier le cache
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Simulation d'appel MCP - à remplacer par vrais appels
      const similarAthletes = await this.findSimilarAthleteProfiles(userData);
      const goalAttempts = await this.getGoalAttemptData(goalDistance, targetTime, similarAthletes);

      const successProbability = this.calculateSuccessProbability(userData, goalAttempts, timeframe);
      const recommendations = await this.generateGoalSpecificRecommendations(userData, goalAttempts);

      const result = {
        successProbability,
        similarAttemptsData: {
          total: goalAttempts.total,
          succeeded: goalAttempts.succeeded,
          averageTrainingVolume: goalAttempts.averageVolume,
          criticalFactors: goalAttempts.successFactors
        },
        recommendations
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Erreur prédiction objectif:', error);
      return this.getFallbackGoalPrediction(userData, goalDistance, targetTime);
    }
  }

  /**
   * Analyse la FC de l'utilisateur vs population similaire
   */
  private async getHeartRateComparison(userData: UserData): Promise<PersonalizedInsight | null> {
    const hrWorkouts = userData.workouts.filter(w => w.heartRate);
    if (hrWorkouts.length === 0) return null;

    const userAvgHR = hrWorkouts.reduce((sum, w) => sum + w.heartRate!, 0) / hrWorkouts.length;

    // Simulation d'appel MCP pour données collectives FC
    const collectiveHRData = await this.getCollectiveHRData(userData.profile);

    if (!collectiveHRData) return null;

    const percentile = this.calculatePercentile(userAvgHR, collectiveHRData.hrDistribution);

    let insight = '';
    let recommendation = '';

    if (percentile > 80) {
      insight = `Votre FC moyenne (${Math.round(userAvgHR)} bpm) est plus élevée que 80% des coureurs de votre profil`;
      recommendation = 'Privilégiez l\'endurance fondamentale (Zone 1-2) et surveillez la récupération';
    } else if (percentile > 60) {
      insight = `FC dans la moyenne haute (${Math.round(userAvgHR)} bpm) - bon équilibre intensité/endurance`;
      recommendation = 'Maintenez cette approche, ajoutez quelques séances en Zone 1 pure';
    } else if (percentile > 40) {
      insight = `FC modérée (${Math.round(userAvgHR)} bpm) - approche conservative efficace`;
      recommendation = 'Vous pouvez intégrer plus d\'intervalles pour stimuler la progression';
    } else {
      insight = `FC basse (${Math.round(userAvgHR)} bpm) - excellent contrôle ou sous-intensité`;
      recommendation = 'Vérifiez que vous vous challengez suffisamment sur certaines séances';
    }

    return {
      type: 'training',
      confidence: 85,
      insight,
      recommendation,
      basedOnSimilarAthletes: collectiveHRData.sampleSize,
      comparisonData: {
        userValue: Math.round(userAvgHR),
        averageValue: Math.round(collectiveHRData.average),
        percentile,
        trend: this.calculateHRTrend(hrWorkouts)
      }
    };
  }

  /**
   * Analyse du dénivelé vs population similaire
   */
  private async getElevationComparison(userData: UserData): Promise<PersonalizedInsight | null> {
    const elevationWorkouts = userData.workouts.filter(w => w.elevation?.gain);
    if (elevationWorkouts.length === 0) return null;

    const userAvgElevationPerKm = elevationWorkouts.reduce((sum, w) =>
      sum + (w.elevation!.gain / w.distance), 0
    ) / elevationWorkouts.length;

    // Simulation d'appel MCP pour données collectives dénivelé
    const collectiveElevationData = await this.getCollectiveElevationData(userData.profile);

    if (!collectiveElevationData) return null;

    const percentile = this.calculatePercentile(userAvgElevationPerKm, collectiveElevationData.elevationDistribution);

    let insight = '';
    let recommendation = '';

    if (percentile > 75) {
      insight = `Vous courez plus de dénivelé (${Math.round(userAvgElevationPerKm)}m/km) que 75% des coureurs similaires`;
      recommendation = 'Excellent pour la force ! Équilibrez avec des sorties plates pour la vitesse';
    } else if (percentile > 50) {
      insight = `Dénivelé modéré (${Math.round(userAvgElevationPerKm)}m/km) - bon équilibre plat/côtes`;
      recommendation = 'Profil polyvalent idéal. Continuez cette variété';
    } else if (percentile > 25) {
      insight = `Vous privilégiez le plat (${Math.round(userAvgElevationPerKm)}m/km) comme 60% des coureurs`;
      recommendation = 'Intégrez quelques côtes pour renforcer et casser la routine';
    } else {
      insight = `Entraînement très plat - potentiel d\'amélioration en intégrant du dénivelé`;
      recommendation = 'Les côtes développeront votre puissance et votre mental. Commencez progressivement';
    }

    return {
      type: 'training',
      confidence: 80,
      insight,
      recommendation,
      basedOnSimilarAthletes: collectiveElevationData.sampleSize,
      comparisonData: {
        userValue: `${Math.round(userAvgElevationPerKm)}m/km`,
        averageValue: `${Math.round(collectiveElevationData.average)}m/km`,
        percentile,
        trend: 'stable' // TODO: calculer la tendance
      }
    };
  }

  /**
   * Analyse de performance vs population similaire
   */
  private async getPerformanceComparison(userData: UserData): Promise<PersonalizedInsight | null> {
    if (userData.workouts.length === 0) return null;

    const avgDistance = userData.stats.totalDistance / userData.stats.totalWorkouts;
    const currentPaceSeconds = this.paceToSeconds(userData.stats.averagePace);

    // Appel MCP pour benchmarks collectifs
    const benchmark = await this.getPerformanceBenchmark(
      userData.profile.age!,
      userData.profile.sex!,
      avgDistance,
      userData.profile.runningExperience || 'intermediate'
    );

    if (!benchmark) return null;

    const expectedPaceSeconds = this.paceToSeconds(benchmark.performance.medianTime);
    const percentile = this.calculatePacePercentile(currentPaceSeconds, benchmark);

    let insight = '';
    let recommendation = '';

    if (percentile > 80) {
      insight = `Vos performances (${userData.stats.averagePace}/km) vous placent dans le top 20% de votre catégorie !`;
      recommendation = 'Concentrez-vous sur la spécificité pour vos objectifs de course';
    } else if (percentile > 60) {
      insight = `Bonnes performances (${userData.stats.averagePace}/km) - dessus de la moyenne`;
      recommendation = 'Intégrez plus de variété : fractionné, tempo, sorties longues';
    } else if (percentile > 40) {
      insight = `Niveau moyen solide - marge de progression importante`;
      recommendation = 'Augmentez progressivement le volume et ajoutez du fractionné';
    } else {
      insight = `Début prometteur - la régularité vous fera progresser rapidement`;
      recommendation = 'Focus sur la constance avant l\'intensité. 3 sorties/semaine minimum';
    }

    return {
      type: 'performance',
      confidence: 90,
      insight,
      recommendation,
      basedOnSimilarAthletes: benchmark.sampleSize,
      comparisonData: {
        userValue: userData.stats.averagePace,
        averageValue: benchmark.performance.medianTime,
        percentile,
        trend: this.calculateProgressionTrend(userData.workouts)
      }
    };
  }

  // Méthodes utilitaires et appels MCP simulés
  private async getCollectiveHRData(profile: any) {
    // TODO: Remplacer par vrais appels MCP
    return {
      average: 155 + (profile.age > 40 ? -5 : 0) + (profile.sex === 'female' ? 10 : 0),
      hrDistribution: [140, 145, 150, 155, 160, 165, 170, 175, 180],
      sampleSize: 12500
    };
  }

  private async getCollectiveElevationData(profile: any) {
    // TODO: Remplacer par vrais appels MCP
    return {
      average: 15, // m/km moyen
      elevationDistribution: [0, 5, 10, 15, 20, 25, 35, 50, 75],
      sampleSize: 8900
    };
  }

  private async getPerformanceBenchmark(age: number, sex: string, distance: number, experience: string): Promise<CollectiveBenchmark | null> {
    // TODO: Remplacer par vrais appels MCP
    const baseTime = sex === 'male' ? 300 : 330; // 5:00 ou 5:30 base
    const ageFactor = age > 35 ? (age - 35) * 2 : 0;
    const expFactor = experience === 'beginner' ? 60 : experience === 'advanced' ? -30 : 0;

    return {
      demographic: {
        ageRange: `${Math.floor(age/5)*5}-${Math.floor(age/5)*5+4}`,
        gender: sex as 'male' | 'female',
        experienceLevel: experience,
      },
      performance: {
        distance,
        averageTime: this.secondsToPace(baseTime + ageFactor + expFactor),
        medianTime: this.secondsToPace(baseTime + ageFactor + expFactor - 10),
        percentiles: {
          p25: this.secondsToPace(baseTime + ageFactor + expFactor + 40),
          p50: this.secondsToPace(baseTime + ageFactor + expFactor),
          p75: this.secondsToPace(baseTime + ageFactor + expFactor - 30),
          p90: this.secondsToPace(baseTime + ageFactor + expFactor - 60),
          p95: this.secondsToPace(baseTime + ageFactor + expFactor - 90)
        }
      },
      physiological: {},
      training: {
        weeklyVolume: 25,
        sessionsPerWeek: 3.2,
        longRunPercentage: 35,
        intervalPercentage: 15,
        recoveryPercentage: 50
      },
      progression: {
        monthlyImprovement: 2.5,
        plateauDuration: 6,
        injuryRate: 15,
        dropoutRate: 25
      },
      source: 'strava',
      sampleSize: 15600,
      lastUpdated: new Date()
    };
  }

  // Méthodes utilitaires de calcul
  private calculatePercentile(userValue: number, distribution: number[]): number {
    const sorted = distribution.sort((a, b) => a - b);
    let rank = 0;
    for (let i = 0; i < sorted.length; i++) {
      if (userValue >= sorted[i]) rank = i + 1;
    }
    return Math.round((rank / sorted.length) * 100);
  }

  private calculatePacePercentile(userPaceSeconds: number, benchmark: CollectiveBenchmark): number {
    // Plus la pace est rapide (moins de secondes), meilleur le percentile
    const percentiles = [
      this.paceToSeconds(benchmark.performance.percentiles.p25),
      this.paceToSeconds(benchmark.performance.percentiles.p50),
      this.paceToSeconds(benchmark.performance.percentiles.p75),
      this.paceToSeconds(benchmark.performance.percentiles.p90),
      this.paceToSeconds(benchmark.performance.percentiles.p95)
    ];

    if (userPaceSeconds <= percentiles[4]) return 95;
    if (userPaceSeconds <= percentiles[3]) return 90;
    if (userPaceSeconds <= percentiles[2]) return 75;
    if (userPaceSeconds <= percentiles[1]) return 50;
    if (userPaceSeconds <= percentiles[0]) return 25;
    return 10;
  }

  private calculateHRTrend(hrWorkouts: WorkoutData[]): 'improving' | 'stable' | 'declining' {
    if (hrWorkouts.length < 3) return 'stable';

    const recent = hrWorkouts.slice(-3).reduce((sum, w) => sum + w.heartRate!, 0) / 3;
    const older = hrWorkouts.slice(0, 3).reduce((sum, w) => sum + w.heartRate!, 0) / 3;

    if (recent < older - 3) return 'improving'; // FC baisse = amélioration
    if (recent > older + 3) return 'declining';
    return 'stable';
  }

  private calculateProgressionTrend(workouts: WorkoutData[]): 'improving' | 'stable' | 'declining' {
    if (workouts.length < 4) return 'stable';

    const recentPaces = workouts.slice(-3).map(w => this.paceToSeconds(w.pace));
    const olderPaces = workouts.slice(0, 3).map(w => this.paceToSeconds(w.pace));

    const recentAvg = recentPaces.reduce((sum, p) => sum + p, 0) / recentPaces.length;
    const olderAvg = olderPaces.reduce((sum, p) => sum + p, 0) / olderPaces.length;

    if (recentAvg < olderAvg - 5) return 'improving'; // Pace plus rapide = amélioration
    if (recentAvg > olderAvg + 10) return 'declining';
    return 'stable';
  }

  private paceToSeconds(pace: string): number {
    const [min, sec] = pace.split(':').map(Number);
    return min * 60 + sec;
  }

  private secondsToPace(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  // Cache management
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > new Date()) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expiry: new Date(Date.now() + this.CACHE_DURATION)
    });
  }

  // TODO: Implémenter les méthodes restantes pour la génération de recommandations
  private async findSimilarAthleteProfiles(userData: UserData) { return []; }
  private async getVolumeComparison(userData: UserData) { return null; }
  private async getProgressionRisk(userData: UserData) { return null; }
  private async getTrainingRecommendations(userData: UserData, profiles: any[]) { return []; }
  private async getRecoveryRecommendations(userData: UserData, profiles: any[]) { return []; }
  private async getProgressionRecommendations(userData: UserData, profiles: any[]) { return []; }
  private async getGoalAttemptData(distance: number, time: string, profiles: any[]) { return { total: 100, succeeded: 65, averageVolume: 30, successFactors: ['régularité', 'progression graduelle'] }; }
  private calculateSuccessProbability(userData: UserData, attempts: any, timeframe: number) { return 75; }
  private async generateGoalSpecificRecommendations(userData: UserData, attempts: any) { return []; }
  private getFallbackGoalPrediction(userData: UserData, distance: number, time: string) {
    return {
      successProbability: 60,
      similarAttemptsData: { total: 0, succeeded: 0, averageTrainingVolume: 25, criticalFactors: ['données insuffisantes'] },
      recommendations: []
    };
  }
}

export const collectiveDataService = new CollectiveDataService();