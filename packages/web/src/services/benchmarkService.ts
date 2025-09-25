interface BenchmarkData {
  age_group: string;
  sex: 'male' | 'female';
  distance: string;
  percentile: number;
  time_seconds: number;
  pace_per_km: string;
}

interface UserBenchmarks {
  age_group: string;
  sex: 'male' | 'female';
  benchmarks: {
    '5k': BenchmarkData[];
    '10k': BenchmarkData[];
    'half_marathon': BenchmarkData[];
    'marathon': BenchmarkData[];
  };
}

interface PerformanceComparison {
  user_percentile: number;
  peer_group: string;
  distance: string;
  user_time: number;
  benchmark_times: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
}

// Simulation de données de benchmark réalistes basées sur des données publiques de course
const MOCK_BENCHMARKS: { [key: string]: UserBenchmarks } = {
  'male_20-29': {
    age_group: '20-29',
    sex: 'male',
    benchmarks: {
      '5k': [
        { age_group: '20-29', sex: 'male', distance: '5k', percentile: 10, time_seconds: 1680, pace_per_km: '5:36' },
        { age_group: '20-29', sex: 'male', distance: '5k', percentile: 25, time_seconds: 1500, pace_per_km: '5:00' },
        { age_group: '20-29', sex: 'male', distance: '5k', percentile: 50, time_seconds: 1320, pace_per_km: '4:24' },
        { age_group: '20-29', sex: 'male', distance: '5k', percentile: 75, time_seconds: 1200, pace_per_km: '4:00' },
        { age_group: '20-29', sex: 'male', distance: '5k', percentile: 90, time_seconds: 1080, pace_per_km: '3:36' }
      ],
      '10k': [
        { age_group: '20-29', sex: 'male', distance: '10k', percentile: 10, time_seconds: 3600, pace_per_km: '6:00' },
        { age_group: '20-29', sex: 'male', distance: '10k', percentile: 25, time_seconds: 3180, pace_per_km: '5:18' },
        { age_group: '20-29', sex: 'male', distance: '10k', percentile: 50, time_seconds: 2820, pace_per_km: '4:42' },
        { age_group: '20-29', sex: 'male', distance: '10k', percentile: 75, time_seconds: 2520, pace_per_km: '4:12' },
        { age_group: '20-29', sex: 'male', distance: '10k', percentile: 90, time_seconds: 2280, pace_per_km: '3:48' }
      ],
      'half_marathon': [
        { age_group: '20-29', sex: 'male', distance: 'half_marathon', percentile: 10, time_seconds: 8100, pace_per_km: '6:25' },
        { age_group: '20-29', sex: 'male', distance: 'half_marathon', percentile: 25, time_seconds: 7200, pace_per_km: '5:42' },
        { age_group: '20-29', sex: 'male', distance: 'half_marathon', percentile: 50, time_seconds: 6300, pace_per_km: '4:59' },
        { age_group: '20-29', sex: 'male', distance: 'half_marathon', percentile: 75, time_seconds: 5700, pace_per_km: '4:31' },
        { age_group: '20-29', sex: 'male', distance: 'half_marathon', percentile: 90, time_seconds: 5100, pace_per_km: '4:02' }
      ],
      'marathon': [
        { age_group: '20-29', sex: 'male', distance: 'marathon', percentile: 10, time_seconds: 18000, pace_per_km: '7:08' },
        { age_group: '20-29', sex: 'male', distance: 'marathon', percentile: 25, time_seconds: 15600, pace_per_km: '6:11' },
        { age_group: '20-29', sex: 'male', distance: 'marathon', percentile: 50, time_seconds: 13800, pace_per_km: '5:28' },
        { age_group: '20-29', sex: 'male', distance: 'marathon', percentile: 75, time_seconds: 12000, pace_per_km: '4:45' },
        { age_group: '20-29', sex: 'male', distance: 'marathon', percentile: 90, time_seconds: 10800, pace_per_km: '4:17' }
      ]
    }
  },
  'female_20-29': {
    age_group: '20-29',
    sex: 'female',
    benchmarks: {
      '5k': [
        { age_group: '20-29', sex: 'female', distance: '5k', percentile: 10, time_seconds: 1860, pace_per_km: '6:12' },
        { age_group: '20-29', sex: 'female', distance: '5k', percentile: 25, time_seconds: 1680, pace_per_km: '5:36' },
        { age_group: '20-29', sex: 'female', distance: '5k', percentile: 50, time_seconds: 1500, pace_per_km: '5:00' },
        { age_group: '20-29', sex: 'female', distance: '5k', percentile: 75, time_seconds: 1380, pace_per_km: '4:36' },
        { age_group: '20-29', sex: 'female', distance: '5k', percentile: 90, time_seconds: 1260, pace_per_km: '4:12' }
      ],
      '10k': [
        { age_group: '20-29', sex: 'female', distance: '10k', percentile: 10, time_seconds: 4020, pace_per_km: '6:42' },
        { age_group: '20-29', sex: 'female', distance: '10k', percentile: 25, time_seconds: 3600, pace_per_km: '6:00' },
        { age_group: '20-29', sex: 'female', distance: '10k', percentile: 50, time_seconds: 3180, pace_per_km: '5:18' },
        { age_group: '20-29', sex: 'female', distance: '10k', percentile: 75, time_seconds: 2880, pace_per_km: '4:48' },
        { age_group: '20-29', sex: 'female', distance: '10k', percentile: 90, time_seconds: 2640, pace_per_km: '4:24' }
      ],
      'half_marathon': [
        { age_group: '20-29', sex: 'female', distance: 'half_marathon', percentile: 10, time_seconds: 9300, pace_per_km: '7:22' },
        { age_group: '20-29', sex: 'female', distance: 'half_marathon', percentile: 25, time_seconds: 8100, pace_per_km: '6:25' },
        { age_group: '20-29', sex: 'female', distance: 'half_marathon', percentile: 50, time_seconds: 7200, pace_per_km: '5:42' },
        { age_group: '20-29', sex: 'female', distance: 'half_marathon', percentile: 75, time_seconds: 6480, pace_per_km: '5:08' },
        { age_group: '20-29', sex: 'female', distance: 'half_marathon', percentile: 90, time_seconds: 5820, pace_per_km: '4:36' }
      ],
      'marathon': [
        { age_group: '20-29', sex: 'female', distance: 'marathon', percentile: 10, time_seconds: 21000, pace_per_km: '8:19' },
        { age_group: '20-29', sex: 'female', distance: 'marathon', percentile: 25, time_seconds: 18600, pace_per_km: '7:22' },
        { age_group: '20-29', sex: 'female', distance: 'marathon', percentile: 50, time_seconds: 16200, pace_per_km: '6:25' },
        { age_group: '20-29', sex: 'female', distance: 'marathon', percentile: 75, time_seconds: 14400, pace_per_km: '5:42' },
        { age_group: '20-29', sex: 'female', distance: 'marathon', percentile: 90, time_seconds: 12600, pace_per_km: '4:59' }
      ]
    }
  },
  'male_30-39': {
    age_group: '30-39',
    sex: 'male',
    benchmarks: {
      '5k': [
        { age_group: '30-39', sex: 'male', distance: '5k', percentile: 10, time_seconds: 1740, pace_per_km: '5:48' },
        { age_group: '30-39', sex: 'male', distance: '5k', percentile: 25, time_seconds: 1560, pace_per_km: '5:12' },
        { age_group: '30-39', sex: 'male', distance: '5k', percentile: 50, time_seconds: 1380, pace_per_km: '4:36' },
        { age_group: '30-39', sex: 'male', distance: '5k', percentile: 75, time_seconds: 1260, pace_per_km: '4:12' },
        { age_group: '30-39', sex: 'male', distance: '5k', percentile: 90, time_seconds: 1140, pace_per_km: '3:48' }
      ],
      '10k': [
        { age_group: '30-39', sex: 'male', distance: '10k', percentile: 10, time_seconds: 3780, pace_per_km: '6:18' },
        { age_group: '30-39', sex: 'male', distance: '10k', percentile: 25, time_seconds: 3360, pace_per_km: '5:36' },
        { age_group: '30-39', sex: 'male', distance: '10k', percentile: 50, time_seconds: 2940, pace_per_km: '4:54' },
        { age_group: '30-39', sex: 'male', distance: '10k', percentile: 75, time_seconds: 2640, pace_per_km: '4:24' },
        { age_group: '30-39', sex: 'male', distance: '10k', percentile: 90, time_seconds: 2400, pace_per_km: '4:00' }
      ],
      'half_marathon': [
        { age_group: '30-39', sex: 'male', distance: 'half_marathon', percentile: 10, time_seconds: 8700, pace_per_km: '6:53' },
        { age_group: '30-39', sex: 'male', distance: 'half_marathon', percentile: 25, time_seconds: 7800, pace_per_km: '6:11' },
        { age_group: '30-39', sex: 'male', distance: 'half_marathon', percentile: 50, time_seconds: 6900, pace_per_km: '5:28' },
        { age_group: '30-39', sex: 'male', distance: 'half_marathon', percentile: 75, time_seconds: 6120, pace_per_km: '4:51' },
        { age_group: '30-39', sex: 'male', distance: 'half_marathon', percentile: 90, time_seconds: 5400, pace_per_km: '4:16' }
      ],
      'marathon': [
        { age_group: '30-39', sex: 'male', distance: 'marathon', percentile: 10, time_seconds: 19200, pace_per_km: '7:36' },
        { age_group: '30-39', sex: 'male', distance: 'marathon', percentile: 25, time_seconds: 16800, pace_per_km: '6:39' },
        { age_group: '30-39', sex: 'male', distance: 'marathon', percentile: 50, time_seconds: 14700, pace_per_km: '5:49' },
        { age_group: '30-39', sex: 'male', distance: 'marathon', percentile: 75, time_seconds: 12900, pace_per_km: '5:06' },
        { age_group: '30-39', sex: 'male', distance: 'marathon', percentile: 90, time_seconds: 11400, pace_per_km: '4:31' }
      ]
    }
  }
  // On peut ajouter plus de groupes d'âge selon les besoins...
};

