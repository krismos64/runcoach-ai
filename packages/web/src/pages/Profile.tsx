import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  User,
  Lock,
  Camera,
  Edit,
  Save,
  X,
  Target,
  Heart,
  Weight,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  location: string;
  weight: number;
  height: number;
  restingHeartRate: number;
  maxHeartRate: number;
  runningLevel: string;
  primaryGoal: string;
  weeklyGoal: number;
  avatar?: string;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  shareWorkouts: boolean;
  shareProgress: boolean;
  dataSharing: boolean;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { userData } = useData();
  const [activeTab, setActiveTab] = useState<'profile' | 'goals' | 'privacy'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    id: user?.id || '',
    email: user?.email || '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    location: '',
    weight: 0,
    height: 0,
    restingHeartRate: 0,
    maxHeartRate: 0,
    runningLevel: '',
    primaryGoal: '',
    weeklyGoal: 0
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'private',
    shareWorkouts: false,
    shareProgress: false,
    dataSharing: false
  });

  // Calcul automatique de l'IMC
  const calculateBMI = (weight: number, height: number): number => {
    if (weight > 0 && height > 0) {
      return Number((weight / Math.pow(height / 100, 2)).toFixed(1));
    }
    return 0;
  };

  const bmi = calculateBMI(profile.weight, profile.height);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const runningLevels = [
    { value: 'beginner', label: 'Débutant (< 1 an)' },
    { value: 'intermediate', label: 'Intermédiaire (1-3 ans)' },
    { value: 'advanced', label: 'Avancé (3-5 ans)' },
    { value: 'expert', label: 'Expert (> 5 ans)' }
  ];

  const goals = [
    { value: '5k', label: '5K' },
    { value: '10k', label: '10K' },
    { value: 'semi-marathon', label: 'Semi-marathon' },
    { value: 'marathon', label: 'Marathon' },
    { value: 'fitness', label: 'Forme physique' },
    { value: 'weight-loss', label: 'Perte de poids' }
  ];

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };


  const handlePrivacyChange = (field: keyof PrivacySettings, value: any) => {
    setPrivacy(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Save profile data
    setIsEditing(false);
    // Show success message
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    // Change password logic
    setShowPasswordChange(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };


  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'goals', label: 'Objectifs', icon: Target },
    { id: 'privacy', label: 'Confidentialité', icon: Shield }
  ];

  return (
    <>
      <Helmet>
        <title>Profil | RunCoach AI</title>
        <meta name="description" content="Gérez votre profil RunCoach AI, vos objectifs d'entraînement et paramètres de confidentialité" />
        <meta property="og:title" content="Profil utilisateur RunCoach AI" />
        <meta property="og:description" content="Personnalisez votre expérience RunCoach AI" />
        <link rel="canonical" href="/profile" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-800 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.15),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='rgba(16,185,129,0.03)' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="relative z-10 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
        >
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2"
            >
              Mon Profil 🏃‍♂️
            </motion.h1>
            <p className="text-gray-400">Personnalisez votre expérience d'entraînement</p>
          </div>

          <div className="flex items-center space-x-4">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white border border-white/20 rounded-xl transition-all duration-300 hover:border-emerald-400/50 hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                  <span>Annuler</span>
                </button>
                <button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
                >
                  <Save className="w-4 h-4" />
                  <span>Sauvegarder</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Modifier</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-white shadow-2xl hover:bg-white/8 transition-all duration-300"
        >
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-black" />
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              )}
            </div>

            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold">{profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : 'Profil à compléter'}</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-emerald-100">Âge</div>
                  <div className="font-semibold">{profile.dateOfBirth ? `${calculateAge(profile.dateOfBirth)} ans` : '-'}</div>
                </div>
                <div>
                  <div className="text-emerald-100">Niveau</div>
                  <div className="font-semibold">{runningLevels.find(l => l.value === profile.runningLevel)?.label.split(' ')[0] || '-'}</div>
                </div>
                <div>
                  <div className="text-emerald-100">Objectif</div>
                  <div className="font-semibold">{goals.find(g => g.value === profile.primaryGoal)?.label || '-'}</div>
                </div>
                <div>
                  <div className="text-emerald-100">IMC</div>
                  <div className="font-semibold">{bmi > 0 ? bmi : '-'}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10 overflow-hidden"
        >
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-300 whitespace-nowrap relative ${
                    activeTab === tab.id
                      ? 'text-emerald-400 bg-white/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-400" />
                      Informations personnelles
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-emerald-100 mb-2">Prénom</label>
                        <input
                          type="text"
                          value={profile.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-white/5 text-white placeholder-gray-400 transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-100 mb-2">Nom</label>
                        <input
                          type="text"
                          value={profile.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-white/5 text-white placeholder-gray-400 transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-emerald-100 mb-2">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-white/5 text-white placeholder-gray-400 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-emerald-100 mb-2">Date de naissance</label>
                      <input
                        type="date"
                        value={profile.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-white/5 text-white placeholder-gray-400 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-emerald-100 mb-2">Téléphone</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-white/5 text-white placeholder-gray-400 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-emerald-100 mb-2">Localisation</label>
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-white/5 text-white placeholder-gray-400 transition-all duration-300"
                      />
                    </div>

                  </div>

                  {/* Physical Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Weight className="w-5 h-5 text-emerald-400" />
                      Données physiques
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-emerald-100 mb-2">Poids (kg)</label>
                        <input
                          type="number"
                          value={profile.weight}
                          onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-white/5 text-white placeholder-gray-400 transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-100 mb-2">Taille (cm)</label>
                        <input
                          type="number"
                          value={profile.height}
                          onChange={(e) => handleInputChange('height', Number(e.target.value))}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-white/5 text-white placeholder-gray-400 transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-emerald-100 mb-2">FC repos (bpm)</label>
                        <input
                          type="number"
                          value={profile.restingHeartRate}
                          onChange={(e) => handleInputChange('restingHeartRate', Number(e.target.value))}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-white/5 text-white placeholder-gray-400 transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-100 mb-2">FC max (bpm)</label>
                        <input
                          type="number"
                          value={profile.maxHeartRate}
                          onChange={(e) => handleInputChange('maxHeartRate', Number(e.target.value))}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-white/5 text-white placeholder-gray-400 transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-emerald-100 mb-2">Niveau de course</label>
                      <select
                        value={profile.runningLevel}
                        onChange={(e) => handleInputChange('runningLevel', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-white/5 text-white placeholder-gray-400 transition-all duration-300"
                      >
                        {runningLevels.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Health Metrics */}
                    <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20">
                      <h4 className="font-medium text-emerald-100 mb-3 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-emerald-400" />
                        Métriques de santé
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Weight className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-100">IMC: {bmi > 0 ? bmi : 'Non calculé'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Heart className="w-4 h-4 text-red-400" />
                          <span className="text-emerald-100">Zone cible: {profile.maxHeartRate > 0 ? `${Math.round(profile.maxHeartRate * 0.65)}-${Math.round(profile.maxHeartRate * 0.85)} bpm` : 'Non calculée'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Password Change */}
                    <div className="border-t pt-4">
                      <button
                        onClick={() => setShowPasswordChange(!showPasswordChange)}
                        className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors duration-300"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Changer le mot de passe</span>
                      </button>

                      {showPasswordChange && (
                        <div className="mt-4 space-y-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                          <div>
                            <label className="block text-sm font-medium text-emerald-100 mb-2">Mot de passe actuel</label>
                            <div className="relative">
                              <input
                                type={showPasswords.current ? 'text' : 'password'}
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-400 transition-all duration-300"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showPasswords.current ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-emerald-100 mb-2">Nouveau mot de passe</label>
                            <div className="relative">
                              <input
                                type={showPasswords.new ? 'text' : 'password'}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-400 transition-all duration-300"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showPasswords.new ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-emerald-100 mb-2">Confirmer le nouveau mot de passe</label>
                            <div className="relative">
                              <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-400 transition-all duration-300"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showPasswords.confirm ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => setShowPasswordChange(false)}
                              className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-300"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={handlePasswordChange}
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black px-4 py-2 rounded-lg font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-300"
                            >
                              Changer le mot de passe
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Goals Tab */}
            {activeTab === 'goals' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  Objectifs d'entraînement
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-emerald-100 mb-2">Objectif principal</label>
                    <select
                      value={profile.primaryGoal}
                      onChange={(e) => handleInputChange('primaryGoal', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    >
                      <option value="">Sélectionner votre objectif</option>
                      {goals.map((goal) => (
                        <option key={goal.value} value={goal.value}>
                          {goal.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-100 mb-2">Objectif hebdomadaire (km)</label>
                    <input
                      type="number"
                      value={profile.weeklyGoal}
                      onChange={(e) => handleInputChange('weeklyGoal', Number(e.target.value))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>

                {/* Goal Progress */}
                {profile.weeklyGoal > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                    <h4 className="font-medium text-green-900 mb-4">Progression vers vos objectifs</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-green-800">Objectif hebdomadaire</span>
                        <span className="font-semibold text-green-900">0 / {profile.weeklyGoal} km</span>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full"
                          style={{ width: '0%' }}
                        />
                      </div>
                      <p className="text-sm text-green-700">
                        Vos entraînements apparaîtront ici une fois que vous aurez importé ou saisi vos données.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  Paramètres de confidentialité
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-emerald-100 mb-2">Visibilité du profil</label>
                    <select
                      value={privacy.profileVisibility}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="public">Public</option>
                      <option value="friends">Amis uniquement</option>
                      <option value="private">Privé</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(privacy).filter(([key]) => key !== 'profileVisibility').map(([key, value]) => {
                      const labels = {
                        shareWorkouts: 'Partager mes entraînements',
                        shareProgress: 'Partager mes progrès',
                        dataSharing: 'Partage de données anonymes pour améliorer l\'app'
                      };

                      return (
                        <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                          <span className="font-medium text-white">
                            {labels[key as keyof typeof labels]}
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value as boolean}
                              onChange={(e) => handlePrivacyChange(key as keyof PrivacySettings, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
        </div>
      </div>
    </>
  );
};

export default Profile;