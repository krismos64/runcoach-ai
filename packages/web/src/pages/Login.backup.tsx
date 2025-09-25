import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Eye,
  EyeOff,
  Activity,
  Mail,
  Lock,
  AlertCircle,
  Heart,
  TrendingUp,
  Zap,
  Shield,
  ArrowRight,
  Timer,
  Target,
  Award,
  Brain,
  Sparkles,
  Wind
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
  gdprConsent: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  gdpr?: string;
  general?: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false,
    gdprConsent: true
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showGdprModal, setShowGdprModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Vérification des identifiants
      const validUsers = [
        {
          email: 'c.mostefaoui@yahoo.fr',
          password: 'Mostefaoui1.',
          id: '1',
          name: 'Christophe Mostefaoui'
        },
        {
          email: 'demo@runcoach.fr',
          password: 'demo123',
          id: '2',
          name: 'Athlète RunCoach'
        }
      ];

      const user = validUsers.find(u =>
        u.email === formData.email && u.password === formData.password
      );

      if (!user) {
        throw new Error('Identifiants invalides');
      }

      const mockUser = {
        id: user.id,
        email: user.email,
        name: user.name
      };

      login(mockUser);
      navigate('/app/dashboard');
    } catch (error) {
      setErrors({
        general: 'Email ou mot de passe incorrect. Veuillez réessayer.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <>
      <Helmet>
        <title>Connexion | RunCoach AI - Votre Coach Personnel de Course</title>
        <meta name="description" content="Connectez-vous à RunCoach AI pour accéder à votre coaching personnalisé de course à pied basé sur l'intelligence artificielle. Entraînement adaptatif et suivi en temps réel." />
        <meta property="og:title" content="Connexion RunCoach AI - Coaching IA pour Coureurs" />
        <meta property="og:description" content="Accédez à votre programme d'entraînement personnalisé et suivez vos performances avec l'IA" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-login.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="RunCoach AI - Connexion" />
        <meta name="twitter:description" content="Votre coach personnel de course à pied basé sur l'IA" />
        <link rel="canonical" href="/login" />
      </Helmet>

      <div className="min-h-screen relative flex overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(255,255,255,0.05) 59px, rgba(255,255,255,0.05) 60px), repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(255,255,255,0.05) 59px, rgba(255,255,255,0.05) 60px)',
              backgroundSize: '60px 60px'
            }} />
          </div>
        </div>

        {/* Floating Health Icons Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 100
              }}
              animate={{
                y: -100,
                x: Math.random() * window.innerWidth,
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear",
                delay: i * 2
              }}
            >
              {i % 4 === 0 && <Heart className="w-8 h-8 text-red-400/20" />}
              {i % 4 === 1 && <Activity className="w-8 h-8 text-green-400/20" />}
              {i % 4 === 2 && <Wind className="w-8 h-8 text-blue-400/20" />}
              {i % 4 === 3 && <Zap className="w-8 h-8 text-yellow-400/20" />}
            </motion.div>
          ))}
        </div>

        {/* Left Side - Features */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-12"
        >
          <div className="max-w-xl">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex items-center space-x-4 mb-12"
            >
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 transform rotate-3">
                  <Activity className="w-10 h-10 text-white" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight">RunCoach AI</h1>
                <p className="text-emerald-300 text-sm font-medium">Votre partenaire santé & performance</p>
              </div>
            </motion.div>

            {/* Main Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-12"
            >
              <h2 className="text-5xl font-black text-white mb-4 leading-tight">
                Courez plus <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">intelligemment</span>
              </h2>
              <p className="text-xl text-emerald-100/80 font-light">
                L'IA qui comprend votre corps et optimise chaque foulée
              </p>
            </motion.div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-4 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
              >
                <Brain className="w-10 h-10 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold mb-1">IA Adaptative</h3>
                <p className="text-emerald-100/70 text-sm">Plans personnalisés qui évoluent avec vous</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
              >
                <Heart className="w-10 h-10 text-red-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold mb-1">Suivi Cardiaque</h3>
                <p className="text-emerald-100/70 text-sm">Analyse en temps réel de votre effort</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
              >
                <Shield className="w-10 h-10 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold mb-1">Prévention</h3>
                <p className="text-emerald-100/70 text-sm">Évitez les blessures avant qu'elles arrivent</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
              >
                <Target className="w-10 h-10 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold mb-1">Objectifs</h3>
                <p className="text-emerald-100/70 text-sm">Atteignez vos buts plus rapidement</p>
              </motion.div>
            </div>

          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-3xl mb-4 shadow-2xl"
              >
                <Activity className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-3xl font-black text-white">RunCoach AI</h1>
            </div>

            {/* Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur-xl opacity-30 animate-pulse" />

              {/* Main Card */}
              <div className="relative bg-black/80 backdrop-blur-2xl rounded-3xl p-8 border border-emerald-500/20 shadow-2xl">
                {/* Header Section with Animation */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 via-cyan-400 to-emerald-500 rounded-full mb-4 shadow-lg"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Activity className="w-8 h-8 text-white" />
                    </motion.div>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2"
                  >
                    Let's Run! 🏃‍♂️
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-emerald-100/70 font-light"
                  >
                    Votre séance personnalisée vous attend
                  </motion.p>

                  {/* Live Stats Bar */}
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-4 p-3 bg-gradient-to-r from-emerald-900/50 to-cyan-900/50 rounded-2xl border border-emerald-400/20"
                  >
                    <div className="flex items-center justify-center text-xs">
                      <div className="text-cyan-300">⚡ IA Active</div>
                    </div>
                  </motion.div>
                </div>

                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-red-900/30 backdrop-blur-sm border border-red-500/30 rounded-xl flex items-center space-x-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-200 text-sm">{errors.general}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                      <span className="flex items-center space-x-2">
                        <Mail className="w-3 h-3" />
                        <span>Adresse Email</span>
                      </span>
                    </label>
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className={`block w-full px-4 py-4 bg-emerald-950/50 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-emerald-400/50 focus:outline-none focus:border-emerald-400 focus:bg-emerald-900/50 transition-all ${
                          errors.email ? 'border-red-400' : 'border-emerald-800 hover:border-emerald-600'
                        }`}
                        placeholder="athlete@runcoach.ai"
                      />
                      {focusedField === 'email' && (
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                        />
                      )}
                    </motion.div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 text-sm text-red-600"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                      <span className="flex items-center space-x-2">
                        <Lock className="w-3 h-3" />
                        <span>Mot de passe</span>
                      </span>
                    </label>
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className={`block w-full px-4 pr-14 py-4 bg-emerald-950/50 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-emerald-400/50 focus:outline-none focus:border-emerald-400 focus:bg-emerald-900/50 transition-all ${
                          errors.password ? 'border-red-400' : 'border-emerald-800 hover:border-emerald-600'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-emerald-400 hover:text-emerald-300 transition-colors" />
                          ) : (
                            <Eye className="h-5 w-5 text-emerald-400 hover:text-emerald-300 transition-colors" />
                          )}
                        </motion.div>
                      </button>
                      {focusedField === 'password' && (
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                        />
                      )}
                    </motion.div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 text-sm text-red-600"
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="rememberMe"
                        name="rememberMe"
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-emerald-400 bg-emerald-950/50 border-emerald-600 rounded focus:ring-emerald-400 focus:ring-offset-0 focus:ring-offset-transparent"
                      />
                      <label htmlFor="rememberMe" className="ml-2 block text-sm text-emerald-200">
                        Se souvenir de moi
                      </label>
                    </div>

                    <Link
                      to="/forgot-password"
                      className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors hover:underline"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>

                  {/* GDPR Hidden Checkbox */}
                  <input
                    type="hidden"
                    id="gdprConsent"
                    name="gdprConsent"
                    value="true"
                  />
                  {/* Force GDPR consent to true in handleInputChange */}
                  <AnimatePresence>
                    {errors.gdpr && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-red-400 text-center"
                      >
                        {errors.gdpr}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative w-full flex justify-center items-center py-4 px-6 text-lg font-black rounded-2xl text-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 hover:from-emerald-300 hover:to-cyan-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_rgba(16,185,129,0.7)] overflow-hidden"
                  >
                    {/* Animated Background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="relative flex items-center">
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-black border-t-transparent rounded-full mr-2"
                          />
                          <span>Chargement...</span>
                        </>
                      ) : (
                        <>
                          <Activity className="w-5 h-5 mr-2" />
                          <span>COMMENCER L'ENTRAÎNEMENT</span>
                          <motion.div
                            className="ml-2"
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <ArrowRight className="w-5 h-5" />
                          </motion.div>
                        </>
                      )}
                    </span>
                  </motion.button>
              </form>

                {/* Features Pills */}
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 }}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-full border border-purple-500/30"
                  >
                    <span className="text-xs text-purple-300 font-medium">🎯 Plans IA personnalisés</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.1 }}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-full border border-blue-500/30"
                  >
                    <span className="text-xs text-blue-300 font-medium">💪 Suivi temps réel</span>
                  </motion.div>
                </div>

                {/* Sign Up Link */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-emerald-200/70">
                    Nouveau coureur ?{' '}
                    <Link
                      to="/register"
                      className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 transition-all"
                    >
                      Rejoindre la communauté →
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-8 flex justify-center items-center space-x-6"
            >
              <div className="flex items-center space-x-2 text-white/70">
                <Shield className="w-4 h-4" />
                <span className="text-xs">Données sécurisées</span>
              </div>
              <div className="flex items-center space-x-2 text-white/70">
                <Activity className="w-4 h-4" />
                <span className="text-xs">Compatible tous appareils</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* GDPR Modal */}
        <AnimatePresence>
          {showGdprModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={() => setShowGdprModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-2xl mx-auto bg-white rounded-2xl p-8 z-50 max-h-[80vh] overflow-y-auto shadow-xl"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Protection de vos données</h3>

                <div className="space-y-4 text-gray-700">
                  <div>
                    <h4 className="text-lg font-semibold text-emerald-600 mb-2 flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Vos données santé protégées
                    </h4>
                    <p className="text-sm ml-7">
                      Conformément au RGPD, vos données de santé et de performance sont chiffrées et stockées de manière sécurisée.
                      Nous ne partageons jamais vos informations personnelles sans votre consentement explicite.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-emerald-600 mb-2">
                      Utilisation des données
                    </h4>
                    <ul className="space-y-1 text-sm ml-7">
                      <li>• Personnalisation de vos plans d'entraînement</li>
                      <li>• Analyse de vos performances</li>
                      <li>• Prévention des blessures</li>
                      <li>• Amélioration continue de nos algorithmes</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-emerald-600 mb-2">
                      Vos droits
                    </h4>
                    <p className="text-sm ml-7">
                      Vous pouvez à tout moment accéder, modifier ou supprimer vos données personnelles depuis votre espace utilisateur.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, gdprConsent: true }));
                      setShowGdprModal(false);
                    }}
                    className="flex-1 py-3 px-4 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
                  >
                    J'accepte
                  </button>
                  <button
                    onClick={() => setShowGdprModal(false)}
                    className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Login;