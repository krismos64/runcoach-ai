import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  Shield,
  Target,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { useAdvancedAnalytics } from '../hooks/useAdvancedAnalytics';

interface AdvancedAnalyticsProps {
  className?: string;
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ className = '' }) => {
  const {
    isApiConnected,
    isLoading,
    error,
    workoutAnalysis,
    performanceTrend,
    injuryRisk,
    analyzeLatestWorkout,
    analyzePerformanceTrends,
    assessInjuryRisk,
    canAnalyzeWorkout,
    canAnalyzeTrends,
    canAssessRisk,
    hasEnoughDataForBasicAnalysis
  } = useAdvancedAnalytics();

  const [activeTab, setActiveTab] = useState<'workout' | 'trend' | 'risk'>('workout');

  // Analyse automatique au chargement
  useEffect(() => {
    if (isApiConnected && hasEnoughDataForBasicAnalysis) {
      const runInitialAnalysis = async () => {
        if (canAnalyzeWorkout) await analyzeLatestWorkout();
        if (canAnalyzeTrends) await analyzePerformanceTrends();
        if (canAssessRisk) await assessInjuryRisk();
      };
      runInitialAnalysis();
    }
  }, [isApiConnected, hasEnoughDataForBasicAnalysis]);

  if (!isApiConnected) {
    return (
      <div className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-3 text-gray-400">
          <Brain className="w-6 h-6" />
          <span className="text-lg">Analyses IA avancées non disponibles</span>
        </div>
        <p className="text-gray-500 text-center mt-2 text-sm">
          L'API Python n'est pas accessible. Fonctionnalités limitées aux analyses locales.
        </p>
      </div>
    );
  }

  if (!hasEnoughDataForBasicAnalysis) {
    return (
      <div className={`bg-gradient-to-br from-emerald-800/20 to-teal-800/20 rounded-2xl p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-3 text-emerald-400">
          <Activity className="w-6 h-6" />
          <span className="text-lg">Analyses IA en attente</span>
        </div>
        <p className="text-gray-300 text-center mt-2 text-sm">
          Minimum 3 entraînements requis pour les analyses avancées
        </p>
      </div>
    );
  }

  const tabs = [
    {
      id: 'workout' as const,
      label: 'Analyse Entraînement',
      icon: Brain,
      available: canAnalyzeWorkout,
      data: workoutAnalysis
    },
    {
      id: 'trend' as const,
      label: 'Tendances',
      icon: TrendingUp,
      available: canAnalyzeTrends,
      data: performanceTrend
    },
    {
      id: 'risk' as const,
      label: 'Risque Blessures',
      icon: Shield,
      available: canAssessRisk,
      data: injuryRisk
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-emerald-500/20 rounded-lg">
          <Brain className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Analyses IA Avancées</h3>
          <p className="text-gray-400 text-sm">Intelligence artificielle et machine learning</p>
        </div>
        {isLoading && (
          <div className="ml-auto">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-400 border-t-transparent" />
          </div>
        )}
      </div>

      {/* Onglets */}
      <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            disabled={!tab.available}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.id
                ? 'bg-emerald-500 text-white'
                : tab.available
                ? 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                : 'text-gray-500 cursor-not-allowed'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.available && tab.data && (
              <CheckCircle className="w-3 h-3 text-green-400" />
            )}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      <div className="min-h-[300px]">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">Erreur d'analyse</span>
            </div>
            <p className="text-red-300 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Analyse d'entraînement */}
        {activeTab === 'workout' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {workoutAnalysis ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Score global */}
                  <div className="bg-gray-800/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Score Global</span>
                      <span className={`text-2xl font-bold ${getScoreColor(workoutAnalysis.overall_score)}`}>
                        {Math.round(workoutAnalysis.overall_score)}/100
                      </span>
                    </div>
                  </div>

                  {/* Niveau de fatigue */}
                  <div className="bg-gray-800/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Fatigue</span>
                      <span className="text-white capitalize">
                        {workoutAnalysis.fatigue_level}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Analyse de l'allure */}
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Analyse de l'allure</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Allure actuelle:</span>
                      <span className="text-white ml-2">{workoutAnalysis.pace_analysis.current_pace}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Catégorie:</span>
                      <span className="text-emerald-400 ml-2 capitalize">
                        {workoutAnalysis.pace_analysis.pace_category}
                      </span>
                    </div>
                  </div>
                  {workoutAnalysis.pace_analysis.trend && (
                    <div className="mt-2">
                      <span className="text-gray-400 text-sm">Tendance:</span>
                      <span className="text-white ml-2 capitalize">
                        {workoutAnalysis.pace_analysis.trend}
                      </span>
                    </div>
                  )}
                </div>

                {/* Recommandations */}
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Récupération</h4>
                  <p className="text-gray-300 text-sm">
                    {workoutAnalysis.recovery_recommendation}
                  </p>
                </div>

                {/* Insights */}
                {workoutAnalysis.performance_insights.length > 0 && (
                  <div className="bg-gray-800/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Insights Performance</h4>
                    <ul className="space-y-2">
                      {workoutAnalysis.performance_insights.map((insight, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Zap className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Brain className="w-12 h-12 mb-4" />
                <p>Aucune analyse disponible</p>
                <button
                  onClick={analyzeLatestWorkout}
                  disabled={isLoading}
                  className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  Analyser maintenant
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Tendances de performance */}
        {activeTab === 'trend' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {performanceTrend ? (
              <>
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-medium">Tendance de Forme</h4>
                    <span className="text-emerald-400 capitalize">
                      {performanceTrend.fitness_trend}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{performanceTrend.period}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Évolution endurance */}
                  <div className="bg-gray-800/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Endurance</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tendance:</span>
                        <span className={`${
                          performanceTrend.endurance_evolution.trend > 0
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}>
                          {performanceTrend.endurance_evolution.trend > 0 ? '+' : ''}
                          {performanceTrend.endurance_evolution.trend.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Distance moy.:</span>
                        <span className="text-white">
                          {performanceTrend.endurance_evolution.average_distance.toFixed(1)} km
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Évolution vitesse */}
                  <div className="bg-gray-800/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Vitesse</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tendance:</span>
                        <span className={`${
                          performanceTrend.speed_evolution.trend > 0
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}>
                          {performanceTrend.speed_evolution.trend > 0 ? '+' : ''}
                          {performanceTrend.speed_evolution.trend.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Meilleure allure:</span>
                        <span className="text-white">
                          {Math.floor(performanceTrend.speed_evolution.best_pace / 60)}:
                          {String(performanceTrend.speed_evolution.best_pace % 60).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommandations */}
                {performanceTrend.recommendations.length > 0 && (
                  <div className="bg-gray-800/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Recommandations</h4>
                    <ul className="space-y-2">
                      {performanceTrend.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Target className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <TrendingUp className="w-12 h-12 mb-4" />
                <p>Aucune analyse de tendance disponible</p>
                <button
                  onClick={analyzePerformanceTrends}
                  disabled={isLoading}
                  className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  Analyser maintenant
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Évaluation des risques */}
        {activeTab === 'risk' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {injuryRisk ? (
              <>
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-medium">Risque Global</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`text-2xl font-bold ${getRiskColor(injuryRisk.overall_risk)}`}>
                        {injuryRisk.overall_risk.toUpperCase()}
                      </span>
                      <span className="text-gray-400">
                        ({Math.round(injuryRisk.risk_score)}/100)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Facteurs de risque */}
                {injuryRisk.risk_factors.length > 0 && (
                  <div className="bg-gray-800/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Facteurs de Risque</h4>
                    <div className="space-y-3">
                      {injuryRisk.risk_factors.map((factor, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-white text-sm font-medium">
                              {factor.description}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {factor.value} - Sévérité: {factor.severity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conseils de prévention */}
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Conseils de Prévention</h4>
                  <ul className="space-y-2">
                    {injuryRisk.prevention_tips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Shield className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions recommandées */}
                {injuryRisk.recommended_actions.length > 0 && (
                  <div className="bg-gray-800/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Actions Recommandées</h4>
                    <ul className="space-y-2">
                      {injuryRisk.recommended_actions.map((action, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Clock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Shield className="w-12 h-12 mb-4" />
                <p>Aucune évaluation des risques disponible</p>
                <button
                  onClick={assessInjuryRisk}
                  disabled={isLoading}
                  className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  Évaluer maintenant
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalytics;