import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import asyncio
import logging
from statistics import mean, stdev

from models.workout import (
    WorkoutData, WorkoutAnalysis, PerformanceTrend,
    TrainingZoneAnalysis, InjuryRiskAssessment
)
from models.user import AthleteComparison
from .kaggle_service import KaggleDataService

logger = logging.getLogger(__name__)

class AIAnalyticsService:
    def __init__(self):
        self.kaggle_service = KaggleDataService()
        self.benchmark_data = None

    async def analyze_workout(self, workout_data: List[WorkoutData]) -> WorkoutAnalysis:
        """
        Analyse avancée d'un entraînement avec scoring IA
        """
        if not workout_data:
            raise ValueError("Aucune donnée d'entraînement fournie")

        # Prendre le dernier entraînement pour l'analyse
        workout = workout_data[-1]
        workout_history = workout_data[:-1] if len(workout_data) > 1 else []

        # Calculs d'analyse
        overall_score = self._calculate_workout_score(workout, workout_history)
        pace_analysis = self._analyze_pace(workout, workout_history)
        heart_rate_zones = self._analyze_heart_rate_zones(workout)
        effort_consistency = self._calculate_effort_consistency(workout)
        fatigue_level = self._assess_fatigue_level(workout, workout_history)
        recovery_recommendation = self._generate_recovery_recommendation(workout, fatigue_level)
        performance_insights = self._generate_performance_insights(workout, workout_history)
        comparison_to_history = self._compare_to_history(workout, workout_history)

        return WorkoutAnalysis(
            workout_id=workout.id,
            overall_score=overall_score,
            pace_analysis=pace_analysis,
            heart_rate_zones=heart_rate_zones,
            effort_consistency=effort_consistency,
            fatigue_level=fatigue_level,
            recovery_recommendation=recovery_recommendation,
            performance_insights=performance_insights,
            comparison_to_history=comparison_to_history
        )

    async def analyze_performance_trend(self, workouts: List[WorkoutData]) -> PerformanceTrend:
        """
        Analyse des tendances de performance sur plusieurs semaines/mois
        """
        if len(workouts) < 3:
            raise ValueError("Minimum 3 entraînements requis pour l'analyse de tendance")

        # Analyse par période
        period = f"{len(workouts)} derniers entraînements"
        fitness_trend = self._calculate_fitness_trend(workouts)
        endurance_evolution = self._analyze_endurance_evolution(workouts)
        speed_evolution = self._analyze_speed_evolution(workouts)
        volume_analysis = self._analyze_volume_trends(workouts)
        recommendations = self._generate_training_recommendations(workouts)
        risk_factors = self._identify_risk_factors(workouts)

        return PerformanceTrend(
            period=period,
            fitness_trend=fitness_trend,
            endurance_evolution=endurance_evolution,
            speed_evolution=speed_evolution,
            volume_analysis=volume_analysis,
            recommendations=recommendations,
            risk_factors=risk_factors
        )

    async def analyze_training_zones(self, workouts: List[WorkoutData]) -> TrainingZoneAnalysis:
        """
        Analyse des zones d'entraînement et distribution des intensités
        """
        zone_distribution = self._calculate_zone_distribution(workouts)
        recommendations = self._generate_zone_recommendations(zone_distribution)
        polarization_index = self._calculate_polarization_index(workouts)
        intensity_balance = self._assess_intensity_balance(zone_distribution, polarization_index)

        return TrainingZoneAnalysis(
            zone_distribution=zone_distribution,
            recommendations=recommendations,
            polarization_index=polarization_index,
            intensity_balance=intensity_balance
        )

    async def analyze_injury_risk(self, workouts: List[WorkoutData]) -> InjuryRiskAssessment:
        """
        Évaluation du risque de blessure basée sur l'IA et l'analyse des patterns
        """
        risk_score = self._calculate_injury_risk_score(workouts)
        overall_risk = self._categorize_risk_level(risk_score)
        risk_factors = self._identify_injury_risk_factors(workouts)
        prevention_tips = self._generate_prevention_tips(risk_factors)
        recommended_actions = self._generate_recommended_actions(risk_score, risk_factors)

        return InjuryRiskAssessment(
            overall_risk=overall_risk,
            risk_score=risk_score,
            risk_factors=risk_factors,
            prevention_tips=prevention_tips,
            recommended_actions=recommended_actions
        )

    async def get_running_benchmarks(self) -> Dict[str, Any]:
        """
        Récupération des données de référence depuis Kaggle
        """
        if not self.benchmark_data:
            self.benchmark_data = await self.kaggle_service.get_benchmark_data()

        return self.benchmark_data

    async def compare_athlete_profile(
        self,
        user_workouts: List[WorkoutData],
        age: int,
        gender: str,
        experience_level: str
    ) -> AthleteComparison:
        """
        Comparaison du profil athlète avec des données de référence
        """
        benchmarks = await self.get_running_benchmarks()

        user_stats = self._calculate_user_stats(user_workouts)
        percentile = self._calculate_percentile(user_stats, benchmarks, age, gender)
        peer_comparison = self._compare_with_peers(user_stats, benchmarks, age, gender, experience_level)
        strengths = self._identify_strengths(user_stats, peer_comparison)
        areas_for_improvement = self._identify_improvement_areas(user_stats, peer_comparison)
        progression_potential = self._assess_progression_potential(user_stats, age, experience_level)

        return AthleteComparison(
            user_percentile=percentile,
            peer_comparison=peer_comparison,
            strengths=strengths,
            areas_for_improvement=areas_for_improvement,
            benchmark_data=benchmarks,
            progression_potential=progression_potential
        )

    # Méthodes privées d'analyse

    def _calculate_workout_score(self, workout: WorkoutData, history: List[WorkoutData]) -> float:
        """Calcul du score global d'entraînement (0-100)"""
        base_score = 50.0

        # Facteurs positifs
        if workout.distance > 5:  # Distance significative
            base_score += min(15, workout.distance * 2)

        if workout.heart_rate and 120 <= workout.heart_rate <= 180:  # FC dans zone optimale
            base_score += 10

        # Consistance avec l'historique
        if history:
            avg_distance = mean([w.distance for w in history[-5:]])
            if 0.8 <= workout.distance / avg_distance <= 1.3:  # Progression cohérente
                base_score += 10

        # Limitation à 100
        return min(100, max(0, base_score))

    def _analyze_pace(self, workout: WorkoutData, history: List[WorkoutData]) -> Dict[str, Any]:
        """Analyse de l'allure"""
        pace_parts = workout.pace.split(":")
        current_pace_seconds = int(pace_parts[0]) * 60 + int(pace_parts[1])

        analysis = {
            "current_pace": workout.pace,
            "pace_category": self._categorize_pace(current_pace_seconds, workout.type),
            "consistency": "stable"
        }

        if history:
            recent_paces = [self._pace_to_seconds(w.pace) for w in history[-5:]]
            avg_pace = mean(recent_paces)

            if current_pace_seconds < avg_pace * 0.95:
                analysis["trend"] = "amélioration"
            elif current_pace_seconds > avg_pace * 1.05:
                analysis["trend"] = "dégradation"
            else:
                analysis["trend"] = "stable"

        return analysis

    def _pace_to_seconds(self, pace_str: str) -> int:
        """Conversion pace string vers secondes"""
        parts = pace_str.split(":")
        return int(parts[0]) * 60 + int(parts[1])

    def _categorize_pace(self, pace_seconds: int, workout_type: str) -> str:
        """Catégorisation de l'allure selon le type d'entraînement"""
        if workout_type == "fractionné":
            if pace_seconds < 240:  # < 4:00/km
                return "rapide"
            elif pace_seconds < 300:  # < 5:00/km
                return "modérée"
            else:
                return "lente"
        else:  # endurance, récupération
            if pace_seconds < 300:  # < 5:00/km
                return "soutenue"
            elif pace_seconds < 360:  # < 6:00/km
                return "confortable"
            else:
                return "récupération"

    def _analyze_heart_rate_zones(self, workout: WorkoutData) -> Optional[Dict[str, float]]:
        """Analyse des zones de fréquence cardiaque"""
        if not workout.heart_rate:
            return None

        hr = workout.heart_rate

        # Zones basées sur la FC max estimée (220 - âge, ici on estime 35 ans)
        max_hr = 185

        zones = {
            "zone1": max(0, min(100, (max(0, 0.6 * max_hr - hr) / (0.7 * max_hr - 0.6 * max_hr)) * 100)),
            "zone2": max(0, min(100, 100 - abs(hr - 0.75 * max_hr) / (0.1 * max_hr) * 100)),
            "zone3": max(0, min(100, 100 - abs(hr - 0.85 * max_hr) / (0.1 * max_hr) * 100)),
            "zone4": max(0, min(100, 100 - abs(hr - 0.95 * max_hr) / (0.1 * max_hr) * 100))
        }

        return zones

    def _calculate_effort_consistency(self, workout: WorkoutData) -> float:
        """Calcul de la consistance de l'effort"""
        # Simulation basée sur le type d'entraînement
        if workout.type == "endurance":
            return 0.85  # Endurance = effort régulier
        elif workout.type == "fractionné":
            return 0.65  # Fractionné = variations normales
        else:
            return 0.75

    def _assess_fatigue_level(self, workout: WorkoutData, history: List[WorkoutData]) -> str:
        """Évaluation du niveau de fatigue"""
        if not history:
            return "normal"

        # Analyse basée sur la fréquence et intensité récente
        recent_workouts = [w for w in history if
                          datetime.fromisoformat(w.date.replace('Z', '+00:00')) >
                          datetime.now() - timedelta(days=7)]

        if len(recent_workouts) > 5:
            return "élevé"
        elif len(recent_workouts) < 2:
            return "faible"
        else:
            return "normal"

    def _generate_recovery_recommendation(self, workout: WorkoutData, fatigue_level: str) -> str:
        """Génération des recommandations de récupération"""
        if fatigue_level == "élevé":
            return "Repos actif recommandé. Considérez 1-2 jours de récupération complète."
        elif workout.type == "fractionné":
            return "Récupération modérée. Privilégiez l'endurance facile dans les 24h."
        else:
            return "Récupération standard. Hydratation et étirements suffisants."

    def _generate_performance_insights(self, workout: WorkoutData, history: List[WorkoutData]) -> List[str]:
        """Génération d'insights de performance"""
        insights = []

        if workout.distance > 10:
            insights.append("Excellente capacité d'endurance démontrée")

        if workout.heart_rate and workout.heart_rate < 150:
            insights.append("FC basse - bonne efficacité cardiaque")

        if history and len(history) >= 3:
            recent_distances = [w.distance for w in history[-3:]]
            if all(d >= workout.distance * 0.8 for d in recent_distances):
                insights.append("Consistance remarquable dans les distances")

        return insights or ["Entraînement dans les standards normaux"]

    def _compare_to_history(self, workout: WorkoutData, history: List[WorkoutData]) -> Dict[str, Any]:
        """Comparaison à l'historique personnel"""
        if not history:
            return {"status": "premier_entrainement"}

        comparison = {}

        # Comparaison distance
        avg_distance = mean([w.distance for w in history[-10:]])
        comparison["distance_vs_average"] = f"{((workout.distance / avg_distance - 1) * 100):+.1f}%"

        # Comparaison allure si possible
        if len(history) >= 3:
            recent_paces = [self._pace_to_seconds(w.pace) for w in history[-5:]]
            avg_pace = mean(recent_paces)
            current_pace = self._pace_to_seconds(workout.pace)
            pace_diff = ((avg_pace - current_pace) / avg_pace) * 100
            comparison["pace_vs_average"] = f"{pace_diff:+.1f}%"

        return comparison

    def _calculate_fitness_trend(self, workouts: List[WorkoutData]) -> str:
        """Calcul de la tendance de forme physique"""
        if len(workouts) < 5:
            return "insuffisant pour analyse"

        # Analyse des 4 dernières semaines
        recent = workouts[-10:]
        old = workouts[-20:-10] if len(workouts) >= 20 else workouts[:-10]

        if not old:
            return "progression stable"

        recent_avg = mean([w.distance for w in recent])
        old_avg = mean([w.distance for w in old])

        improvement = (recent_avg - old_avg) / old_avg

        if improvement > 0.1:
            return "nette progression"
        elif improvement > 0.05:
            return "légère progression"
        elif improvement < -0.1:
            return "régression"
        else:
            return "stable"

    def _analyze_endurance_evolution(self, workouts: List[WorkoutData]) -> Dict[str, float]:
        """Analyse de l'évolution de l'endurance"""
        endurance_workouts = [w for w in workouts if w.type in ["endurance", "course"]]

        if len(endurance_workouts) < 3:
            return {"trend": 0.0, "average_distance": 0.0}

        recent = endurance_workouts[-5:]
        old = endurance_workouts[-10:-5] if len(endurance_workouts) >= 10 else endurance_workouts[:-5]

        recent_avg = mean([w.distance for w in recent])
        old_avg = mean([w.distance for w in old]) if old else recent_avg

        trend = ((recent_avg - old_avg) / old_avg) * 100 if old_avg > 0 else 0

        return {
            "trend": trend,
            "average_distance": recent_avg,
            "consistency": stdev([w.distance for w in recent]) if len(recent) > 1 else 0
        }

    def _analyze_speed_evolution(self, workouts: List[WorkoutData]) -> Dict[str, float]:
        """Analyse de l'évolution de la vitesse"""
        speed_workouts = [w for w in workouts if w.type == "fractionné"]

        if len(speed_workouts) < 3:
            return {"trend": 0.0, "average_pace": 0.0}

        recent = speed_workouts[-3:]
        old = speed_workouts[-6:-3] if len(speed_workouts) >= 6 else speed_workouts[:-3]

        recent_pace = mean([self._pace_to_seconds(w.pace) for w in recent])
        old_pace = mean([self._pace_to_seconds(w.pace) for w in old]) if old else recent_pace

        # Amélioration = pace plus rapide (moins de secondes)
        improvement = ((old_pace - recent_pace) / old_pace) * 100 if old_pace > 0 else 0

        return {
            "trend": improvement,
            "average_pace": recent_pace,
            "best_pace": min([self._pace_to_seconds(w.pace) for w in recent])
        }

    def _analyze_volume_trends(self, workouts: List[WorkoutData]) -> Dict[str, Any]:
        """Analyse des tendances de volume"""
        total_distance = sum([w.distance for w in workouts])
        total_time = sum([w.duration for w in workouts])

        return {
            "total_distance": total_distance,
            "total_time": total_time,
            "average_per_workout": total_distance / len(workouts),
            "weekly_estimate": total_distance * (7 / max(1, len(workouts)))
        }

    def _generate_training_recommendations(self, workouts: List[WorkoutData]) -> List[str]:
        """Génération de recommandations d'entraînement"""
        recommendations = []

        # Analyse des types d'entraînement
        types_count = {}
        for workout in workouts[-10:]:  # 10 derniers
            types_count[workout.type] = types_count.get(workout.type, 0) + 1

        total_recent = len(workouts[-10:])

        if types_count.get("endurance", 0) / total_recent < 0.6:
            recommendations.append("Augmentez la proportion d'entraînements en endurance (60-70%)")

        if types_count.get("fractionné", 0) / total_recent > 0.3:
            recommendations.append("Réduisez la fréquence des séances de fractionné (max 20-30%)")

        if types_count.get("récupération", 0) / total_recent < 0.1:
            recommendations.append("Intégrez des séances de récupération active")

        return recommendations or ["Continuez votre programme actuel, il est bien équilibré"]

    def _identify_risk_factors(self, workouts: List[WorkoutData]) -> List[str]:
        """Identification des facteurs de risque"""
        risk_factors = []

        recent = workouts[-7:]  # 7 derniers

        # Volume trop important
        if len(recent) > 5:
            risk_factors.append("Fréquence d'entraînement élevée - risque de surentraînement")

        # Intensité trop fréquente
        high_intensity = [w for w in recent if w.type == "fractionné"]
        if len(high_intensity) > 2:
            risk_factors.append("Trop de séances haute intensité consécutives")

        return risk_factors

    def _calculate_zone_distribution(self, workouts: List[WorkoutData]) -> Dict[str, float]:
        """Calcul de la distribution par zones d'entraînement"""
        total = len(workouts)

        distribution = {
            "zone1_recuperation": len([w for w in workouts if w.type == "récupération"]) / total * 100,
            "zone2_endurance": len([w for w in workouts if w.type == "endurance"]) / total * 100,
            "zone3_tempo": len([w for w in workouts if w.type == "course"]) / total * 100,
            "zone4_fractionne": len([w for w in workouts if w.type == "fractionné"]) / total * 100
        }

        return distribution

    def _generate_zone_recommendations(self, distribution: Dict[str, float]) -> Dict[str, str]:
        """Génération de recommandations par zone"""
        recommendations = {}

        if distribution["zone2_endurance"] < 60:
            recommendations["endurance"] = "Augmentez le volume en endurance de base"

        if distribution["zone4_fractionne"] > 20:
            recommendations["fractionne"] = "Réduisez la fréquence des séances intenses"

        if distribution["zone1_recuperation"] < 10:
            recommendations["recuperation"] = "Intégrez plus de séances de récupération"

        return recommendations

    def _calculate_polarization_index(self, workouts: List[WorkoutData]) -> float:
        """Calcul de l'index de polarisation (modèle 80/20)"""
        total = len(workouts)
        low_intensity = len([w for w in workouts if w.type in ["endurance", "récupération"]])

        return (low_intensity / total) * 100 if total > 0 else 0

    def _assess_intensity_balance(self, distribution: Dict[str, float], polarization: float) -> str:
        """Évaluation de l'équilibre des intensités"""
        if 75 <= polarization <= 85:
            return "excellent - respecte le principe 80/20"
        elif 70 <= polarization < 75:
            return "bon - légèrement plus d'intensité que recommandé"
        elif polarization < 70:
            return "attention - trop d'entraînements haute intensité"
        else:
            return "très conservateur - pourrait bénéficier de plus d'intensité"

    def _calculate_injury_risk_score(self, workouts: List[WorkoutData]) -> float:
        """Calcul du score de risque de blessure (0-100)"""
        risk_score = 0.0

        recent = workouts[-14:]  # 2 dernières semaines

        # Fréquence excessive
        if len(recent) > 10:
            risk_score += 25

        # Manque de variété
        types = set([w.type for w in recent])
        if len(types) < 2:
            risk_score += 20

        # Progression trop rapide
        if len(workouts) >= 4:
            old_avg = mean([w.distance for w in workouts[-4:-2]])
            new_avg = mean([w.distance for w in workouts[-2:]])
            if new_avg > old_avg * 1.3:  # +30% brutalement
                risk_score += 30

        # Manque de récupération
        recovery_workouts = [w for w in recent if w.type == "récupération"]
        if len(recovery_workouts) == 0:
            risk_score += 15

        return min(100, risk_score)

    def _categorize_risk_level(self, risk_score: float) -> str:
        """Catégorisation du niveau de risque"""
        if risk_score < 30:
            return "low"
        elif risk_score < 60:
            return "medium"
        else:
            return "high"

    def _identify_injury_risk_factors(self, workouts: List[WorkoutData]) -> List[Dict[str, Any]]:
        """Identification détaillée des facteurs de risque"""
        risk_factors = []

        recent = workouts[-10:]

        # Analyse de la charge d'entraînement
        total_distance = sum([w.distance for w in recent])
        if total_distance > 100:  # Plus de 100km en 10 sessions
            risk_factors.append({
                "factor": "volume_élevé",
                "description": "Volume d'entraînement très élevé",
                "severity": "medium",
                "value": f"{total_distance:.1f}km"
            })

        # Manque de diversité
        types_count = len(set([w.type for w in recent]))
        if types_count < 2:
            risk_factors.append({
                "factor": "manque_variété",
                "description": "Peu de variété dans les types d'entraînement",
                "severity": "low",
                "value": f"{types_count} type(s)"
            })

        return risk_factors

    def _generate_prevention_tips(self, risk_factors: List[Dict[str, Any]]) -> List[str]:
        """Génération de conseils de prévention"""
        tips = [
            "Respectez le principe de progression graduelle (+10% par semaine max)",
            "Intégrez des séances de récupération active",
            "Variez les types d'entraînement",
            "Écoutez votre corps et respectez la fatigue"
        ]

        # Tips spécifiques selon les facteurs de risque
        for factor in risk_factors:
            if factor["factor"] == "volume_élevé":
                tips.append("Réduisez temporairement le volume hebdomadaire")
            elif factor["factor"] == "manque_variété":
                tips.append("Diversifiez vos entraînements (endurance, vitesse, récupération)")

        return tips

    def _generate_recommended_actions(self, risk_score: float, risk_factors: List[Dict[str, Any]]) -> List[str]:
        """Génération d'actions recommandées"""
        actions = []

        if risk_score > 60:
            actions.append("Prenez 2-3 jours de repos complet")
            actions.append("Consultez un professionnel de santé si douleurs persistantes")
        elif risk_score > 30:
            actions.append("Réduisez l'intensité des prochains entraînements")
            actions.append("Privilégiez la récupération active")

        actions.append("Surveillez les signes de fatigue excessive")

        return actions

    def _calculate_user_stats(self, workouts: List[WorkoutData]) -> Dict[str, Any]:
        """Calcul des statistiques utilisateur pour comparaison"""
        if not workouts:
            return {}

        distances = [w.distance for w in workouts]
        paces = [self._pace_to_seconds(w.pace) for w in workouts]

        return {
            "average_distance": mean(distances),
            "max_distance": max(distances),
            "average_pace": mean(paces),
            "best_pace": min(paces),
            "total_workouts": len(workouts),
            "weekly_volume": mean(distances) * 7 / 7  # Estimation
        }

    def _calculate_percentile(self, user_stats: Dict[str, Any], benchmarks: Dict[str, Any], age: int, gender: str) -> float:
        """Calcul du percentile par rapport à la population"""
        # Simulation de calcul de percentile
        # Dans une vraie implémentation, on comparerait aux données Kaggle
        base_percentile = 50.0

        if user_stats.get("average_distance", 0) > 8:
            base_percentile += 20
        if user_stats.get("best_pace", 400) < 300:  # Moins de 5min/km
            base_percentile += 15

        return min(95, max(5, base_percentile))

    def _compare_with_peers(self, user_stats: Dict[str, Any], benchmarks: Dict[str, Any], age: int, gender: str, experience: str) -> Dict[str, Any]:
        """Comparaison avec les pairs"""
        return {
            "distance_vs_peers": "supérieure à la moyenne",
            "pace_vs_peers": "dans la moyenne",
            "consistency_vs_peers": "excellente",
            "peer_group": f"{gender}, {age-5}-{age+5} ans, {experience}"
        }

    def _identify_strengths(self, user_stats: Dict[str, Any], peer_comparison: Dict[str, Any]) -> List[str]:
        """Identification des points forts"""
        strengths = []

        if user_stats.get("max_distance", 0) > 15:
            strengths.append("Excellente capacité d'endurance longue distance")

        if user_stats.get("total_workouts", 0) > 20:
            strengths.append("Très bonne régularité d'entraînement")

        return strengths or ["Profil d'athlète équilibré"]

    def _identify_improvement_areas(self, user_stats: Dict[str, Any], peer_comparison: Dict[str, Any]) -> List[str]:
        """Identification des axes d'amélioration"""
        improvements = []

        if user_stats.get("best_pace", 0) > 350:  # Plus de 5:50/km
            improvements.append("Travail de la vitesse et du fractionné")

        improvements.append("Diversification des types d'entraînement")

        return improvements

    def _assess_progression_potential(self, user_stats: Dict[str, Any], age: int, experience: str) -> str:
        """Évaluation du potentiel de progression"""
        if experience == "débutant":
            return "très élevé - marge de progression importante"
        elif age < 40:
            return "élevé - capacité d'amélioration significative"
        else:
            return "modéré - progression par optimisation technique"