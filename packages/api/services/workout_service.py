from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
import asyncio

from models.workout import WorkoutData, WorkoutCreate

logger = logging.getLogger(__name__)

class WorkoutService:
    """
    Service pour la gestion et l'analyse des entraînements
    """

    def __init__(self):
        pass

    async def validate_workout_data(self, workout: WorkoutCreate) -> Dict[str, Any]:
        """
        Validation et nettoyage des données d'entraînement
        """
        validation_result = {
            "is_valid": True,
            "errors": [],
            "warnings": [],
            "cleaned_data": workout.dict()
        }

        # Validation de la distance
        if workout.distance <= 0:
            validation_result["is_valid"] = False
            validation_result["errors"].append("La distance doit être positive")

        if workout.distance > 200:  # Ultra long
            validation_result["warnings"].append("Distance très élevée - vérifiez la saisie")

        # Validation de la durée
        if workout.duration <= 0:
            validation_result["is_valid"] = False
            validation_result["errors"].append("La durée doit être positive")

        # Validation de l'allure
        try:
            pace_parts = workout.pace.split(":")
            minutes = int(pace_parts[0])
            seconds = int(pace_parts[1])

            if minutes < 0 or seconds < 0 or seconds >= 60:
                validation_result["is_valid"] = False
                validation_result["errors"].append("Format d'allure invalide")

            # Vérification de cohérence allure/distance/durée
            expected_duration = (minutes * 60 + seconds) * workout.distance / 60
            duration_diff = abs(expected_duration - workout.duration) / workout.duration

            if duration_diff > 0.15:  # Plus de 15% de différence
                validation_result["warnings"].append("Incohérence entre allure, distance et durée")

        except:
            validation_result["is_valid"] = False
            validation_result["errors"].append("Format d'allure invalide (attendu MM:SS)")

        # Validation de la fréquence cardiaque
        if workout.heart_rate:
            if workout.heart_rate < 60 or workout.heart_rate > 220:
                validation_result["warnings"].append("Fréquence cardiaque inhabituelle")

        # Validation de la date
        try:
            workout_date = datetime.fromisoformat(workout.date.replace('Z', '+00:00'))
            if workout_date > datetime.now():
                validation_result["warnings"].append("Date d'entraînement dans le futur")
        except:
            validation_result["is_valid"] = False
            validation_result["errors"].append("Format de date invalide")

        return validation_result

    async def analyze_workout_quality(self, workout: WorkoutData, history: List[WorkoutData]) -> Dict[str, Any]:
        """
        Analyse de la qualité d'un entraînement
        """
        analysis = {
            "overall_rating": "moyen",
            "technical_score": 0,
            "effort_assessment": "normal",
            "recommendations": [],
            "comparisons": {}
        }

        # Score technique basé sur les métriques
        technical_score = 50

        # Évaluation de la distance
        if workout.distance >= 10:
            technical_score += 15
        elif workout.distance >= 5:
            technical_score += 10

        # Évaluation de l'allure
        pace_seconds = self._pace_to_seconds(workout.pace)
        if pace_seconds < 300:  # Moins de 5min/km
            technical_score += 15
        elif pace_seconds < 360:  # Moins de 6min/km
            technical_score += 10

        # Évaluation de la cohérence
        if workout.heart_rate:
            expected_hr = self._estimate_heart_rate_for_pace(pace_seconds)
            hr_diff = abs(workout.heart_rate - expected_hr) / expected_hr
            if hr_diff < 0.1:  # Très cohérent
                technical_score += 10
            elif hr_diff < 0.2:  # Cohérent
                technical_score += 5

        # Comparaison avec l'historique
        if history:
            comparisons = self._compare_with_history(workout, history)
            analysis["comparisons"] = comparisons

            # Ajustement score selon progression
            if comparisons.get("pace_improvement", 0) > 0.05:
                technical_score += 10

        analysis["technical_score"] = min(100, technical_score)

        # Rating global
        if technical_score >= 80:
            analysis["overall_rating"] = "excellent"
        elif technical_score >= 65:
            analysis["overall_rating"] = "bon"
        elif technical_score >= 50:
            analysis["overall_rating"] = "moyen"
        else:
            analysis["overall_rating"] = "faible"

        # Évaluation de l'effort
        analysis["effort_assessment"] = self._assess_effort_level(workout)

        # Recommandations
        analysis["recommendations"] = self._generate_workout_recommendations(workout, history)

        return analysis

    async def detect_training_patterns(self, workouts: List[WorkoutData]) -> Dict[str, Any]:
        """
        Détection de patterns dans l'entraînement
        """
        if len(workouts) < 5:
            return {"message": "Historique insuffisant pour détecter des patterns"}

        patterns = {
            "weekly_patterns": {},
            "monthly_trends": {},
            "type_preferences": {},
            "performance_cycles": {},
            "risk_patterns": []
        }

        # Analyse des patterns hebdomadaires
        patterns["weekly_patterns"] = self._analyze_weekly_patterns(workouts)

        # Tendances mensuelles
        patterns["monthly_trends"] = self._analyze_monthly_trends(workouts)

        # Préférences par type d'entraînement
        patterns["type_preferences"] = self._analyze_type_preferences(workouts)

        # Cycles de performance
        patterns["performance_cycles"] = self._analyze_performance_cycles(workouts)

        # Détection de patterns à risque
        patterns["risk_patterns"] = self._detect_risk_patterns(workouts)

        return patterns

    async def suggest_next_workout(self, workout_history: List[WorkoutData]) -> Dict[str, Any]:
        """
        Suggestion du prochain entraînement basée sur l'historique
        """
        if not workout_history:
            return self._get_beginner_workout_suggestion()

        recent_workouts = workout_history[-7:]  # 7 derniers

        suggestion = {
            "recommended_type": "endurance",
            "suggested_distance": 5.0,
            "target_pace": "5:30",
            "estimated_duration": 30,
            "reasoning": [],
            "alternatives": [],
            "precautions": []
        }

        # Analyse de la charge récente
        recent_load = sum([w.distance for w in recent_workouts])
        recent_intensity = len([w for w in recent_workouts if w.type == "fractionné"])

        # Logique de suggestion basée sur les patterns
        if recent_intensity >= 2:
            suggestion["recommended_type"] = "récupération"
            suggestion["reasoning"].append("2+ séances intenses récentes - récupération nécessaire")
        elif recent_load > 50:
            suggestion["recommended_type"] = "endurance"
            suggestion["suggested_distance"] = max(3, min(8, recent_load / 10))
            suggestion["reasoning"].append("Volume élevé récent - maintien en endurance")
        else:
            last_workout = recent_workouts[-1]
            if last_workout.type == "endurance":
                suggestion["recommended_type"] = "fractionné"
                suggestion["reasoning"].append("Dernière séance en endurance - temps pour du fractionné")

        # Calcul des paramètres suggérés
        suggestion = self._calculate_suggested_parameters(suggestion, workout_history)

        # Alternatives
        suggestion["alternatives"] = self._generate_workout_alternatives(suggestion)

        # Précautions
        suggestion["precautions"] = self._generate_workout_precautions(recent_workouts)

        return suggestion

    # Méthodes utilitaires privées

    def _pace_to_seconds(self, pace_str: str) -> int:
        """Conversion pace vers secondes par km"""
        try:
            parts = pace_str.split(":")
            return int(parts[0]) * 60 + int(parts[1])
        except:
            return 300  # 5:00/km par défaut

    def _seconds_to_pace(self, seconds: int) -> str:
        """Conversion secondes vers format pace"""
        minutes = seconds // 60
        secs = seconds % 60
        return f"{minutes}:{secs:02d}"

    def _estimate_heart_rate_for_pace(self, pace_seconds: int) -> int:
        """Estimation FC pour une allure donnée"""
        # Formule simplifiée basée sur des moyennes
        max_hr = 185  # Estimation pour 35 ans

        if pace_seconds < 240:  # Très rapide
            return int(max_hr * 0.90)
        elif pace_seconds < 300:  # Rapide
            return int(max_hr * 0.85)
        elif pace_seconds < 360:  # Modéré
            return int(max_hr * 0.75)
        else:  # Facile
            return int(max_hr * 0.65)

    def _compare_with_history(self, workout: WorkoutData, history: List[WorkoutData]) -> Dict[str, Any]:
        """Comparaison avec l'historique"""
        comparisons = {}

        # Comparaison de distance
        avg_distance = sum([w.distance for w in history[-10:]]) / min(len(history), 10)
        comparisons["distance_vs_average"] = (workout.distance - avg_distance) / avg_distance

        # Comparaison d'allure
        recent_paces = [self._pace_to_seconds(w.pace) for w in history[-5:]]
        if recent_paces:
            avg_pace = sum(recent_paces) / len(recent_paces)
            current_pace = self._pace_to_seconds(workout.pace)
            comparisons["pace_improvement"] = (avg_pace - current_pace) / avg_pace

        # Comparaison par type
        same_type = [w for w in history if w.type == workout.type]
        if same_type:
            type_avg_distance = sum([w.distance for w in same_type]) / len(same_type)
            comparisons[f"distance_vs_{workout.type}_average"] = (workout.distance - type_avg_distance) / type_avg_distance

        return comparisons

    def _assess_effort_level(self, workout: WorkoutData) -> str:
        """Évaluation du niveau d'effort"""
        if workout.type == "récupération":
            return "très facile"
        elif workout.type == "endurance":
            if workout.distance > 15:
                return "modéré à soutenu"
            else:
                return "modéré"
        elif workout.type == "fractionné":
            return "intense"
        else:
            return "normal"

    def _generate_workout_recommendations(self, workout: WorkoutData, history: List[WorkoutData]) -> List[str]:
        """Génération de recommandations post-entraînement"""
        recommendations = []

        # Recommandations basées sur l'allure
        pace = self._pace_to_seconds(workout.pace)
        if pace > 400:  # Plus de 6:40/km
            recommendations.append("Considérez un travail progressif de l'allure")

        # Recommandations basées sur la distance
        if workout.distance < 3:
            recommendations.append("Augmentez progressivement la distance pour développer l'endurance")

        # Recommandations basées sur l'historique
        if history and len(history) >= 3:
            recent_types = [w.type for w in history[-3:]]
            if all(t == workout.type for t in recent_types):
                recommendations.append("Variez les types d'entraînement pour un développement équilibré")

        return recommendations or ["Bon entraînement ! Continuez sur cette voie."]

    def _analyze_weekly_patterns(self, workouts: List[WorkoutData]) -> Dict[str, Any]:
        """Analyse des patterns hebdomadaires"""
        weekly_stats = {
            "average_weekly_distance": 0,
            "most_active_day": "unknown",
            "consistency_score": 0
        }

        # Grouper par semaine
        weekly_data = {}
        for workout in workouts:
            try:
                date = datetime.fromisoformat(workout.date.replace('Z', '+00:00'))
                week_key = date.strftime("%Y-W%U")
                if week_key not in weekly_data:
                    weekly_data[week_key] = []
                weekly_data[week_key].append(workout)
            except:
                continue

        if weekly_data:
            weekly_distances = [sum(w.distance for w in week_workouts) for week_workouts in weekly_data.values()]
            weekly_stats["average_weekly_distance"] = sum(weekly_distances) / len(weekly_distances)

            # Jour le plus actif
            day_counts = {}
            for workout in workouts:
                try:
                    date = datetime.fromisoformat(workout.date.replace('Z', '+00:00'))
                    day = date.strftime("%A")
                    day_counts[day] = day_counts.get(day, 0) + 1
                except:
                    continue

            if day_counts:
                weekly_stats["most_active_day"] = max(day_counts.items(), key=lambda x: x[1])[0]

        return weekly_stats

    def _analyze_monthly_trends(self, workouts: List[WorkoutData]) -> Dict[str, Any]:
        """Analyse des tendances mensuelles"""
        monthly_data = {}

        for workout in workouts:
            try:
                date = datetime.fromisoformat(workout.date.replace('Z', '+00:00'))
                month_key = date.strftime("%Y-%m")
                if month_key not in monthly_data:
                    monthly_data[month_key] = {"distance": 0, "count": 0}
                monthly_data[month_key]["distance"] += workout.distance
                monthly_data[month_key]["count"] += 1
            except:
                continue

        trend = "stable"
        if len(monthly_data) >= 2:
            months = sorted(monthly_data.keys())
            recent_distance = monthly_data[months[-1]]["distance"]
            old_distance = monthly_data[months[-2]]["distance"]

            if recent_distance > old_distance * 1.1:
                trend = "progression"
            elif recent_distance < old_distance * 0.9:
                trend = "régression"

        return {
            "monthly_data": monthly_data,
            "trend": trend,
            "months_tracked": len(monthly_data)
        }

    def _analyze_type_preferences(self, workouts: List[WorkoutData]) -> Dict[str, Any]:
        """Analyse des préférences par type"""
        type_stats = {}

        for workout in workouts:
            if workout.type not in type_stats:
                type_stats[workout.type] = {
                    "count": 0,
                    "total_distance": 0,
                    "avg_distance": 0,
                    "percentage": 0
                }

            type_stats[workout.type]["count"] += 1
            type_stats[workout.type]["total_distance"] += workout.distance

        total_workouts = len(workouts)
        for workout_type in type_stats:
            stats = type_stats[workout_type]
            stats["avg_distance"] = stats["total_distance"] / stats["count"]
            stats["percentage"] = (stats["count"] / total_workouts) * 100

        return type_stats

    def _analyze_performance_cycles(self, workouts: List[WorkoutData]) -> Dict[str, Any]:
        """Analyse des cycles de performance"""
        if len(workouts) < 10:
            return {"message": "Historique insuffisant pour analyser les cycles"}

        # Analyser l'évolution des allures sur des fenêtres glissantes
        window_size = 5
        performance_data = []

        for i in range(window_size, len(workouts)):
            window = workouts[i-window_size:i]
            avg_pace = sum([self._pace_to_seconds(w.pace) for w in window]) / window_size
            performance_data.append(avg_pace)

        # Détecter les tendances
        if len(performance_data) >= 3:
            recent_avg = sum(performance_data[-3:]) / 3
            old_avg = sum(performance_data[:3]) / 3

            cycle_trend = "stable"
            if recent_avg < old_avg * 0.95:
                cycle_trend = "amélioration"
            elif recent_avg > old_avg * 1.05:
                cycle_trend = "dégradation"

            return {
                "cycle_trend": cycle_trend,
                "performance_volatility": max(performance_data) - min(performance_data),
                "periods_analyzed": len(performance_data)
            }

        return {"message": "Données insuffisantes pour l'analyse cyclique"}

    def _detect_risk_patterns(self, workouts: List[WorkoutData]) -> List[str]:
        """Détection de patterns à risque"""
        risk_patterns = []

        # Surcharge récente
        recent = workouts[-7:]
        if len(recent) > 5:
            risk_patterns.append("Fréquence d'entraînement très élevée (>5/semaine)")

        # Manque de variété
        recent_types = [w.type for w in recent]
        if len(set(recent_types)) == 1 and len(recent) > 3:
            risk_patterns.append("Manque de variété dans les types d'entraînement")

        # Progression trop rapide
        if len(workouts) >= 4:
            old_distances = [w.distance for w in workouts[-4:-2]]
            new_distances = [w.distance for w in workouts[-2:]]

            if sum(new_distances) > sum(old_distances) * 1.3:
                risk_patterns.append("Progression du volume trop rapide (>30%)")

        # Intensité excessive
        intense_workouts = len([w for w in recent if w.type == "fractionné"])
        if intense_workouts > len(recent) * 0.4:
            risk_patterns.append("Proportion d'entraînements intenses trop élevée")

        return risk_patterns

    def _get_beginner_workout_suggestion(self) -> Dict[str, Any]:
        """Suggestion pour débutant"""
        return {
            "recommended_type": "endurance",
            "suggested_distance": 3.0,
            "target_pace": "6:30",
            "estimated_duration": 20,
            "reasoning": ["Premier entraînement - commencez doucement"],
            "alternatives": [
                {
                    "type": "course",
                    "distance": 2.0,
                    "pace": "6:00",
                    "duration": 12
                }
            ],
            "precautions": [
                "Échauffez-vous bien",
                "Hydratez-vous suffisamment",
                "Arrêtez en cas de douleur"
            ]
        }

    def _calculate_suggested_parameters(self, suggestion: Dict[str, Any], history: List[WorkoutData]) -> Dict[str, Any]:
        """Calcul des paramètres suggérés basés sur l'historique"""
        if not history:
            return suggestion

        # Calcul de l'allure cible
        recent_paces = [self._pace_to_seconds(w.pace) for w in history[-5:]]
        avg_recent_pace = sum(recent_paces) / len(recent_paces)

        # Ajustement selon le type suggéré
        if suggestion["recommended_type"] == "récupération":
            target_pace = int(avg_recent_pace * 1.15)  # 15% plus lent
            suggestion["suggested_distance"] = min(5, suggestion["suggested_distance"])
        elif suggestion["recommended_type"] == "fractionné":
            target_pace = int(avg_recent_pace * 0.90)  # 10% plus rapide
        else:
            target_pace = int(avg_recent_pace * 1.02)  # Légèrement plus lent

        suggestion["target_pace"] = self._seconds_to_pace(target_pace)

        # Calcul durée estimée
        pace_minutes = target_pace / 60
        suggestion["estimated_duration"] = int(suggestion["suggested_distance"] * pace_minutes)

        return suggestion

    def _generate_workout_alternatives(self, base_suggestion: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Génération d'alternatives d'entraînement"""
        alternatives = []

        base_type = base_suggestion["recommended_type"]
        base_distance = base_suggestion["suggested_distance"]

        # Alternative plus courte
        if base_distance > 3:
            alternatives.append({
                "type": base_type,
                "distance": base_distance * 0.7,
                "reason": "Version plus courte si fatigue"
            })

        # Alternative différent type
        if base_type == "endurance":
            alternatives.append({
                "type": "fractionné",
                "distance": max(3, base_distance * 0.6),
                "reason": "Travail de vitesse si motivation élevée"
            })
        elif base_type == "fractionné":
            alternatives.append({
                "type": "endurance",
                "distance": base_distance * 1.3,
                "reason": "Endurance si préférence volume"
            })

        return alternatives

    def _generate_workout_precautions(self, recent_workouts: List[WorkoutData]) -> List[str]:
        """Génération de précautions basées sur l'activité récente"""
        precautions = []

        if len(recent_workouts) >= 4:
            precautions.append("Surveillez les signaux de fatigue")

        intense_recent = len([w for w in recent_workouts if w.type == "fractionné"])
        if intense_recent >= 2:
            precautions.append("Privilégiez la récupération si fatigue musculaire")

        last_workout = recent_workouts[-1] if recent_workouts else None
        if last_workout and last_workout.distance > 15:
            precautions.append("Récupération importante après la longue sortie récente")

        precautions.append("Échauffement et étirements essentiels")

        return precautions