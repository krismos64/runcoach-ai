from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class WorkoutType(str, Enum):
    course = "course"
    fractionne = "fractionné"
    endurance = "endurance"
    recuperation = "récupération"

class WorkoutData(BaseModel):
    id: str
    date: str
    type: WorkoutType
    duration: int = Field(..., description="Durée en minutes")
    distance: float = Field(..., description="Distance en km")
    pace: str = Field(..., description="Allure au format mm:ss")
    heart_rate: Optional[int] = Field(None, description="Fréquence cardiaque moyenne")
    calories: Optional[int] = Field(None, description="Calories brûlées")
    notes: Optional[str] = Field(None, description="Notes sur l'entraînement")
    elevation_gain: Optional[float] = Field(None, description="Dénivelé positif en mètres")
    splits: Optional[List[Dict[str, Any]]] = Field(None, description="Temps de passage")
    weather: Optional[Dict[str, Any]] = Field(None, description="Conditions météo")

class WorkoutCreate(BaseModel):
    date: str
    type: WorkoutType
    duration: int
    distance: float
    pace: str
    heart_rate: Optional[int] = None
    calories: Optional[int] = None
    notes: Optional[str] = None
    elevation_gain: Optional[float] = None

class WorkoutAnalysis(BaseModel):
    workout_id: str
    overall_score: float = Field(..., description="Score global de 0 à 100")
    pace_analysis: Dict[str, Any] = Field(..., description="Analyse de l'allure")
    heart_rate_zones: Optional[Dict[str, float]] = Field(None, description="Répartition zones cardiaques")
    effort_consistency: float = Field(..., description="Consistance de l'effort (0-1)")
    fatigue_level: str = Field(..., description="Niveau de fatigue estimé")
    recovery_recommendation: str = Field(..., description="Recommandation de récupération")
    performance_insights: List[str] = Field(..., description="Insights de performance")
    comparison_to_history: Dict[str, Any] = Field(..., description="Comparaison à l'historique")

class PerformanceTrend(BaseModel):
    period: str = Field(..., description="Période analysée")
    fitness_trend: str = Field(..., description="Tendance de forme")
    endurance_evolution: Dict[str, float] = Field(..., description="Évolution endurance")
    speed_evolution: Dict[str, float] = Field(..., description="Évolution vitesse")
    volume_analysis: Dict[str, Any] = Field(..., description="Analyse du volume")
    recommendations: List[str] = Field(..., description="Recommandations d'entraînement")
    risk_factors: List[str] = Field(..., description="Facteurs de risque identifiés")

class TrainingZoneAnalysis(BaseModel):
    zone_distribution: Dict[str, float] = Field(..., description="Répartition par zones")
    recommendations: Dict[str, str] = Field(..., description="Recommandations par zone")
    polarization_index: float = Field(..., description="Index de polarisation")
    intensity_balance: str = Field(..., description="Équilibre des intensités")

class InjuryRiskAssessment(BaseModel):
    overall_risk: str = Field(..., description="Risque global (low/medium/high)")
    risk_score: float = Field(..., description="Score de risque (0-100)")
    risk_factors: List[Dict[str, Any]] = Field(..., description="Facteurs de risque")
    prevention_tips: List[str] = Field(..., description="Conseils de prévention")
    recommended_actions: List[str] = Field(..., description="Actions recommandées")

class PerformancePrediction(BaseModel):
    target_distance: float
    target_date: str
    predicted_time: str = Field(..., description="Temps prédit")
    confidence_level: float = Field(..., description="Niveau de confiance (0-1)")
    current_fitness_level: str = Field(..., description="Niveau de forme actuel")
    improvement_potential: str = Field(..., description="Potentiel d'amélioration")
    training_recommendations: List[str] = Field(..., description="Recommandations d'entraînement")
    milestone_predictions: List[Dict[str, Any]] = Field(..., description="Prédictions intermédiaires")