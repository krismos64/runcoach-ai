from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv
import logging

# Import des modules internes
from models.workout import WorkoutData, WorkoutCreate, WorkoutAnalysis
from models.user import User, UserCreate
from services.ai_analytics import AIAnalyticsService
from services.workout_service import WorkoutService
from services.ml_predictor import MLPredictorService
from database.connection import get_database_connection

# Configuration
load_dotenv()

app = FastAPI(
    title="RunCoach AI API",
    description="API backend pour analyses avancées de données de course à pied avec IA",
    version="1.0.0"
)

# Configuration CORS
origins = os.getenv("CORS_ORIGINS", "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services
ai_service = AIAnalyticsService()
workout_service = WorkoutService()
ml_service = MLPredictorService()

# Security
security = HTTPBearer()

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.get("/")
async def root():
    return {"message": "RunCoach AI API - Advanced Analytics Backend"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

# Endpoints d'analyse IA
@app.post("/analyze/workout", response_model=WorkoutAnalysis)
async def analyze_workout(workout_data: List[WorkoutData]):
    """
    Analyse avancée d'un entraînement avec IA
    """
    try:
        analysis = await ai_service.analyze_workout(workout_data)
        return analysis
    except Exception as e:
        logger.error(f"Erreur analyse workout: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/performance-trend")
async def analyze_performance_trend(workouts: List[WorkoutData]):
    """
    Analyse des tendances de performance sur plusieurs entraînements
    """
    try:
        trend_analysis = await ai_service.analyze_performance_trend(workouts)
        return trend_analysis
    except Exception as e:
        logger.error(f"Erreur analyse tendance: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/performance")
async def predict_performance(
    workout_history: List[WorkoutData],
    target_distance: float,
    target_date: str
):
    """
    Prédiction de performance basée sur l'historique
    """
    try:
        prediction = await ml_service.predict_race_time(
            workout_history, target_distance, target_date
        )
        return prediction
    except Exception as e:
        logger.error(f"Erreur prédiction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/training-zones")
async def analyze_training_zones(workouts: List[WorkoutData]):
    """
    Analyse des zones d'entraînement et recommandations
    """
    try:
        zones_analysis = await ai_service.analyze_training_zones(workouts)
        return zones_analysis
    except Exception as e:
        logger.error(f"Erreur analyse zones: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/injury-risk")
async def analyze_injury_risk(workouts: List[WorkoutData]):
    """
    Évaluation du risque de blessure basée sur l'IA
    """
    try:
        risk_analysis = await ai_service.analyze_injury_risk(workouts)
        return risk_analysis
    except Exception as e:
        logger.error(f"Erreur analyse risque: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/datasets/running-benchmarks")
async def get_running_benchmarks():
    """
    Récupération des données de référence issues de datasets publics
    """
    try:
        benchmarks = await ai_service.get_running_benchmarks()
        return benchmarks
    except Exception as e:
        logger.error(f"Erreur récupération benchmarks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/compare/athlete-profile")
async def compare_athlete_profile(
    user_workouts: List[WorkoutData],
    age: int,
    gender: str,
    experience_level: str
):
    """
    Comparaison du profil athlète avec des données de référence
    """
    try:
        comparison = await ai_service.compare_athlete_profile(
            user_workouts, age, gender, experience_level
        )
        return comparison
    except Exception as e:
        logger.error(f"Erreur comparaison profil: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )