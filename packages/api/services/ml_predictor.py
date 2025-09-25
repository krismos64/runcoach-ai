import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
import logging
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

from models.workout import WorkoutData, PerformancePrediction

logger = logging.getLogger(__name__)

class MLPredictorService:
    """
    Service de prédiction ML pour les performances de course à pied
    """

    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.model_path = "models/"
        self.is_trained = False

        # Créer le dossier models s'il n'existe pas
        os.makedirs(self.model_path, exist_ok=True)

    async def predict_race_time(
        self,
        workout_history: List[WorkoutData],
        target_distance: float,
        target_date: str
    ) -> PerformancePrediction:
        """
        Prédiction du temps de course basée sur l'historique d'entraînement
        """
        try:
            # Préparer les données d'entrée
            features = self._extract_features_from_history(workout_history)

            # Calculer les jours jusqu'à la compétition
            days_to_race = self._calculate_days_to_race(target_date)
            features['days_to_race'] = days_to_race
            features['target_distance'] = target_distance

            # Prédiction selon la distance
            predicted_time_seconds = await self._predict_for_distance(features, target_distance)
            predicted_time = self._seconds_to_time_string(predicted_time_seconds)

            # Évaluer la confiance de la prédiction
            confidence_level = self._calculate_confidence(workout_history, target_distance)

            # Évaluer le niveau de forme actuel
            current_fitness_level = self._assess_current_fitness(workout_history)

            # Calculer le potentiel d'amélioration
            improvement_potential = self._calculate_improvement_potential(
                workout_history, days_to_race, current_fitness_level
            )

            # Générer des recommandations d'entraînement
            training_recommendations = self._generate_training_recommendations(
                workout_history, target_distance, days_to_race
            )

            # Prédictions de jalons intermédiaires
            milestone_predictions = self._generate_milestone_predictions(
                target_distance, predicted_time_seconds, days_to_race
            )

            return PerformancePrediction(
                target_distance=target_distance,
                target_date=target_date,
                predicted_time=predicted_time,
                confidence_level=confidence_level,
                current_fitness_level=current_fitness_level,
                improvement_potential=improvement_potential,
                training_recommendations=training_recommendations,
                milestone_predictions=milestone_predictions
            )

        except Exception as e:
            logger.error(f"Erreur prédiction performance: {e}")
            raise

    async def _predict_for_distance(self, features: Dict[str, float], distance: float) -> float:
        """
        Prédiction pour une distance spécifique
        """
        # Si pas de modèle entraîné, utiliser des formules empiriques
        if not self.is_trained:
            return self._predict_using_empirical_formulas(features, distance)

        # Sinon utiliser le modèle ML entraîné
        model_key = self._get_model_key_for_distance(distance)
        if model_key in self.models:
            feature_vector = self._features_to_vector(features)
            return self.models[model_key].predict([feature_vector])[0]

        # Fallback sur formules empiriques
        return self._predict_using_empirical_formulas(features, distance)

    def _predict_using_empirical_formulas(self, features: Dict[str, float], distance: float) -> float:
        """
        Prédictions basées sur des formules empiriques bien établies
        """
        # Utiliser la meilleure allure récente comme base
        best_pace = features.get('best_recent_pace', 300)  # 5:00/km par défaut

        # Facteurs d'ajustement selon la distance
        if distance <= 5:
            # 5K - pace plus rapide que l'entraînement
            adjusted_pace = best_pace * 0.95
        elif distance <= 10:
            # 10K - légèrement plus rapide
            adjusted_pace = best_pace * 0.98
        elif distance <= 21.1:
            # Semi-marathon - pace d'endurance
            adjusted_pace = best_pace * 1.05
        elif distance <= 42.2:
            # Marathon - pace plus conservateur
            adjusted_pace = best_pace * 1.15
        else:
            # Ultra - très conservateur
            adjusted_pace = best_pace * 1.25

        # Ajustements selon la forme et l'expérience
        fitness_multiplier = self._get_fitness_multiplier(features)
        adjusted_pace *= fitness_multiplier

        # Temps total en secondes
        total_seconds = adjusted_pace * distance

        return total_seconds

    def _get_fitness_multiplier(self, features: Dict[str, float]) -> float:
        """
        Multiplicateur basé sur le niveau de forme
        """
        multiplier = 1.0

        # Volume d'entraînement
        weekly_volume = features.get('avg_weekly_distance', 20)
        if weekly_volume > 50:
            multiplier *= 0.95  # Meilleure forme
        elif weekly_volume < 20:
            multiplier *= 1.05  # Forme moins optimale

        # Consistance
        consistency = features.get('consistency_score', 0.5)
        if consistency > 0.8:
            multiplier *= 0.97
        elif consistency < 0.3:
            multiplier *= 1.03

        # Récence de l'entraînement
        days_since_last = features.get('days_since_last_workout', 7)
        if days_since_last > 14:
            multiplier *= 1.08  # Déconditionnement

        return multiplier

    def _extract_features_from_history(self, workouts: List[WorkoutData]) -> Dict[str, float]:
        """
        Extraction des caractéristiques d'entraînement pour la prédiction
        """
        if not workouts:
            return self._get_default_features()

        # Conversion des allures en secondes
        paces = []
        distances = []
        durations = []
        dates = []

        for workout in workouts:
            try:
                pace_parts = workout.pace.split(":")
                pace_seconds = int(pace_parts[0]) * 60 + int(pace_parts[1])
                paces.append(pace_seconds)
                distances.append(workout.distance)
                durations.append(workout.duration)
                dates.append(datetime.fromisoformat(workout.date.replace('Z', '+00:00')))
            except:
                continue

        if not paces:
            return self._get_default_features()

        # Calculs statistiques
        features = {
            'avg_pace': np.mean(paces),
            'best_pace': np.min(paces),
            'pace_std': np.std(paces),
            'avg_distance': np.mean(distances),
            'max_distance': np.max(distances),
            'total_distance': np.sum(distances),
            'avg_duration': np.mean(durations),
            'workout_count': len(workouts),
            'consistency_score': self._calculate_consistency_score(workouts),
            'training_load': self._calculate_training_load(workouts),
            'recent_form': self._calculate_recent_form(workouts[-5:] if len(workouts) >= 5 else workouts)
        }

        # Analyse temporelle
        if len(dates) >= 2:
            date_range = (max(dates) - min(dates)).days
            features['training_period_days'] = date_range
            features['training_frequency'] = len(workouts) / max(1, date_range / 7)  # workouts per week

            # Dernière activité
            last_workout = max(dates)
            features['days_since_last_workout'] = (datetime.now() - last_workout).days

        # Analyse par type d'entraînement
        type_counts = {}
        for workout in workouts:
            type_counts[workout.type] = type_counts.get(workout.type, 0) + 1

        total_workouts = len(workouts)
        features['endurance_ratio'] = type_counts.get('endurance', 0) / total_workouts
        features['speed_ratio'] = type_counts.get('fractionné', 0) / total_workouts
        features['recovery_ratio'] = type_counts.get('récupération', 0) / total_workouts

        # Tendances récentes
        if len(workouts) >= 4:
            recent = workouts[-4:]
            old = workouts[-8:-4] if len(workouts) >= 8 else workouts[:-4]

            if old:
                recent_avg_pace = np.mean([self._pace_to_seconds(w.pace) for w in recent])
                old_avg_pace = np.mean([self._pace_to_seconds(w.pace) for w in old])
                features['pace_improvement'] = (old_avg_pace - recent_avg_pace) / old_avg_pace

                recent_avg_distance = np.mean([w.distance for w in recent])
                old_avg_distance = np.mean([w.distance for w in old])
                features['distance_trend'] = (recent_avg_distance - old_avg_distance) / old_avg_distance

        # Features spécialisées
        features['best_recent_pace'] = np.min(paces[-10:]) if len(paces) >= 10 else np.min(paces)
        features['avg_weekly_distance'] = features['total_distance'] / max(1, features.get('training_period_days', 30) / 7)

        return features

    def _get_default_features(self) -> Dict[str, float]:
        """
        Valeurs par défaut pour un débutant
        """
        return {
            'avg_pace': 360,  # 6:00/km
            'best_pace': 330,  # 5:30/km
            'pace_std': 30,
            'avg_distance': 5,
            'max_distance': 8,
            'total_distance': 50,
            'avg_duration': 30,
            'workout_count': 10,
            'consistency_score': 0.3,
            'training_load': 50,
            'recent_form': 0.5,
            'training_period_days': 30,
            'training_frequency': 2.5,
            'days_since_last_workout': 3,
            'endurance_ratio': 0.7,
            'speed_ratio': 0.2,
            'recovery_ratio': 0.1,
            'best_recent_pace': 330,
            'avg_weekly_distance': 15
        }

    def _pace_to_seconds(self, pace_str: str) -> int:
        """Conversion pace vers secondes"""
        try:
            parts = pace_str.split(":")
            return int(parts[0]) * 60 + int(parts[1])
        except:
            return 300  # 5:00/km par défaut

    def _calculate_consistency_score(self, workouts: List[WorkoutData]) -> float:
        """
        Calcul d'un score de consistance (0-1)
        """
        if len(workouts) < 3:
            return 0.3

        # Variance des allures
        paces = [self._pace_to_seconds(w.pace) for w in workouts]
        pace_cv = np.std(paces) / np.mean(paces)  # Coefficient de variation

        # Variance des distances
        distances = [w.distance for w in workouts]
        distance_cv = np.std(distances) / np.mean(distances)

        # Score basé sur la faible variance (plus consistant = meilleur score)
        consistency = 1 - min(1, (pace_cv + distance_cv) / 2)

        return max(0, consistency)

    def _calculate_training_load(self, workouts: List[WorkoutData]) -> float:
        """
        Calcul de la charge d'entraînement
        """
        total_load = 0

        for workout in workouts:
            # Facteur d'intensité basé sur le type
            intensity_factor = {
                'récupération': 0.5,
                'endurance': 1.0,
                'course': 1.2,
                'fractionné': 1.5
            }.get(workout.type, 1.0)

            # Load = distance * intensité * durée relative
            load = workout.distance * intensity_factor * (workout.duration / 60)
            total_load += load

        return total_load

    def _calculate_recent_form(self, recent_workouts: List[WorkoutData]) -> float:
        """
        Évaluation de la forme récente (0-1)
        """
        if not recent_workouts:
            return 0.5

        # Moyenne des allures récentes vs historique personnel
        recent_paces = [self._pace_to_seconds(w.pace) for w in recent_workouts]
        avg_recent_pace = np.mean(recent_paces)

        # Comparaison à une base théorique (5:30/km = forme correcte)
        baseline_pace = 330
        form_ratio = baseline_pace / avg_recent_pace

        # Normaliser entre 0 et 1
        return min(1, max(0, form_ratio))

    def _calculate_days_to_race(self, target_date: str) -> int:
        """
        Calcul du nombre de jours jusqu'à la compétition
        """
        try:
            race_date = datetime.fromisoformat(target_date.replace('Z', '+00:00'))
            return (race_date - datetime.now()).days
        except:
            return 60  # 60 jours par défaut

    def _seconds_to_time_string(self, total_seconds: float) -> str:
        """
        Conversion secondes vers format temps (HH:MM:SS)
        """
        hours = int(total_seconds // 3600)
        minutes = int((total_seconds % 3600) // 60)
        seconds = int(total_seconds % 60)

        if hours > 0:
            return f"{hours}:{minutes:02d}:{seconds:02d}"
        else:
            return f"{minutes}:{seconds:02d}"

    def _calculate_confidence(self, workout_history: List[WorkoutData], target_distance: float) -> float:
        """
        Calcul du niveau de confiance de la prédiction
        """
        confidence = 0.5  # Base

        # Plus de données = plus de confiance
        if len(workout_history) > 20:
            confidence += 0.2
        elif len(workout_history) > 10:
            confidence += 0.1

        # Expérience sur la distance
        similar_distances = [w for w in workout_history if abs(w.distance - target_distance) <= target_distance * 0.2]
        if len(similar_distances) >= 3:
            confidence += 0.2

        # Récence des données
        recent_workouts = len([w for w in workout_history[-10:]])
        if recent_workouts >= 5:
            confidence += 0.1

        return min(0.95, confidence)

    def _assess_current_fitness(self, workout_history: List[WorkoutData]) -> str:
        """
        Évaluation du niveau de forme actuel
        """
        if len(workout_history) < 5:
            return "débutant"

        features = self._extract_features_from_history(workout_history)

        avg_pace = features.get('best_pace', 400)
        avg_distance = features.get('avg_distance', 3)
        consistency = features.get('consistency_score', 0.3)

        # Scoring basé sur les métriques
        score = 0

        if avg_pace < 240:  # < 4:00/km
            score += 3
        elif avg_pace < 300:  # < 5:00/km
            score += 2
        elif avg_pace < 360:  # < 6:00/km
            score += 1

        if avg_distance > 15:
            score += 3
        elif avg_distance > 8:
            score += 2
        elif avg_distance > 5:
            score += 1

        if consistency > 0.7:
            score += 2
        elif consistency > 0.5:
            score += 1

        # Classification
        if score >= 7:
            return "excellent"
        elif score >= 5:
            return "bon"
        elif score >= 3:
            return "moyen"
        else:
            return "débutant"

    def _calculate_improvement_potential(self, workout_history: List[WorkoutData], days_to_race: int, fitness_level: str) -> str:
        """
        Calcul du potentiel d'amélioration
        """
        base_potential = {
            "débutant": "très élevé",
            "moyen": "élevé",
            "bon": "modéré",
            "excellent": "limité"
        }.get(fitness_level, "modéré")

        # Ajustement selon le temps disponible
        if days_to_race < 30:
            if base_potential == "très élevé":
                return "élevé"
            elif base_potential == "élevé":
                return "modéré"
        elif days_to_race > 90:
            if base_potential == "modéré":
                return "élevé"
            elif base_potential == "limité":
                return "modéré"

        return base_potential

    def _generate_training_recommendations(self, workout_history: List[WorkoutData], target_distance: float, days_to_race: int) -> List[str]:
        """
        Génération de recommandations d'entraînement spécialisées
        """
        recommendations = []

        features = self._extract_features_from_history(workout_history)

        # Recommandations selon la distance cible
        if target_distance <= 10:
            recommendations.append("Intégrez 1-2 séances de fractionné par semaine pour la vitesse")
            recommendations.append("Travaillez les allures spécifiques à votre objectif")
        elif target_distance <= 21.1:
            recommendations.append("Développez votre endurance avec des sorties longues")
            recommendations.append("Incluez des séances au seuil lactique")
        else:
            recommendations.append("Priorité à l'endurance fondamentale (70-80% du volume)")
            recommendations.append("Progressez graduellement sur la distance longue")

        # Recommandations selon le temps disponible
        if days_to_race < 45:
            recommendations.append("Focalisez sur la spécificité - allures de course")
            recommendations.append("Réduisez progressivement le volume avant la compétition")
        else:
            recommendations.append("Construisez une base aérobie solide")
            recommendations.append("Progression graduelle du volume (+10% par semaine max)")

        # Recommandations selon les faiblesses identifiées
        if features.get('consistency_score', 0) < 0.5:
            recommendations.append("Privilégiez la régularité à l'intensité")

        if features.get('speed_ratio', 0) < 0.1:
            recommendations.append("Ajoutez du travail de vitesse (fractionné court)")

        return recommendations

    def _generate_milestone_predictions(self, target_distance: float, predicted_time: float, days_to_race: int) -> List[Dict[str, Any]]:
        """
        Génération de prédictions pour les jalons intermédiaires
        """
        milestones = []

        # Prédictions à différents jalons temporels
        checkpoints = []
        if days_to_race > 60:
            checkpoints = [30, 60, days_to_race - 14]  # 1 mois, 2 mois, affûtage
        elif days_to_race > 30:
            checkpoints = [15, days_to_race - 7]  # 2 semaines, affûtage
        else:
            checkpoints = [days_to_race - 7]  # Juste l'affûtage

        for checkpoint in checkpoints:
            if checkpoint <= 0:
                continue

            # Estimation d'amélioration progressive
            progress_ratio = (days_to_race - checkpoint) / days_to_race

            # Amélioration potentielle (2-5% selon le niveau)
            max_improvement = 0.03  # 3% d'amélioration potentielle
            expected_improvement = max_improvement * progress_ratio

            milestone_time = predicted_time * (1 - expected_improvement)

            milestones.append({
                "checkpoint_days": checkpoint,
                "predicted_time": self._seconds_to_time_string(milestone_time),
                "expected_improvement": f"{expected_improvement * 100:.1f}%",
                "confidence": 0.7 - (progress_ratio * 0.1)  # Moins certain pour les prédictions lointaines
            })

        return milestones

    def _get_model_key_for_distance(self, distance: float) -> str:
        """
        Clé de modèle selon la distance
        """
        if distance <= 5:
            return "5k_model"
        elif distance <= 10:
            return "10k_model"
        elif distance <= 21.1:
            return "half_marathon_model"
        elif distance <= 42.2:
            return "marathon_model"
        else:
            return "ultra_model"

    def _features_to_vector(self, features: Dict[str, float]) -> np.ndarray:
        """
        Conversion des features en vecteur pour ML
        """
        # Features sélectionnées pour le modèle
        selected_features = [
            'avg_pace', 'best_pace', 'avg_distance', 'max_distance',
            'consistency_score', 'training_load', 'recent_form',
            'training_frequency', 'endurance_ratio', 'speed_ratio'
        ]

        vector = []
        for feature in selected_features:
            vector.append(features.get(feature, 0))

        return np.array(vector)

    async def train_models_from_data(self, training_data: List[Dict[str, Any]]) -> bool:
        """
        Entraînement des modèles ML à partir de données d'entraînement
        Cette fonction serait appelée pour entraîner sur de vraies données
        """
        try:
            # Cette fonction nécessiterait un dataset d'entraînement avec :
            # - Historique d'entraînement
            # - Temps réels de course
            # - Caractéristiques de l'athlète

            logger.info("Entraînement des modèles ML simulé")
            self.is_trained = False  # Simulé pour cette version

            return True

        except Exception as e:
            logger.error(f"Erreur entraînement modèles: {e}")
            return False