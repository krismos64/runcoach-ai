import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { useAdvancedAnalytics } from '../hooks/useAdvancedAnalytics';

const APITestComponent: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { isApiConnected, isLoading: analyticsLoading } = useAdvancedAnalytics();

  const testApiConnection = async () => {
    setLoading(true);
    setTestResult('');

    try {
      const healthCheck = await apiService.healthCheck();
      setTestResult(`✅ API Python connectée ! Version: ${healthCheck.version}`);
    } catch (error) {
      setTestResult(`❌ API Python non disponible: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const testWorkoutAnalysis = async () => {
    setLoading(true);
    setTestResult('');

    try {
      // Données de test
      const sampleWorkout = [
        {
          id: 'test_1',
          date: '2024-01-15',
          type: 'endurance' as const,
          duration: 45,
          distance: 8.5,
          pace: '5:30',
          heartRate: 150,
          calories: 400,
          notes: 'Test workout'
        }
      ];

      const analysis = await apiService.analyzeWorkout(sampleWorkout);
      setTestResult(`✅ Analyse IA réussie ! Score: ${analysis.overall_score}/100, Fatigue: ${analysis.fatigue_level}`);
    } catch (error) {
      setTestResult(`❌ Erreur analyse: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-white mb-4">Test API Python IA</h3>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isApiConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-gray-300">
            État: {isApiConnected ? 'Connecté' : 'Déconnecté'}
          </span>
        </div>

        <div className="space-y-2">
          <button
            onClick={testApiConnection}
            disabled={loading || analyticsLoading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Test en cours...' : 'Tester connexion API'}
          </button>

          <button
            onClick={testWorkoutAnalysis}
            disabled={loading || analyticsLoading}
            className="w-full px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Analyse en cours...' : 'Tester analyse IA'}
          </button>
        </div>

        {testResult && (
          <div className="mt-4 p-3 bg-gray-900 rounded text-sm text-gray-300 whitespace-pre-wrap">
            {testResult}
          </div>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <p>🐍 Backend Python: http://localhost:8000</p>
          <p>⚛️ Frontend React: http://localhost:3001</p>
        </div>
      </div>
    </div>
  );
};

export default APITestComponent;