const getAgeGroup = (age: number): string => {
  if (age < 20) return '18-19';
  if (age < 30) return '20-29';
  if (age < 40) return '30-39';
  if (age < 50) return '40-49';
  if (age < 60) return '50-59';
  return '60+';
};

const getBenchmarkKey = (age: number, sex: 'male' | 'female'): string => {
  const ageGroup = getAgeGroup(age);
  return `${sex}_${ageGroup}`;
};

const convertPaceToSeconds = (pace: string): number => {
  const [minutes, seconds] = pace.split(':').map(Number);
  return minutes * 60 + seconds;
};

export const fetchBenchmarkData = async (age: number, sex: 'male' | 'female'): Promise<UserBenchmarks | null> => {
  // Simulation d'une requête API avec délai
  await new Promise(resolve => setTimeout(resolve, 500));

  const benchmarkKey = getBenchmarkKey(age, sex);
  const benchmarks = MOCK_BENCHMARKS[benchmarkKey];

  if (!benchmarks) {
    // Fallback vers les données 20-29 si le groupe d'âge n'existe pas
    const fallbackKey = `${sex}_20-29`;
    return MOCK_BENCHMARKS[fallbackKey] || null;
  }

  return benchmarks;
};

export const compareUserPerformance = async (
  userAge: number,
  userSex: 'male' | 'female',
  userDistance: number, // en km
  userTimeSeconds: number
): Promise<PerformanceComparison | null> => {
  try {
    const benchmarks = await fetchBenchmarkData(userAge, userSex);
    if (!benchmarks) return null;

    // Déterminer quelle distance de benchmark utiliser
    let distanceKey: keyof typeof benchmarks.benchmarks;
    if (userDistance <= 5) {
      distanceKey = '5k';
    } else if (userDistance <= 10) {
      distanceKey = '10k';
    } else if (userDistance <= 21.1) {
      distanceKey = 'half_marathon';
    } else {
      distanceKey = 'marathon';
    }

    const distanceBenchmarks = benchmarks.benchmarks[distanceKey];

    // Calculer le percentile de l'utilisateur
    let userPercentile = 0;
    for (let i = 0; i < distanceBenchmarks.length; i++) {
      if (userTimeSeconds > distanceBenchmarks[i].time_seconds) {
        userPercentile = distanceBenchmarks[i].percentile;
        break;
      }
    }

    // Si l'utilisateur est plus rapide que le 90e percentile
    if (userPercentile === 0 && userTimeSeconds <= distanceBenchmarks[distanceBenchmarks.length - 1].time_seconds) {
      userPercentile = 95;
    }

    const benchmarkTimes = {
      p10: distanceBenchmarks.find(b => b.percentile === 10)?.time_seconds || 0,
      p25: distanceBenchmarks.find(b => b.percentile === 25)?.time_seconds || 0,
      p50: distanceBenchmarks.find(b => b.percentile === 50)?.time_seconds || 0,
      p75: distanceBenchmarks.find(b => b.percentile === 75)?.time_seconds || 0,
      p90: distanceBenchmarks.find(b => b.percentile === 90)?.time_seconds || 0,
    };

    const peerGroup = `${benchmarks.sex === 'male' ? 'Hommes' : 'Femmes'} ${benchmarks.age_group} ans`;

    return {
      user_percentile: userPercentile,
      peer_group: peerGroup,
      distance: distanceKey.replace('_', ' '),
      user_time: userTimeSeconds,
      benchmark_times: benchmarkTimes
    };

  } catch (error) {
    console.error('Erreur lors de la comparaison des performances:', error);
    return null;
  }
};

export const getPerformanceInsights = (comparison: PerformanceComparison): string[] => {
  const insights: string[] = [];

  if (comparison.user_percentile >= 90) {
    insights.push("🏆 Performance exceptionnelle ! Vous êtes dans le top 10% de votre catégorie.");
  } else if (comparison.user_percentile >= 75) {
    insights.push("🥇 Excellente performance ! Vous êtes dans le top 25% de votre catégorie.");
  } else if (comparison.user_percentile >= 50) {
    insights.push("👍 Bonne performance ! Vous êtes au-dessus de la moyenne de votre catégorie.");
  } else if (comparison.user_percentile >= 25) {
    insights.push("📈 Performance correcte, avec une belle marge de progression possible.");
  } else {
    insights.push("🎯 Excellent potentiel d'amélioration ! Chaque entraînement vous rapproche de vos objectifs.");
  }

  // Calcul du temps à gagner pour atteindre le percentile supérieur
  const currentTime = comparison.user_time;
  const nextTarget = comparison.user_percentile < 25 ? comparison.benchmark_times.p25 :
                    comparison.user_percentile < 50 ? comparison.benchmark_times.p50 :
                    comparison.user_percentile < 75 ? comparison.benchmark_times.p75 :
                    comparison.benchmark_times.p90;

  if (nextTarget && currentTime > nextTarget) {
    const timeToGain = currentTime - nextTarget;
    const minutesToGain = Math.floor(timeToGain / 60);
    const secondsToGain = timeToGain % 60;

    insights.push(`⏱️ Pour passer au niveau supérieur, visez ${minutesToGain}:${secondsToGain.toString().padStart(2, '0')} de moins.`);
  }

  return insights;
};

