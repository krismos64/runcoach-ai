import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Bot,
  User,
  Send,
  Sparkles,
  TrendingUp,
  Heart,
  Zap,
  Award,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Target,
  Activity,
  Brain,
  Flame
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import type { ChatMessage, CoachAnalysis } from '../shared/types';
import {
  compareUserPerformance,
  getPerformanceInsights,
  getTrainingRecommendations,
  getNutritionRecommendations
} from '../services/benchmarkService';
import {
  ChatbotEnhancementService,
  type EnhancedChatbotResponse,
  type ChatbotCapabilities
} from '../services/chatbotEnhancementService';
import { apiService } from '../services/apiService';

interface AICoachChatbotProps {
  className?: string;
}

const AICoachChatbot: React.FC<AICoachChatbotProps> = ({ className }) => {
  const { userData, updateProfile } = useData();
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatbotCapabilities, setChatbotCapabilities] = useState<ChatbotCapabilities | null>(null);
  const [enhancedMode, setEnhancedMode] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Analyse des capacités du chatbot basées sur les données disponibles
  useEffect(() => {
    const capabilities = ChatbotEnhancementService.analyzeChatbotCapabilities(userData);
    setChatbotCapabilities(capabilities);
  }, [userData]);

  // Message de bienvenue personnalisé
  useEffect(() => {
    if (messages.length === 0) {
      const generateAndSetWelcome = async () => {
        const welcomeMessage = await generateWelcomeMessage();
        setMessages([welcomeMessage]);
      };
      generateAndSetWelcome();
    }
  }, [userData]);

  const generateWelcomeMessage = async (): Promise<ChatMessage> => {
    const { profile, stats, workouts } = userData;
    const coachPersonality = profile.preferences.coachPersonality || 'friendly';

    let welcomeText = '';
    let motivationalMessage = '';

    // Messages de bienvenue basés sur les DONNÉES RÉELLES de l'utilisateur
    const hasData = workouts.length > 0;
    const totalKm = stats.totalDistance;
    const recentActivity = hasData ? workouts[workouts.length - 1] : null;

    // Déterminer les informations manquantes pour poser des questions pertinentes
    const missingProfileData = [];
    if (!profile.age) missingProfileData.push('âge');
    if (!profile.weight) missingProfileData.push('poids');
    if (!profile.height) missingProfileData.push('taille');
    if (!profile.runningExperience) missingProfileData.push('expérience en course');
    if (!profile.sex) missingProfileData.push('sexe');

    switch (coachPersonality) {
      case 'motivational':
        welcomeText = `🔥 Salut ${profile.name} ! Coach IA ici, prêt(e) à DÉCUPLER votre potentiel !`;
        if (hasData) {
          if (totalKm > 100) {
            motivationalMessage = `${stats.totalWorkouts} séances, ${totalKm}km ! VOUS ÊTES DÉJÀ UN(E) ATHLÈTE ! Ensemble, on va EXPLOSER vos prochains objectifs ! 💥🚀`;
          } else if (totalKm > 20) {
            motivationalMessage = `${totalKm}km parcourus ! La MACHINE est lancée ! Prêt(e) à passer au niveau supérieur ? 💪⚡`;
          } else {
            motivationalMessage = `${stats.totalWorkouts} sorties au compteur ! Chaque foulée vous TRANSFORME ! On accélère ? 🏃‍♂️💨`;
          }
        } else {
          motivationalMessage = "AUJOURD'HUI commence votre LÉGENDE ! Chaque grand coureur a commencé par dire OUI ! C'est VOTRE moment ! 🌟🔥";

          // Ajouter des questions pour mieux connaître l'utilisateur
          if (missingProfileData.length > 0) {
            motivationalMessage += `\n\n🎯 Pour MAXIMISER vos résultats, j'aimerais mieux vous connaître !\nPouvez-vous me parler de votre ${missingProfileData[0]} et de vos objectifs running ?`;
          } else if (!hasData) {
            motivationalMessage += `\n\n💪 Dites-moi : quel est votre RÊVE en course à pied ? Un 5K, 10K, semi, marathon ? Ou simplement rester en forme ?`;
          }
        }
        break;

      case 'analytical':
        welcomeText = `📊 ${profile.name}, Coach IA analytique à votre service.`;
        if (hasData) {
          motivationalMessage = `Dataset actuel : ${stats.totalWorkouts} sessions, ${totalKm}km total, pace ${stats.averagePace}. Prêt pour l'analyse détaillée et l'optimisation de vos performances.`;
        } else {
          motivationalMessage = "En attente de vos premières données d'entraînement pour initier l'analyse comparative et les recommandations personnalisées.";

          // Questions analytiques pour collecter des données
          if (missingProfileData.length > 0) {
            motivationalMessage += `\n\n📋 Données manquantes détectées : ${missingProfileData.join(', ')}.\nPourriez-vous me fournir ces informations pour optimiser l'analyse ?`;
          } else if (!hasData) {
            motivationalMessage += `\n\n📊 Questionnaire initial :\n1. Quelle est votre expérience en course ?\n2. Avez-vous des objectifs temporels précis ?\n3. Fréquence d'entraînement souhaitée ?`;
          }
        }
        break;

      case 'professional':
        welcomeText = `Bonjour ${profile.name}, je suis votre coach running personnel.`;
        if (hasData) {
          motivationalMessage = `Bilan de votre parcours : ${stats.totalWorkouts} séances, ${totalKm}km parcourus. Analysons ensemble vos axes de progression pour atteindre vos objectifs.`;
        } else {
          motivationalMessage = "Commençons par établir une base solide. Mon rôle : vous accompagner méthodiquement vers vos objectifs running.";

          // Questions professionnelles structurées
          if (missingProfileData.length > 0) {
            motivationalMessage += `\n\n📝 Pour établir un programme personnalisé, j'ai besoin de connaître votre ${missingProfileData[0]}.\nPouvez-vous me renseigner cette information ?`;
          } else if (!hasData) {
            motivationalMessage += `\n\n📋 Entretien initial nécessaire :\n- Quel est votre historique sportif ?\n- Quels sont vos objectifs à court et long terme ?\n- Avez-vous des contraintes particulières ?`;
          }
        }
        break;

      default: // friendly
        welcomeText = `👋 Salut ${profile.name} ! Coach IA, votre compagnon running !`;
        if (hasData) {
          if (totalKm > 50) {
            motivationalMessage = `Wow ! ${stats.totalWorkouts} sorties, ${totalKm}km... Quel parcours ! J'ai hâte de voir vos prochains progrès 😊🎉`;
          } else {
            motivationalMessage = `${stats.totalWorkouts} sorties déjà ! J'adore votre régularité ! Continuons cette belle aventure ensemble 🏃‍♀️✨`;
          }
        } else {
          motivationalMessage = "Prêt(e) pour cette nouvelle aventure ? J'ai hâte de vous accompagner à chaque foulée ! 🌟😊";

          // Questions amicales pour mieux connaître l'utilisateur
          if (missingProfileData.length > 0) {
            motivationalMessage += `\n\n😊 Pour mieux vous accompagner, j'aimerais en savoir plus sur vous !\nPouvez-vous me parler de votre ${missingProfileData[0]} ? Et dites-moi, qu'est-ce qui vous motive à courir ?`;
          } else if (!hasData) {
            motivationalMessage += `\n\n🤗 J'aimerais faire votre connaissance !\n- Qu'est-ce qui vous attire dans la course ?\n- Avez-vous déjà couru par le passé ?\n- Y a-t-il un défi que vous aimeriez relever ?`;
          }
        }
    }

    const analysis = await generateInitialAnalysis();

    return {
      id: 'welcome-' + Date.now(),
      type: 'coach',
      content: `${welcomeText}\n\n${motivationalMessage}`,
      timestamp: new Date(),
      analysis
    };
  };

  const generateInitialAnalysis = async (): Promise<CoachAnalysis> => {
    const { stats, profile, workouts } = userData;

    const insights: string[] = [];
    const recommendations = {
      training: [] as string[],
      recovery: [] as string[],
      nutrition: [] as string[],
      goals: [] as string[]
    };

    // Valeurs par défaut uniquement si aucune donnée utilisateur
    let pacePercentile = 0;
    let distancePercentile = 0;
    let consistencyScore = 0;

    // ANALYSE BASÉE UNIQUEMENT SUR LES DONNÉES RÉELLES DE L'UTILISATEUR
    if (workouts.length > 0) {
      // Calcul du score de consistance basé sur les données réelles
      consistencyScore = Math.min(100, stats.totalWorkouts * 10);

      // Analyse de la progression réelle
      if (workouts.length >= 2) {
        const recent = workouts.slice(-Math.min(3, workouts.length));
        const older = workouts.slice(0, Math.min(3, workouts.length));

        const avgPaceRecent = recent.reduce((sum, w) => {
          const [min, sec] = w.pace.split(':').map(Number);
          return sum + (min * 60 + sec);
        }, 0) / recent.length;

        const avgPaceOlder = older.reduce((sum, w) => {
          const [min, sec] = w.pace.split(':').map(Number);
          return sum + (min * 60 + sec);
        }, 0) / older.length;

        if (avgPaceRecent < avgPaceOlder - 5) {
          insights.push("🚀 Excellente progression ! Votre pace s'améliore au fil des entraînements");
          pacePercentile = 70; // Progression = bon niveau estimé
        } else if (avgPaceRecent > avgPaceOlder + 10) {
          insights.push("📊 Pace en légère hausse récemment - normal selon les cycles d'entraînement");
          recommendations.recovery.push("🛌 Pensez à intégrer plus de récupération");
        } else {
          insights.push("📈 Pace stable, bon maintien de votre niveau actuel");
          pacePercentile = 50;
        }
      } else {
        // Premier workout ou peu de données
        insights.push("🎯 Première analyse - continuez à accumuler des données pour plus de précision");
        pacePercentile = 50;
      }

      // Analyse du volume d'entraînement
      distancePercentile = Math.min(90, stats.currentWeekDistance * 15);
      if (stats.currentWeekDistance > 20) {
        insights.push("💪 Volume d'entraînement solide cette semaine !");
      } else if (stats.currentWeekDistance > 10) {
        insights.push("👍 Bon rythme d'entraînement, vous construisez progressivement");
      } else if (stats.currentWeekDistance > 0) {
        insights.push("🌱 Début prometteur, chaque kilomètre compte !");
        recommendations.goals.push("🎯 Objectif : augmenter progressivement le volume hebdomadaire");
      }

      // Utilisation des benchmarks uniquement si profil complet
      if (profile.age && profile.sex && stats.averagePace !== "0:00") {
        try {
          const avgPaceSeconds = parseInt(stats.averagePace.split(':')[0]) * 60 + parseInt(stats.averagePace.split(':')[1]);
          const avgDistance = stats.totalDistance / stats.totalWorkouts;
          const avgTimeSeconds = avgPaceSeconds * avgDistance;

          const comparison = await compareUserPerformance(
            profile.age,
            profile.sex,
            avgDistance,
            avgTimeSeconds
          );

          if (comparison) {
            pacePercentile = comparison.user_percentile;

            const performanceInsights = getPerformanceInsights(comparison);
            insights.push(...performanceInsights);

            const trainingRecs = getTrainingRecommendations(comparison);
            recommendations.training.push(...trainingRecs);

            const nutritionRecs = getNutritionRecommendations(comparison);
            recommendations.nutrition.push(...nutritionRecs);
          }
        } catch (error) {
          console.log('Benchmarks non disponibles, analyse basée sur vos données uniquement');
        }
      }
    } else {
      // AUCUNE DONNÉE D'ENTRAÎNEMENT - Messages motivants et réalistes
      insights.push("🌟 Prêt(e) à commencer votre parcours running ? Chaque grand coureur a commencé par un premier pas !");

      recommendations.goals.push("🎯 Commencez par un objectif simple : 3 sorties par semaine");
      recommendations.training.push("🏃‍♀️ Alternez marche et course lors de vos premières sorties");
      recommendations.training.push("⏰ Commencez par 20-30 minutes, l'important c'est la régularité");

      if (profile.runningExperience === 'beginner') {
        recommendations.training.push("👟 Investissez dans de bonnes chaussures adaptées à votre foulée");
        insights.push("📚 En tant que débutant, la progression viendra naturellement avec la constance");
      }
    }

    // RECOMMANDATIONS BASÉES SUR L'ACTIVITÉ RÉELLE
    if (workouts.length > 0) {
      // Recommandations d'entraînement basées sur la fréquence réelle
      const sessionsThisWeek = workouts.filter(w => {
        const workoutDate = new Date(w.date);
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return workoutDate >= weekStart;
      }).length;

      if (sessionsThisWeek >= 4) {
        recommendations.recovery.push("🛌 4+ sorties cette semaine - une journée de récupération serait parfaite");
      } else if (sessionsThisWeek <= 1) {
        recommendations.goals.push("🎯 Essayez d'ajouter 1-2 sorties cette semaine pour maintenir le rythme");
      }

      // Recommandations basées sur les distances réelles
      const avgDistance = stats.totalDistance / stats.totalWorkouts;
      if (avgDistance > 10) {
        recommendations.nutrition.push("🍌 Avec vos distances, pensez à l'hydratation pendant l'effort");
        recommendations.training.push("💪 Vos longues sorties construisent une excellente endurance de base");
      } else if (avgDistance < 5) {
        recommendations.goals.push("🎯 Quand vous vous sentirez prêt(e), essayez d'allonger progressivement une sortie");
        recommendations.training.push("⏰ Vos sorties courtes sont parfaites pour construire l'habitude");
      }

      // Conseils basés sur la régularité réelle
      if (stats.totalWorkouts >= 10) {
        insights.push("🏆 10+ sorties ! Vous développez une vraie constance - clé de la progression");
        recommendations.training.push("🎯 Votre régularité établie, vous pouvez maintenant varier les intensités");
      } else if (stats.totalWorkouts >= 5) {
        insights.push("👏 Plus de 5 sorties ! L'habitude se construit, continuez sur cette lancée");
      }
    } else {
      // Conseils pour débutants sans données
      recommendations.nutrition.push("💧 Hydratation : commencez toujours hydraté(e), finissez hydraté(e)");
      recommendations.training.push("👟 Commencez par 3 sorties/semaine de 20-30 minutes");
      recommendations.goals.push("🎯 Premier objectif : 1 mois de régularité, 3x/semaine minimum");
    }

    // ANALYSES BASÉES SUR LES DONNÉES RÉELLES DU PROFIL
    if (profile.age && profile.weight && profile.height) {
      const bmi = profile.bmi || (profile.weight / Math.pow(profile.height / 100, 2));

      // Conseils réalistes basés sur l'IMC réel
      if (bmi < 18.5) {
        recommendations.nutrition.push("💪 Votre IMC indique un poids léger - assurez-vous d'avoir suffisamment d'énergie pour vos entraînements");
        insights.push(`📊 IMC actuel : ${bmi.toFixed(1)} - Pensez à équilibrer entraînement et nutrition`);
      } else if (bmi > 25) {
        recommendations.training.push("🏃 La course à pied est excellente pour optimiser la composition corporelle");
        insights.push(`📊 IMC actuel : ${bmi.toFixed(1)} - La régularité sera votre meilleur allié`);
        recommendations.goals.push("🎯 Objectif santé : combinez course et alimentation équilibrée");
      } else {
        insights.push(`💚 IMC optimal (${bmi.toFixed(1)}) - parfait pour la performance en course !`);
      }
    }

    // ANALYSES BASÉES SUR L'HISTORIQUE RÉEL DES WORKOUTS
    if (workouts.length > 0) {
      const recentWorkout = workouts[workouts.length - 1];

      // Analyse de la fréquence cardiaque réelle
      if (recentWorkout.heartRate && recentWorkout.heartRate > 0) {
        if (recentWorkout.heartRate > 180) {
          recommendations.recovery.push("❤️ FC élevée lors de votre dernière sortie - récupération importante");
          insights.push(`💓 Dernière FC : ${recentWorkout.heartRate} bpm - intensité élevée détectée`);
        } else if (recentWorkout.heartRate < 120) {
          insights.push(`💓 FC modérée (${recentWorkout.heartRate} bpm) - sortie en endurance parfaite`);
          recommendations.training.push("🎯 Vous pouvez ajouter des phases plus intenses si souhaité");
        } else {
          insights.push(`💓 FC équilibrée (${recentWorkout.heartRate} bpm) - bonne intensité d'entraînement`);
        }
      }

      // Conseils météo basés sur les conditions réelles
      if (recentWorkout.weather?.temperature !== undefined) {
        if (recentWorkout.weather.temperature > 25) {
          recommendations.training.push(`☀️ Il faisait ${recentWorkout.weather.temperature}°C - continuez à bien vous hydrater`);
          insights.push("🌡️ Vous gérez bien la course par temps chaud !");
        } else if (recentWorkout.weather.temperature < 5) {
          recommendations.training.push(`🥶 Température de ${recentWorkout.weather.temperature}°C - échauffement extra important`);
          insights.push("❄️ Bravo pour votre motivation par temps froid !");
        } else {
          insights.push(`🌤️ Conditions parfaites (${recentWorkout.weather.temperature}°C) pour vos dernières sorties`);
        }
      }

      // Analyse des données de cadence et puissance réelles
      if (recentWorkout.cadence && recentWorkout.cadence > 0) {
        if (recentWorkout.cadence > 180) {
          insights.push(`🦶 Cadence élevée (${recentWorkout.cadence} pas/min) - efficacité énergétique excellente`);
        } else if (recentWorkout.cadence < 160) {
          recommendations.training.push("🦶 Essayez d'augmenter légèrement votre cadence pour plus d'efficacité");
          insights.push(`🦶 Cadence actuelle : ${recentWorkout.cadence} pas/min - marge d'amélioration`);
        } else {
          insights.push(`🦶 Cadence optimale (${recentWorkout.cadence} pas/min) - continuez ainsi !`);
        }
      }

      if (recentWorkout.power && recentWorkout.power > 0) {
        insights.push(`⚡ Puissance de course : ${recentWorkout.power}W - donnée avancée intéressante !`);
        recommendations.training.push("💪 Utilisez ces données de puissance pour optimiser vos intervalles");
      }

      // Analyse du dénivelé réel
      if (recentWorkout.elevation?.gain && recentWorkout.elevation.gain > 0) {
        if (recentWorkout.elevation.gain > 200) {
          insights.push(`🏔️ ${recentWorkout.elevation.gain}m de dénivelé - excellent travail de renforcement !`);
          recommendations.recovery.push("🛌 Les côtes fatiguent plus - récupération adaptée nécessaire");
        } else {
          insights.push(`⛰️ ${recentWorkout.elevation.gain}m de dénivelé - variété parfaite pour progresser`);
        }
      }
    }

    // Message motivationnel RÉALISTE basé sur les données réelles
    let motivationalMessage = "";

    if (workouts.length === 0) {
      // Aucune donnée - messages motivants pour commencer
      if (profile.preferences.coachPersonality === 'motivational') {
        motivationalMessage = "🚀 C'EST LE MOMENT DE COMMENCER ! Chaque légende a eu un jour 1 !";
      } else if (profile.preferences.coachPersonality === 'analytical') {
        motivationalMessage = "📊 Prêt pour la collecte de données ? Vos premières métriques seront précieuses.";
      } else if (profile.preferences.coachPersonality === 'professional') {
        motivationalMessage = "Commençons méthodiquement. La base solide d'aujourd'hui devient la performance de demain.";
      } else {
        motivationalMessage = "😊 Prêt(e) pour l'aventure ? Je serai là à chaque étape !";
      }
    } else {
      // Avec des données - messages basés sur les performances réelles
      const totalKm = stats.totalDistance;
      const sessionsCount = stats.totalWorkouts;

      if (profile.preferences.coachPersonality === 'motivational') {
        if (totalKm > 100) {
          motivationalMessage = `🔥 ${totalKm}km au compteur ! VOUS ÊTES UN(E) GUERRIER(ÈRE) ! Continuez à écraser vos limites !`;
        } else if (totalKm > 20) {
          motivationalMessage = `💪 ${totalKm}km, ${sessionsCount} sorties ! Vous construisez quelque chose de GRAND !`;
        } else {
          motivationalMessage = `🚀 ${totalKm}km déjà ! Chaque kilomètre vous TRANSFORME ! Ne vous arrêtez pas !`;
        }
      } else if (profile.preferences.coachPersonality === 'analytical') {
        motivationalMessage = `📊 Dataset : ${sessionsCount} sessions, ${totalKm}km, pace ${stats.averagePace}. Progression calculée, optimisation en cours.`;
      } else if (profile.preferences.coachPersonality === 'professional') {
        motivationalMessage = `Bilan : ${totalKm}km parcourus en ${sessionsCount} séances. Votre constance établit les bases de votre progression future.`;
      } else {
        if (totalKm > 50) {
          motivationalMessage = `🌟 ${totalKm}km ensemble ! Vous progressez formidablement bien !`;
        } else {
          motivationalMessage = `😊 ${sessionsCount} sorties, ${totalKm}km... J'adore voir votre progression !`;
        }
      }
    }

    return {
      userPerformanceVsBenchmark: {
        pacePercentile,
        distancePercentile,
        consistencyScore: Math.min(100, stats.totalWorkouts * 5)
      },
      personalizedInsights: insights,
      recommendations,
      motivationalMessage
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Réponse IA avec analyse des benchmarks
    setTimeout(async () => {
      const coachResponse = await generateCoachResponse(inputMessage);
      setMessages(prev => [...prev, coachResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateCoachResponse = async (userInput: string): Promise<ChatMessage> => {
    const { profile, stats, workouts } = userData;
    const input = userInput.toLowerCase();

    let response = '';
    let analysis: CoachAnalysis | undefined;

    // DÉTECTION ET ENREGISTREMENT DES INFORMATIONS UTILISATEUR
    const profileUpdates = extractProfileData(userInput);
    if (profileUpdates && Object.keys(profileUpdates).length > 0) {
      response = await handleProfileUpdate(profileUpdates, userInput);
      analysis = await generateInitialAnalysis();
      return {
        id: 'coach-' + Date.now(),
        type: 'coach',
        content: response,
        timestamp: new Date(),
        analysis
      };
    }

    // NOUVEAU : Mode amélioré avec analyse contextuelle avancée
    if (enhancedMode && chatbotCapabilities) {
      return await generateEnhancedCoachResponse(userInput);
    }

    // Mode classique (fallback)
    if (input.includes('objectif') || input.includes('goal')) {
      response = generateGoalResponse();
      analysis = await generateGoalAnalysisWithBenchmarks();
    } else if (input.includes('pace') || input.includes('vitesse')) {
      response = generatePaceResponse();
      analysis = await generatePaceAnalysisWithBenchmarks();
    } else if (input.includes('motivation') || input.includes('découragé')) {
      response = generateMotivationResponse();
    } else if (input.includes('récupération') || input.includes('fatigue')) {
      response = generateRecoveryResponse();
    } else if (input.includes('nutrition') || input.includes('alimentation')) {
      response = generateNutritionResponse();
    } else {
      response = generateGeneralResponse(userInput);
      analysis = await generateInitialAnalysis();
    }

    return {
      id: 'coach-' + Date.now(),
      type: 'coach',
      content: response,
      timestamp: new Date(),
      analysis
    };
  };

  const generateEnhancedCoachResponse = async (userInput: string): Promise<ChatMessage> => {
    const context = ChatbotEnhancementService.analyzeContext(userInput, userData);
    let response = '';
    let analysis: CoachAnalysis | undefined;

    // Génération de réponse basée sur l'intention détectée et les capacités
    switch (context.intent) {
      case 'performance':
        response = await generatePerformanceResponse(userInput);
        break;

      case 'training':
        response = await generateTrainingProgramResponse(userInput);
        break;

      case 'data':
        response = await generateDataAnalysisResponse(userInput);
        break;

      case 'recovery':
        response = await generateAdvancedRecoveryResponse(userInput);
        break;

      case 'injury':
        response = await generateInjuryAssessmentResponse(userInput);
        break;

      default:
        response = await generateContextualResponse(userInput, context);
    }

    // Génération d'analyse avancée
    analysis = await generateAdvancedAnalysis(context.intent);

    return {
      id: 'coach-' + Date.now(),
      type: 'coach',
      content: response,
      timestamp: new Date(),
      analysis
    };
  };

  const generateGoalResponse = (): string => {
    const personality = userData.profile.preferences.coachPersonality || 'friendly';
    const responses = {
      motivational: "🎯 PARLONS OBJECTIFS ! Quel sommet veux-tu conquérir ? 10K, semi, marathon ? Dis-moi ton rêve et je t'aide à le RÉALISER !",
      analytical: "📈 Définissons un objectif SMART : Spécifique, Mesurable, Atteignable, Réaliste, Temporel. Quelle distance et quel délai visez-vous ?",
      professional: "Fixons ensemble un objectif adapté à votre profil actuel. Quelle échéance et quelle distance souhaitez-vous cibler ?",
      friendly: "😊 Alors, quel est ton prochain défi ? Une première course, améliorer ton temps, ou peut-être découvrir de nouveaux parcours ?"
    };
    return responses[personality];
  };

  const generateGoalAnalysisWithBenchmarks = async (): Promise<CoachAnalysis> => {
    return await generateInitialAnalysis();
  };

  const generatePaceAnalysisWithBenchmarks = async (): Promise<CoachAnalysis> => {
    const analysis = await generateInitialAnalysis();

    // Ajout de recommandations spécifiques pour améliorer la pace
    analysis.recommendations.training = [
      ...analysis.recommendations.training,
      "🏃‍♂️ Intervalles courts : 6x400m avec récupération égale",
      "⚡ Tempo runs : 20-30min à allure semi-marathon",
      "🎯 Fartlek : jeu d'allures sur terrain varié"
    ];

    analysis.personalizedInsights.push(
      "⚡ L'amélioration de la pace passe par 80% endurance + 20% vitesse",
      "📈 Progression typique : 5-10 secondes/km en 6-8 semaines"
    );

    return analysis;
  };

  const generateGoalAnalysis = (): CoachAnalysis => {
    return {
      userPerformanceVsBenchmark: {
        pacePercentile: 65,
        distancePercentile: 55,
        consistencyScore: 75
      },
      personalizedInsights: [
        "🎯 Vos performances actuelles permettent d'envisager plusieurs objectifs",
        "📊 Progression régulière observée sur les dernières semaines"
      ],
      recommendations: {
        training: ["Plan d'entraînement progressif sur 12 semaines", "2-3 sorties par semaine avec 1 sortie longue"],
        recovery: ["1 jour de repos complet par semaine", "Étirements après chaque sortie"],
        nutrition: ["Glucides complexes 2h avant l'effort", "Hydratation régulière"],
        goals: ["Objectif intermédiaire à 6 semaines", "Course test pour valider le niveau"]
      },
      motivationalMessage: "Avec de la constance, tous les objectifs sont atteignables ! 🌟"
    };
  };

  const generatePaceResponse = (): string => {
    const { stats, workouts } = userData;

    if (workouts.length === 0) {
      return `🎯 Pas encore de données de pace ? Pas de souci ! Commencez tranquillement, votre pace naturel se révélera avec les premières sorties. L'important c'est de commencer ! 🏃‍♀️`;
    }

    if (stats.averagePace === "0:00") {
      return `📊 En attente de vos premières données de pace ! Une fois vos sorties enregistrées, je pourrai vous donner des conseils précis et personnalisés. 😊`;
    }

    const paceMinutes = parseInt(stats.averagePace.split(':')[0]);
    const paceSeconds = parseInt(stats.averagePace.split(':')[1]);

    let feedback = '';
    let advice = '';

    if (paceMinutes <= 4) {
      feedback = `🚀 Pace de ${stats.averagePace}/km - vous avez un niveau impressionnant !`;
      advice = "À ce niveau, concentrez-vous sur la variété : tempo, intervalles, et surtout la récupération active.";
    } else if (paceMinutes <= 5) {
      feedback = `💪 Pace de ${stats.averagePace}/km - très bon niveau !`;
      advice = "Pour progresser : 1 séance de fractionné/semaine (6x400m) et maintenez vos sorties longues.";
    } else if (paceMinutes <= 6) {
      feedback = `👍 Pace de ${stats.averagePace}/km - solide base !`;
      advice = "Pour améliorer : alternez sorties lentes et 1 séance un peu plus rapide par semaine.";
    } else {
      feedback = `🌱 Pace de ${stats.averagePace}/km - parfait pour construire votre endurance !`;
      advice = "Privilégiez la régularité avant tout. La vitesse viendra naturellement avec la constance.";
    }

    return `${feedback} ${advice} Basé sur vos ${stats.totalWorkouts} sorties et ${stats.totalDistance}km parcourus ! 📈`;
  };

  const generatePaceAnalysis = (): CoachAnalysis => {
    return {
      userPerformanceVsBenchmark: {
        pacePercentile: 60,
        distancePercentile: 70,
        consistencyScore: 80
      },
      personalizedInsights: [
        "⚡ Potentiel d'amélioration de 10-15% sur votre pace",
        "🎯 Zone d'entraînement optimale identifiée"
      ],
      recommendations: {
        training: ["Fractionné court 2x/semaine", "Sortie tempo 1x/semaine", "Sortie longue allure lente"],
        recovery: ["Récupération active entre les fractionnés", "Massage ou auto-massage"],
        nutrition: ["Hydratation optimisée pendant l'effort", "Récupération glucidique post-effort"],
        goals: ["Test 5K dans 4 semaines", "Amélioration pace de 10s/km en 8 semaines"]
      },
      motivationalMessage: "La vitesse se travaille progressivement. Patience et régularité ! ⚡"
    };
  };

  const generateMotivationResponse = (): string => {
    const personality = userData.profile.preferences.coachPersonality || 'friendly';
    const motivationalResponses = {
      motivational: "🔥 STOP ! Tu sais quoi ? CHAQUE COUREUR DE LÉGENDE a eu ses moments de doute ! C'est exactement ÇA qui fait la différence ! Tu es plus fort(e) que tu le penses ! Chaque foulée compte, chaque effort paie ! ALLEZ, ON Y RETOURNE ! 💪⚡",
      friendly: "😊 Hé, on passe tous par là ! Tu sais ce que je fais quand je doute ? Je repense au premier jour où tu as chaussé tes baskets. Tu as déjà parcouru un chemin incroyable ! Et ce n'est que le début ! 🌟",
      analytical: "📊 Les données montrent que 89% des coureurs vivent des baisses de motivation. C'est statistiquement normal. Votre progression prouve votre capacité. Objectif : une sortie courte et agréable cette semaine.",
      professional: "C'est une phase naturelle dans tout processus d'entraînement. Concentrons-nous sur de petits objectifs atteignables pour retrouver le plaisir et la confiance."
    };
    return motivationalResponses[personality];
  };

  const generateRecoveryResponse = (): string => {
    const { stats, workouts } = userData;

    if (workouts.length === 0) {
      return "😴 Même avant de commencer : le repos de qualité sera votre allié n°1 ! 7-8h de sommeil, c'est la base pour bien récupérer. 💤✨";
    }

    let advice = "😴 Récupération adaptée à votre activité :\n\n";

    // Calcul de l'intensité de la semaine
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const thisWeekWorkouts = workouts.filter(w => new Date(w.date) >= weekStart);
    const thisWeekDistance = thisWeekWorkouts.reduce((sum, w) => sum + w.distance, 0);

    if (thisWeekDistance > 25) {
      advice += "🔥 Grosse semaine ("+thisWeekDistance+"km) ! Récupération ACTIVE nécessaire :\n";
      advice += "• 🛁 Bain chaud ou douche froide\n";
      advice += "• 🧘‍♀️ Étirements longs (15-20min)\n";
      advice += "• 💤 Sommeil extra (8-9h si possible)\n";
    } else if (thisWeekDistance > 10) {
      advice += "💪 Bonne charge cette semaine ("+thisWeekDistance+"km) :\n";
      advice += "• 🛌 7-8h de sommeil minimum\n";
      advice += "• 💧 Hydratation ++\n";
      advice += "• 🦵 Étirements légers après les sorties\n";
    } else {
      advice += "🌱 Charge modérée cette semaine :\n";
      advice += "• 😴 Sommeil réparateur (7-8h)\n";
      advice += "• 🚶‍♀️ Marche active les jours off\n";
      advice += "• 💚 Écoutez votre corps\n";
    }

    // Conseil basé sur la dernière sortie
    if (workouts.length > 0) {
      const lastWorkout = workouts[workouts.length - 1];
      const daysSinceLastWorkout = Math.floor((Date.now() - new Date(lastWorkout.date).getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceLastWorkout <= 1) {
        advice += "\n⚡ Dernière sortie récente : parfait moment pour des étirements !";
      }
    }

    return advice + ` 💪✨`;
  };

  const generateNutritionResponse = (): string => {
    const { stats, workouts } = userData;

    if (workouts.length === 0) {
      return "🍎 Avant de commencer votre parcours running : hydratation ++, alimentation équilibrée, et écoutez votre corps. Simple et efficace ! 🌱";
    }

    const avgDistance = stats.totalDistance / stats.totalWorkouts;
    let advice = "🍎 Votre nutrition adaptée à votre activité :\n\n";

    if (avgDistance > 10) {
      advice += "🍌 Sorties longues : glucides 2h avant, hydratation pendant, récupération protéines+glucides après.\n";
      advice += "💧 Avec vos distances, l'hydratation pendant l'effort devient importante !\n";
    } else if (avgDistance > 5) {
      advice += "🥜 Sorties moyennes : alimentation équilibrée au quotidien suffit. Hydratation avant/après.\n";
      advice += "⚡ Optionnel : une banane 30-60min avant pour l'énergie !\n";
    } else {
      advice += "💚 Sorties courtes : votre alimentation normale convient parfaitement !\n";
      advice += "💧 Focus sur l'hydratation : restez bien hydraté(e) au quotidien.\n";
    }

    // Ajout basé sur la fréquence
    if (stats.totalWorkouts >= 10) {
      advice += "\n🍽️ Avec votre régularité, privilégiez les aliments naturels non transformés pour soutenir vos entraînements !";
    }

    return advice + ` (Basé sur vos ${stats.totalWorkouts} sorties) 📊`;
  };

  const generateGeneralResponse = (input: string): string => {
    const responses = [
      "Excellente question ! Basé sur ton profil et tes performances, voici ce que je pense... 🤔",
      "J'adore ton approche ! Laisse-moi analyser tes données pour te donner le meilleur conseil... 📊",
      "Super ! C'est exactement le genre de questions qu'il faut se poser pour progresser ! 🎯"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // FONCTIONS D'EXTRACTION ET D'ENREGISTREMENT DES DONNÉES UTILISATEUR
  const extractProfileData = (userInput: string): Partial<typeof userData.profile> | null => {
    const input = userInput.toLowerCase();
    const updates: any = {};

    // Extraction de l'âge - patterns améliorés
    const ageMatches = input.match(/(?:j'ai|ai|age|âge|ans?)[\s]*(?:de[\s]*)?(\d+)|(\d+)[\s]*(?:ans?)/i);
    if (ageMatches) {
      const age = parseInt(ageMatches[1] || ageMatches[2]);
      if (age > 10 && age < 100) {
        updates.age = age;
      }
    }

    // Extraction du poids - patterns améliorés
    const weightMatches = input.match(/(?:pese|pèse|poids)[\s]*(?:de[\s]*)?(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)[\s]*kg/i);
    if (weightMatches) {
      const weight = parseFloat(weightMatches[1] || weightMatches[2]);
      if (weight > 30 && weight < 200) {
        updates.weight = weight;
      }
    }

    // Extraction de la taille - patterns améliorés
    const heightCmMatches = input.match(/(?:mesure|taille)[\s]*(?:de[\s]*)?(\d+)[\s]*cm|(\d+)[\s]*cm/i);
    const heightMMatches = input.match(/(?:mesure|taille)[\s]*(?:de[\s]*)?(\d+(?:\.\d+)?)[\s]*m|(\d+(?:\.\d+)?)[\s]*m/i);

    if (heightCmMatches) {
      const height = parseFloat(heightCmMatches[1] || heightCmMatches[2]);
      if (height > 120 && height < 250) {
        updates.height = height;
      }
    } else if (heightMMatches) {
      let height = parseFloat(heightMMatches[1] || heightMMatches[2]) * 100;
      if (height > 120 && height < 250) {
        updates.height = height;
      }
    }

    // Extraction du sexe
    if (input.includes('homme') || input.includes('masculin') || input.includes('male')) {
      updates.sex = 'male';
    } else if (input.includes('femme') || input.includes('féminin') || input.includes('female')) {
      updates.sex = 'female';
    }

    // Extraction de l'expérience en course
    if (input.includes('débutant') || input.includes('commence') || input.includes('jamais couru')) {
      updates.runningExperience = 'beginner';
    } else if (input.includes('intermédiaire') || input.includes('quelques années') || input.includes('2 ans') || input.includes('3 ans')) {
      updates.runningExperience = 'intermediate';
    } else if (input.includes('avancé') || input.includes('expérimenté') || input.includes('4 ans') || input.includes('5 ans')) {
      updates.runningExperience = 'advanced';
    } else if (input.includes('expert') || input.includes('compétition') || input.includes('plus de 5')) {
      updates.runningExperience = 'expert';
    }

    // Calcul automatique du BMI si poids et taille sont disponibles
    if (updates.weight && updates.height) {
      updates.bmi = updates.weight / Math.pow(updates.height / 100, 2);
    } else if (updates.weight && userData.profile.height) {
      updates.bmi = updates.weight / Math.pow(userData.profile.height / 100, 2);
    } else if (updates.height && userData.profile.weight) {
      updates.bmi = userData.profile.weight / Math.pow(updates.height / 100, 2);
    }

    return Object.keys(updates).length > 0 ? updates : null;
  };

  const handleProfileUpdate = async (profileUpdates: any, originalMessage: string): Promise<string> => {
    const personality = userData.profile.preferences.coachPersonality || 'friendly';

    // Mettre à jour le profil utilisateur
    const newProfile = { ...userData.profile, ...profileUpdates };
    updateProfile(newProfile);

    // Générer une réponse personnalisée selon la personnalité
    const updatedFields = Object.keys(profileUpdates);
    let response = '';

    switch (personality) {
      case 'motivational':
        response = `🔥 PARFAIT ! J'ai enregistré vos infos : ${updatedFields.join(', ')} !\n\nMaintenant que je vous connais mieux, on va PERSONNALISER votre entraînement au MAX ! `;
        break;

      case 'analytical':
        response = `📊 Données mises à jour : ${updatedFields.join(', ')}.\n\nRecalcul des métriques en cours... Profil optimisé pour des recommandations plus précises. `;
        break;

      case 'professional':
        response = `✅ Informations enregistrées : ${updatedFields.join(', ')}.\n\nCes données me permettront d'établir un programme d'entraînement adapté à votre profil. `;
        break;

      default: // friendly
        response = `😊 Merci ! J'ai bien noté vos infos : ${updatedFields.join(', ')} !\n\nCela va m'aider à vous donner des conseils encore plus personnalisés ! `;
    }

    // Ajouter des informations calculées si pertinentes
    if (profileUpdates.bmi) {
      response += `\n💡 IMC calculé : ${profileUpdates.bmi.toFixed(1)} - `;
      if (profileUpdates.bmi < 18.5) response += "poids léger, pensez à bien vous alimenter !";
      else if (profileUpdates.bmi > 25) response += "la course va vous aider à optimiser votre forme !";
      else response += "IMC parfait pour la performance !";
    }

    // Poser la prochaine question si des données manquent encore
    const stillMissing = [];
    if (!newProfile.age) stillMissing.push('âge');
    if (!newProfile.weight) stillMissing.push('poids');
    if (!newProfile.height) stillMissing.push('taille');
    if (!newProfile.runningExperience) stillMissing.push('expérience');
    if (!newProfile.sex) stillMissing.push('sexe');

    if (stillMissing.length > 0) {
      response += `\n\n🎯 Une dernière info pour parfaire votre profil : pouvez-vous me parler de votre ${stillMissing[0]} ?`;
    } else {
      // Profil complet, poser des questions sur les objectifs
      response += `\n\n🎉 Profil complet ! Maintenant, parlons de vos OBJECTIFS !\nQuel est votre rêve en course : 5K, 10K, semi-marathon, ou simplement garder la forme ? Et dans combien de temps ?`;
    }

    return response;
  };

  // NOUVELLES FONCTIONS DE GÉNÉRATION DE RÉPONSES AMÉLIORÉES

  const generatePerformanceResponse = async (userInput: string): Promise<string> => {
    const personality = userData.profile.preferences.coachPersonality || 'friendly';

    if (!chatbotCapabilities?.canPredictPerformance) {
      return "📊 J'ai besoin de plus d'historique d'entraînement (au moins 5 sorties) pour prédire vos performances. Continuez à enregistrer vos séances !";
    }

    try {
      // Tentative de prédiction avec l'API ML
      const goal = userData.goals.find(g => g.status === 'active');
      if (goal) {
        const targetDistance = extractTargetDistanceFromGoal(goal.title);
        const prediction = await ChatbotEnhancementService.predictFuturePerformance(
          userData,
          targetDistance,
          goal.targetDate
        );

        let response = `🎯 **Prédiction pour votre objectif "${goal.title}"**\n\n`;
        response += `⏱️ Temps estimé : **${prediction.prediction}**\n`;
        response += `🎯 Confiance : ${prediction.confidence}%\n\n`;
        response += `📋 **Recommandations :**\n`;
        prediction.recommendations.forEach((rec, idx) => {
          response += `${idx + 1}. ${rec}\n`;
        });

        return response;
      } else {
        return generatePerformanceAnalysisWithoutGoal();
      }
    } catch (error) {
      return generatePerformanceAnalysisWithoutGoal();
    }
  };

  const generateTrainingProgramResponse = async (userInput: string): Promise<string> => {
    if (!chatbotCapabilities?.canCreateTrainingPlan) {
      return "🏃‍♂️ Pour créer un programme personnalisé, j'ai besoin de votre profil complet (âge, expérience) et d'au moins 2 sorties d'historique.";
    }

    const goal = userData.goals.find(g => g.status === 'active');
    if (!goal) {
      return `🎯 Créons d'abord un objectif ! Souhaitez-vous préparer un 5K, 10K, semi-marathon ou marathon ? Et dans combien de temps ?`;
    }

    try {
      const trainingPlan = ChatbotEnhancementService.generatePersonalizedTrainingPlan(userData, goal);
      let response = `🏃‍♂️ **Programme personnalisé pour "${goal.title}"**\n\n`;

      response += `📅 **Structure hebdomadaire :**\n`;
      trainingPlan.weeklyStructure.forEach(day => {
        const distanceInfo = day.distance ? ` (${day.distance.toFixed(1)}km)` : '';
        response += `• ${day.day}: ${day.type}${distanceInfo}\n`;
      });

      response += `\n📈 **Progression sur 4 semaines :**\n`;
      trainingPlan.progressionPlan.slice(0, 4).forEach((week, idx) => {
        response += `Semaine ${idx + 1}: ${week.focusArea} - ${week.keySession}\n`;
      });

      response += `\n🎯 **Séances clés :**\n`;
      trainingPlan.keyWorkouts.forEach(workout => {
        response += `• **${workout.name}**: ${workout.description}\n  → ${workout.purpose}\n`;
      });

      return response;
    } catch (error) {
      return "📋 Programme en cours de génération... Revenez dans quelques instants !";
    }
  };

  const generateDataAnalysisResponse = async (userInput: string): Promise<string> => {
    if (userData.workouts.length === 0) {
      return "📊 Aucune donnée d'entraînement disponible pour l'analyse. Importez vos premières séances !";
    }

    try {
      const insights = await ChatbotEnhancementService.generateAdvancedInsights(userData);
      let response = `📊 **Analyse complète de vos données**\n\n`;

      response += `📈 **Statistiques globales :**\n`;
      response += `• ${userData.stats.totalWorkouts} séances au total\n`;
      response += `• ${userData.stats.totalDistance}km parcourus\n`;
      response += `• Pace moyenne : ${userData.stats.averagePace}/km\n`;
      response += `• Cette semaine : ${userData.stats.currentWeekDistance}km\n\n`;

      if (insights.length > 0) {
        response += `🔍 **Insights personnalisés :**\n`;
        insights.forEach(insight => {
          response += `• ${insight}\n`;
        });
        response += '\n';
      }

      // Analyse des données avancées si disponibles
      if (chatbotCapabilities?.hasHeartRateData) {
        response += `💓 **Données cardiaques détectées** - Optimisation possible de vos zones d'entraînement\n`;
      }
      if (chatbotCapabilities?.hasAdvancedMetrics) {
        response += `⚡ **Métriques avancées disponibles** - Cadence, puissance, dénivelé analysés\n`;
      }
      if (chatbotCapabilities?.hasWeatherData) {
        response += `🌤️ **Données météo intégrées** - Impact des conditions analysé\n`;
      }

      return response;
    } catch (error) {
      return generateBasicDataAnalysis();
    }
  };

  const generateAdvancedRecoveryResponse = async (userInput: string): Promise<string> => {
    if (!chatbotCapabilities?.canOptimizeRecovery) {
      return generateRecoveryResponse(); // Fallback vers la version classique
    }

    let response = `🛌 **Analyse de récupération personnalisée**\n\n`;

    // Calcul de la charge d'entraînement récente
    const recentWorkouts = userData.workouts.slice(-7); // 7 derniers jours
    const totalWeeklyLoad = recentWorkouts.reduce((sum, w) => sum + w.distance + (w.duration / 10), 0);

    if (totalWeeklyLoad > 50) {
      response += `⚠️ **Charge élevée cette semaine** (${totalWeeklyLoad.toFixed(1)} points)\n`;
      response += `• 🛁 Récupération active obligatoire\n`;
      response += `• 💤 Sommeil 8-9h minimum\n`;
      response += `• 🧘‍♀️ Étirements prolongés (20min)\n\n`;
    } else if (totalWeeklyLoad > 25) {
      response += `✅ **Charge modérée** (${totalWeeklyLoad.toFixed(1)} points)\n`;
      response += `• 🛌 7-8h de sommeil\n`;
      response += `• 🚶‍♀️ Marche active les jours off\n`;
      response += `• 💧 Hydratation ++\n\n`;
    } else {
      response += `🟢 **Charge faible** - Récupération normale suffisante\n\n`;
    }

    // Analyse FC si disponible
    if (chatbotCapabilities.hasHeartRateData) {
      const lastHRWorkout = userData.workouts.filter(w => w.heartRate).slice(-1)[0];
      if (lastHRWorkout && lastHRWorkout.heartRate) {
        if (lastHRWorkout.heartRate > 170) {
          response += `💓 **FC élevée dernière séance** (${lastHRWorkout.heartRate} bpm)\n`;
          response += `→ Récupération active recommandée 24-48h\n\n`;
        }
      }
    }

    response += `🎯 **Prochaines 24-48h :**\n`;
    response += `• Écoutez vos sensations\n`;
    response += `• Test : fréquence cardiaque au repos\n`;
    response += `• Si fatigue persistante → jour de repos supplémentaire\n`;

    return response;
  };

  const generateInjuryAssessmentResponse = async (userInput: string): Promise<string> => {
    if (!chatbotCapabilities?.canAssessInjuryRisk) {
      return `🏥 J'ai besoin de plus d'historique (au moins 3 séances) pour évaluer le risque de blessure. En attendant, écoutez votre corps !`;
    }

    try {
      const assessment = await apiService.analyzeInjuryRisk(userData.workouts);

      let response = `🏥 **Évaluation du risque de blessure**\n\n`;

      const riskEmoji = assessment.overall_risk === 'low' ? '🟢' :
                       assessment.overall_risk === 'medium' ? '🟡' : '🔴';

      response += `${riskEmoji} **Risque global : ${assessment.overall_risk.toUpperCase()}**\n`;
      response += `Score : ${assessment.risk_score}/100\n\n`;

      if (assessment.risk_factors.length > 0) {
        response += `⚠️ **Facteurs de risque détectés :**\n`;
        assessment.risk_factors.forEach(factor => {
          response += `• **${factor.factor}** (${factor.severity})\n`;
          response += `  ${factor.description}\n`;
        });
        response += '\n';
      }

      response += `🛡️ **Recommandations préventives :**\n`;
      assessment.prevention_tips.forEach(tip => {
        response += `• ${tip}\n`;
      });

      if (assessment.recommended_actions.length > 0) {
        response += `\n🎯 **Actions recommandées :**\n`;
        assessment.recommended_actions.forEach(action => {
          response += `• ${action}\n`;
        });
      }

      return response;
    } catch (error) {
      return generateBasicInjuryGuidance();
    }
  };

  const generateContextualResponse = async (userInput: string, context: any): Promise<string> => {
    const personality = userData.profile.preferences.coachPersonality || 'friendly';

    // Réponse contextuelle basée sur l'intention et les capacités
    let response = `🤔 Je comprends votre question sur "${userInput}"\n\n`;

    // Suggestions d'actions basées sur les capacités disponibles
    if (context.suggestedActions.length > 0) {
      response += `💡 **Je peux vous aider avec :**\n`;
      context.suggestedActions.forEach(action => {
        response += `• ${action}\n`;
      });
      response += '\n';
    }

    // Recommandations personnalisées selon les données disponibles
    if (chatbotCapabilities?.canPredictPerformance) {
      response += `🎯 Voulez-vous que je prédise vos performances futures ?\n`;
    }
    if (chatbotCapabilities?.canCreateTrainingPlan) {
      response += `📋 Je peux créer un programme d'entraînement personnalisé !\n`;
    }
    if (chatbotCapabilities?.canAssessInjuryRisk) {
      response += `🏥 Souhaitez-vous une évaluation de votre risque de blessure ?\n`;
    }

    return response;
  };

  const generateAdvancedAnalysis = async (intent: string): Promise<CoachAnalysis> => {
    try {
      const insights = await ChatbotEnhancementService.generateAdvancedInsights(userData);
      const baseAnalysis = await generateInitialAnalysis();

      return {
        ...baseAnalysis,
        personalizedInsights: [
          ...baseAnalysis.personalizedInsights,
          ...insights
        ],
        recommendations: {
          ...baseAnalysis.recommendations,
          // Ajouter des recommandations spécifiques selon l'intention
        }
      };
    } catch (error) {
      return generateInitialAnalysis();
    }
  };

  // Fonctions utilitaires pour les nouvelles fonctionnalités
  const extractTargetDistanceFromGoal = (goalTitle: string): number => {
    const title = goalTitle.toLowerCase();
    if (title.includes('5k')) return 5;
    if (title.includes('10k')) return 10;
    if (title.includes('semi')) return 21.1;
    if (title.includes('marathon')) return 42.2;
    return 10; // par défaut
  };

  const generatePerformanceAnalysisWithoutGoal = (): string => {
    const { stats } = userData;
    let response = `📊 **Analyse de vos performances actuelles**\n\n`;
    response += `• Pace moyenne : ${stats.averagePace}/km\n`;
    response += `• Distance totale : ${stats.totalDistance}km\n`;
    response += `• ${stats.totalWorkouts} séances au total\n\n`;
    response += `🎯 **Pour prédire vos performances :**\n`;
    response += `Fixez-vous un objectif (5K, 10K, semi, marathon) et j'analyserai vos chances de réussite !`;
    return response;
  };

  const generateBasicDataAnalysis = (): string => {
    const { stats, workouts } = userData;
    let response = `📊 **Analyse basique de vos données**\n\n`;
    response += `• ${stats.totalWorkouts} séances\n`;
    response += `• ${stats.totalDistance}km au total\n`;
    response += `• Pace moyenne : ${stats.averagePace}\n`;
    if (workouts.length > 0) {
      const lastWorkout = workouts[workouts.length - 1];
      response += `• Dernière sortie : ${lastWorkout.distance}km en ${Math.floor(lastWorkout.duration / 60)}min\n`;
    }
    return response;
  };

  const generateBasicInjuryGuidance = (): string => {
    return `🏥 **Conseils préventifs généraux :**\n\n• Écoutez votre corps\n• Respectez la règle des 10% (augmentation du volume)\n• Alternez séances difficiles et faciles\n• Étirements réguliers\n• Sommeil de qualité\n\n⚠️ En cas de douleur persistante, consultez un professionnel.`;
  };

  const CoachIcon = () => (
    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
      <Bot className="w-4 h-4 text-white" />
    </div>
  );

  const UserIcon = () => (
    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
      <User className="w-4 h-4 text-white" />
    </div>
  );

  if (!isExpanded) {
    return (
      <motion.div
        className={`fixed bottom-4 right-4 ${className}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.button
          onClick={() => setIsExpanded(true)}
          className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Notification badge */}
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Sparkles className="w-3 h-3" />
          </motion.div>

          <MessageCircle className="w-6 h-6" />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`fixed bottom-4 right-4 w-96 h-[600px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CoachIcon />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold">Coach IA</h3>
                {enhancedMode && (
                  <motion.div
                    className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    ⚡ Mode Avancé
                  </motion.div>
                )}
              </div>
              <div className="flex items-center space-x-1 text-xs opacity-90">
                <span>Coach personnel</span>
                {chatbotCapabilities && (
                  <>
                    <span>•</span>
                    <div className="flex space-x-1">
                      {chatbotCapabilities.canPredictPerformance && <span title="Prédictions">🎯</span>}
                      {chatbotCapabilities.canCreateTrainingPlan && <span title="Programmes">📋</span>}
                      {chatbotCapabilities.canAssessInjuryRisk && <span title="Analyse risque">🏥</span>}
                      {chatbotCapabilities.hasAdvancedMetrics && <span title="Métriques avancées">⚡</span>}
                      {chatbotCapabilities.hasHeartRateData && <span title="Données cardiaques">💓</span>}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => setEnhancedMode(!enhancedMode)}
              className={`p-1 rounded-lg transition-colors ${enhancedMode ? 'bg-white/20' : 'hover:bg-white/10'}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={enhancedMode ? 'Désactiver mode avancé' : 'Activer mode avancé'}
            >
              <Brain className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronDown className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[400px]">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-end space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {message.type === 'coach' ? <CoachIcon /> : <UserIcon />}
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                        : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>

                    {/* Analysis Cards */}
                    {message.analysis && (
                      <div className="mt-3 space-y-2">
                        {/* Performance vs Benchmark */}
                        <div className="bg-white/90 rounded-xl p-3 border border-gray-100">
                          <div className="flex items-center space-x-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-purple-600" />
                            <span className="text-xs font-semibold text-gray-700">Performance vs Moyennes</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-600">{Math.round(message.analysis.userPerformanceVsBenchmark.pacePercentile)}%</div>
                              <div className="text-gray-600">Pace</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">{Math.round(message.analysis.userPerformanceVsBenchmark.distancePercentile)}%</div>
                              <div className="text-gray-600">Volume</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-teal-600">{Math.round(message.analysis.userPerformanceVsBenchmark.consistencyScore)}%</div>
                              <div className="text-gray-600">Régularité</div>
                            </div>
                          </div>
                        </div>

                        {/* Quick Recommendations */}
                        {message.analysis.recommendations.training.length > 0 && (
                          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 border border-orange-100">
                            <div className="flex items-center space-x-2 mb-1">
                              <Flame className="w-4 h-4 text-orange-600" />
                              <span className="text-xs font-semibold text-orange-700">Recommandations</span>
                            </div>
                            <ul className="text-xs text-orange-800 space-y-1">
                              {message.analysis.recommendations.training.slice(0, 2).map((rec, idx) => (
                                <li key={idx}>• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 px-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-end space-x-2">
              <CoachIcon />
              <div className="bg-gray-100 rounded-2xl px-4 py-2">
                <div className="flex space-x-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white/90">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Posez votre question..."
            className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          />
          <motion.button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={!isLoading ? { scale: 1.05 } : {}}
            whileTap={!isLoading ? { scale: 0.95 } : {}}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default AICoachChatbot;