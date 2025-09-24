import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Activity,
  Calendar,
  Upload,
  User,
  Menu,
  X,
  LogOut,
  BarChart3,
  Target,
  Heart,
  Trophy,
  Settings,
  Zap,
  TrendingUp,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, color: 'from-blue-400 to-cyan-400' },
    { name: 'Séances', href: '/workouts', icon: Activity, color: 'from-emerald-400 to-green-400' },
    { name: 'Planning', href: '/training-plan', icon: Calendar, color: 'from-purple-400 to-pink-400' },
    { name: 'Stats', href: '/stats', icon: TrendingUp, color: 'from-orange-400 to-red-400' },
    { name: 'Objectifs', href: '/goals', icon: Trophy, color: 'from-yellow-400 to-amber-400' },
  ];

  const secondaryNav = [
    { name: 'Importer', href: '/import', icon: Upload },
    { name: 'Profil', href: '/profile', icon: User },
  ];

  const isActiveRoute = (href: string) => {
    return location.pathname === href;
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/90 backdrop-blur-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)]'
          : 'bg-black/50 backdrop-blur-xl'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo with Pulse Effect */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl blur-lg opacity-60 animate-pulse" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <span className="text-xl font-black text-white">
                  RunCoach
                </span>
                <span className="text-xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent ml-1">
                  AI
                </span>
              </div>
            </motion.div>

            {/* Desktop Navigation - Center */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href);

                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.href}
                      className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 group ${
                        isActive
                          ? 'text-white'
                          : 'text-emerald-100/70 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-xl opacity-20`}
                          initial={false}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="activeBorder"
                          className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-xl opacity-100`}
                          style={{ padding: '2px' }}
                          initial={false}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        >
                          <div className="w-full h-full bg-black/80 rounded-[10px]" />
                        </motion.div>
                      )}
                      <Icon className={`w-4 h-4 relative z-10 ${
                        isActive ? 'text-white' : 'group-hover:text-emerald-400'
                      }`} />
                      <span className="relative z-10">{item.name}</span>
                      {isActive && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -right-1 -top-1 w-2 h-2 bg-emerald-400 rounded-full"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Right Side - User Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Live Stats */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-900/30 rounded-full border border-emerald-500/20"
              >
                <Heart className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-xs text-emerald-300 font-medium">156 bpm</span>
                <div className="w-px h-4 bg-emerald-500/20" />
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-emerald-300 font-medium">Zone 3</span>
              </motion.div>


              {/* Settings */}
              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-emerald-100/70 hover:text-white transition-all"
              >
                <Settings className="w-5 h-5" />
              </motion.button>

              {/* User Profile Dropdown */}
              <div className="relative group">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-emerald-900/30 border border-emerald-500/20 hover:bg-emerald-900/50 transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-black">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-emerald-400 font-medium">Niveau 12</p>
                    <p className="text-xs text-emerald-100/70">{user?.name || 'Athlète'}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:rotate-90 transition-transform" />
                </motion.button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                  <motion.div
                    initial={{ scale: 0.95, y: -10 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-black/90 backdrop-blur-xl rounded-xl shadow-xl border border-emerald-500/20 overflow-hidden"
                  >
                    <div className="p-3 border-b border-emerald-500/20">
                      <p className="text-sm font-semibold text-white">{user?.email || 'user@runcoach.ai'}</p>
                      <p className="text-xs text-emerald-400 mt-1">Premium Member</p>
                    </div>

                    {secondaryNav.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-emerald-100/70 hover:text-white hover:bg-emerald-900/30 transition-colors"
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}

                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors w-full border-t border-emerald-500/20"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </button>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-white bg-emerald-900/30 border border-emerald-500/20"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-black/95 backdrop-blur-2xl border-t border-emerald-500/20"
            >
              <div className="px-4 py-4 space-y-2">
                {/* User Info Mobile */}
                <div className="flex items-center space-x-3 px-3 py-3 mb-4 rounded-xl bg-emerald-900/30 border border-emerald-500/20">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-black">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user?.name || 'Athlète'}</p>
                    <p className="text-xs text-emerald-400">Niveau 12 • Premium</p>
                  </div>
                </div>

                {/* Mobile Navigation Links */}
                {[...navigation, ...secondaryNav].map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.href);

                  return (
                    <motion.div
                      key={item.name}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'text-white bg-gradient-to-r from-emerald-900/50 to-cyan-900/50 border border-emerald-500/30'
                            : 'text-emerald-100/70 hover:text-white hover:bg-emerald-900/30'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : ''}`} />
                        <span>{item.name}</span>
                        {isActive && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="ml-auto w-2 h-2 bg-emerald-400 rounded-full"
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Mobile Stats */}
                <div className="flex items-center justify-around py-3 px-3 rounded-xl bg-emerald-900/30 border border-emerald-500/20">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-400 animate-pulse" />
                    <span className="text-xs text-emerald-300 font-medium">156 bpm</span>
                  </div>
                  <div className="w-px h-4 bg-emerald-500/20" />
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-emerald-300 font-medium">Zone 3</span>
                  </div>
                  <div className="w-px h-4 bg-emerald-500/20" />
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-emerald-300 font-medium">45:23</span>
                  </div>
                </div>

                {/* Logout Mobile */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-red-900/30 to-pink-900/30 border border-red-500/30 text-red-400 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Déconnexion</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content with animated background */}
      <main className="pt-16 min-h-screen relative">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Floating Action Button - Mobile */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center z-50"
      >
        <Activity className="w-6 h-6 text-white" />
      </motion.button>
    </div>
  );
};

export default Layout;