export const getTrainingRecommendations = (comparison: PerformanceComparison): string[] => {
  const recommendations: string[] = [];

  if (comparison.user_percentile < 25) {
    recommendations.push("🏃 Concentrez-vous sur l'augmentation progressive du volume d'entraînement");
    recommendations.push("💡 2-3 sorties par semaine en endurance fondamentale");
    recommendations.push("⏰ Intégrez 1 séance de fractionné court par semaine");
  } else if (comparison.user_percentile < 50) {
    recommendations.push("🎯 Alternez entre endurance et vitesse : 70% endurance, 30% intensité");
    recommendations.push("🏔️ Ajoutez des sorties longues pour développer l'endurance");
    recommendations.push("⚡ 1-2 séances de fractionné par semaine");
  } else if (comparison.user_percentile < 75) {
    recommendations.push("🔥 Travaillez les allures spécifiques à votre objectif de course");
    recommendations.push("🏃‍♂️ Intégrez du travail au seuil lactique (tempo runs)");
    recommendations.push("💪 Renforcez avec du travail de côtes");
  } else {
    recommendations.push("🚀 Affinez vos qualités avec du travail de vitesse pure");
    recommendations.push("🎪 Variez les entraînements : fartlek, pyramides, intervalles");
    recommendations.push("🧘 N'oubliez pas la récupération active et les étirements");
  }

  return recommendations;
};

// Fonction utilitaire pour obtenir des recommandations nutritionnelles basées sur les performances
export const getNutritionRecommendations = (comparison: PerformanceComparison): string[] => {
  const recommendations: string[] = [];

  if (comparison.distance.includes('marathon') || comparison.distance.includes('half')) {
    recommendations.push("🍌 Glucides complexes 2-3h avant les longues sorties");
    recommendations.push("💧 Hydratation pendant l'effort pour les sorties > 1h");
    recommendations.push("🔋 Récupération glucido-protéique dans les 30min post-effort");
  } else {
    recommendations.push("🥜 Alimentation équilibrée au quotidien");
    recommendations.push("💧 Hydratation régulière, surtout par temps chaud");
    recommendations.push("🍎 Privilégiez les aliments naturels et non transformés");
  }

  recommendations.push("☕ Caféine 30-60min avant l'effort pour optimiser les performances");

  return recommendations;
};