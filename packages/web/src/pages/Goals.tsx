import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { motion } from 'framer-motion';
import {
  Trophy,
  Target,
  Plus,
  Edit3,
  Clock,
  CheckCircle,
  Circle,
  TrendingUp,
  Calendar,
  Flag,
  Star,
  Award,
  Zap,
  Timer
} from 'lucide-react';

const Goals: React.FC = () => {
  const { userData } = useData();
  const [activeTab, setActiveTab] = useState('current');

  // Utilise les vrais objectifs de l'utilisateur
  const currentGoals = userData.goals.filter(goal => goal.status === 'active');
  const completedGoals = userData.goals.filter(goal => goal.status === 'completed');


  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Distance': return 'from-emerald-400 to-teal-400';
      case 'Forme': return 'from-pink-400 to-rose-400';
      case 'Performance': return 'from-orange-400 to-red-400';
      case 'Régularité': return 'from-blue-400 to-indigo-400';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Facile': return 'text-green-400 bg-green-400/10';
      case 'Moyen': return 'text-yellow-400 bg-yellow-400/10';
      case 'Élevé': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,215,0,0.1),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,193,7,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='rgba(255,215,0,0.03)' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent mb-2"
              >
                Objectifs Elite 🎯
              </motion.h1>
              <p className="text-gray-400">Définissez et atteignez vos objectifs de course</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-yellow-500/25 transition-all duration-300"
            >
              <Plus size={20} />
              Nouvel Objectif
            </motion.button>
          </div>

          {/* Global Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: 'Objectifs actifs',
                value: currentGoals.length.toString(),
                icon: Target,
                color: 'text-yellow-400'
              },
              {
                label: 'Taux de réussite',
                value: userData.goals.length > 0
                  ? `${Math.round((completedGoals.length / userData.goals.length) * 100)}%`
                  : '0%',
                icon: TrendingUp,
                color: 'text-green-400'
              },
              {
                label: 'Objectifs atteints',
                value: completedGoals.length.toString(),
                icon: Trophy,
                color: 'text-blue-400'
              },
              {
                label: 'Total objectifs',
                value: userData.goals.length.toString(),
                icon: Zap,
                color: 'text-orange-400'
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br from-white/10 to-white/5 ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/5 backdrop-blur-sm rounded-xl p-1 mb-8 w-fit">
          {[
            { id: 'current', label: 'Objectifs Actifs', icon: Target },
            { id: 'completed', label: 'Atteints', icon: Trophy }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg shadow-yellow-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Current Goals */}
        {activeTab === 'current' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-6"
          >
            {currentGoals.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center"
              >
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target size={32} className="text-black" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Aucun objectif défini</h3>
                  <p className="text-gray-400 mb-6">
                    Vous n'avez pas encore d'objectifs actifs. Créez votre premier objectif pour commencer à suivre vos progrès !
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black px-6 py-3 rounded-xl font-semibold flex items-center gap-2 mx-auto shadow-lg shadow-yellow-500/25 transition-all duration-300"
                  >
                    <Plus size={20} />
                    Créer un objectif
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              currentGoals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/8 transition-all duration-300 group"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Main Goal Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">{goal.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(goal.difficulty)}`}>
                            {goal.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-400 mb-2">{goal.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(goal.targetDate).toLocaleDateString('fr-FR')}
                          </span>
                          <span className={`px-2 py-1 rounded-lg text-xs bg-gradient-to-r ${getCategoryColor(goal.category)} bg-clip-text text-transparent font-semibold`}>
                            {goal.category}
                          </span>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-white transition-colors">
                        <Edit3 size={18} />
                      </button>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progression</span>
                        <span className="text-sm font-bold text-yellow-400">{goal.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${goal.progress}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                          className="h-full bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full shadow-lg shadow-yellow-400/30"
                        />
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">Cible hebdomadaire</div>
                        <div className="font-semibold">{goal.weeklyTarget}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">Récompense</div>
                        <div className="font-semibold">{goal.reward}</div>
                      </div>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="lg:w-80">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Flag size={16} />
                      Étapes clés
                    </h4>
                    <div className="space-y-2">
                      {goal.milestones.map((milestone, mIndex) => (
                        <motion.div
                          key={mIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (index * 0.1) + (mIndex * 0.05) }}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                            milestone.completed
                              ? 'bg-green-500/10 border border-green-500/20'
                              : 'bg-white/5 border border-white/10'
                          }`}
                        >
                          {milestone.completed ? (
                            <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                          ) : (
                            <Circle size={18} className="text-gray-400 flex-shrink-0" />
                          )}
                          <span className={milestone.completed ? 'text-white' : 'text-gray-400'}>
                            {milestone.name}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Completed Goals */}
        {activeTab === 'completed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4"
          >
            {completedGoals.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center"
              >
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy size={32} className="text-black" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Aucun objectif atteint</h3>
                  <p className="text-gray-400">
                    Vous n'avez pas encore d'objectifs complétés. Continuez vos efforts pour atteindre vos premiers objectifs !
                  </p>
                </div>
              </motion.div>
            ) : (
              completedGoals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-green-500/20 rounded-xl p-6 hover:bg-white/8 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-400">
                      <Trophy size={24} className="text-black" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{goal.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Atteint le {new Date(goal.completedDate).toLocaleDateString('fr-FR')}</span>
                        <span className={`px-2 py-1 rounded-lg text-xs bg-gradient-to-r ${getCategoryColor(goal.category)} bg-clip-text text-transparent font-semibold`}>
                          {goal.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">{goal.achievement}</div>
                    <div className="text-sm">{goal.reward}</div>
                  </div>
                </div>
              </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Goals;