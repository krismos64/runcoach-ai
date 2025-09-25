import os
import asyncio
import logging
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

class DatabaseConnection:
    """
    Gestionnaire de connexion base de données
    Pour cette version, utilise un stockage simulé en mémoire
    Peut être étendu pour SQLite, PostgreSQL, etc.
    """

    def __init__(self):
        self.db_url = os.getenv("DATABASE_URL", "sqlite:///./runcoach.db")
        self.connection = None
        self.is_connected = False

        # Stockage temporaire en mémoire pour cette version
        self.memory_store = {
            "users": {},
            "workouts": {},
            "analyses": {},
            "predictions": {}
        }

    async def connect(self) -> bool:
        """
        Établissement de la connexion à la base de données
        """
        try:
            # Dans une vraie implémentation, ici on se connecterait à la DB
            # For now, simulate connection
            self.is_connected = True
            logger.info(f"Connexion simulée à la base de données: {self.db_url}")
            return True

        except Exception as e:
            logger.error(f"Erreur connexion base de données: {e}")
            self.is_connected = False
            return False

    async def disconnect(self):
        """
        Fermeture de la connexion
        """
        self.is_connected = False
        self.connection = None
        logger.info("Déconnexion base de données")

    async def store_user_data(self, user_id: str, data: Dict[str, Any]) -> bool:
        """
        Stockage des données utilisateur
        """
        try:
            self.memory_store["users"][user_id] = data
            logger.info(f"Données utilisateur stockées pour: {user_id}")
            return True
        except Exception as e:
            logger.error(f"Erreur stockage données utilisateur: {e}")
            return False

    async def get_user_data(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Récupération des données utilisateur
        """
        try:
            return self.memory_store["users"].get(user_id)
        except Exception as e:
            logger.error(f"Erreur récupération données utilisateur: {e}")
            return None

    async def store_workout_analysis(self, workout_id: str, analysis: Dict[str, Any]) -> bool:
        """
        Stockage d'une analyse d'entraînement
        """
        try:
            self.memory_store["analyses"][workout_id] = {
                "analysis": analysis,
                "created_at": asyncio.get_event_loop().time()
            }
            logger.info(f"Analyse stockée pour workout: {workout_id}")
            return True
        except Exception as e:
            logger.error(f"Erreur stockage analyse: {e}")
            return False

    async def get_workout_analysis(self, workout_id: str) -> Optional[Dict[str, Any]]:
        """
        Récupération d'une analyse d'entraînement
        """
        try:
            stored_data = self.memory_store["analyses"].get(workout_id)
            return stored_data["analysis"] if stored_data else None
        except Exception as e:
            logger.error(f"Erreur récupération analyse: {e}")
            return None

    async def store_performance_prediction(self, user_id: str, prediction: Dict[str, Any]) -> bool:
        """
        Stockage d'une prédiction de performance
        """
        try:
            if user_id not in self.memory_store["predictions"]:
                self.memory_store["predictions"][user_id] = []

            self.memory_store["predictions"][user_id].append({
                "prediction": prediction,
                "created_at": asyncio.get_event_loop().time()
            })

            logger.info(f"Prédiction stockée pour utilisateur: {user_id}")
            return True
        except Exception as e:
            logger.error(f"Erreur stockage prédiction: {e}")
            return False

    async def get_user_predictions(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Récupération des prédictions d'un utilisateur
        """
        try:
            predictions = self.memory_store["predictions"].get(user_id, [])
            return [p["prediction"] for p in predictions]
        except Exception as e:
            logger.error(f"Erreur récupération prédictions: {e}")
            return []

    async def cleanup_old_data(self, max_age_hours: int = 24) -> int:
        """
        Nettoyage des données anciennes
        """
        try:
            current_time = asyncio.get_event_loop().time()
            max_age_seconds = max_age_hours * 3600
            cleaned_count = 0

            # Nettoyage des analyses
            to_remove = []
            for workout_id, data in self.memory_store["analyses"].items():
                if current_time - data["created_at"] > max_age_seconds:
                    to_remove.append(workout_id)

            for workout_id in to_remove:
                del self.memory_store["analyses"][workout_id]
                cleaned_count += 1

            # Nettoyage des prédictions
            for user_id in self.memory_store["predictions"]:
                old_predictions = [
                    p for p in self.memory_store["predictions"][user_id]
                    if current_time - p["created_at"] > max_age_seconds
                ]

                self.memory_store["predictions"][user_id] = [
                    p for p in self.memory_store["predictions"][user_id]
                    if current_time - p["created_at"] <= max_age_seconds
                ]

                cleaned_count += len(old_predictions)

            logger.info(f"Nettoyage terminé: {cleaned_count} entrées supprimées")
            return cleaned_count

        except Exception as e:
            logger.error(f"Erreur nettoyage données: {e}")
            return 0

    async def get_database_stats(self) -> Dict[str, Any]:
        """
        Statistiques de la base de données
        """
        try:
            stats = {
                "users_count": len(self.memory_store["users"]),
                "analyses_count": len(self.memory_store["analyses"]),
                "predictions_count": sum(len(preds) for preds in self.memory_store["predictions"].values()),
                "is_connected": self.is_connected,
                "database_type": "memory_store",
                "database_url": self.db_url
            }
            return stats
        except Exception as e:
            logger.error(f"Erreur récupération stats DB: {e}")
            return {"error": str(e)}

    async def migrate_to_persistent_storage(self) -> bool:
        """
        Migration vers un stockage persistant (SQLite, PostgreSQL, etc.)
        À implémenter selon les besoins futurs
        """
        try:
            logger.info("Migration vers stockage persistant - non implémentée dans cette version")
            return True
        except Exception as e:
            logger.error(f"Erreur migration: {e}")
            return False

# Instance globale
db_connection = DatabaseConnection()

async def get_database_connection():
    """
    Factory function pour obtenir la connexion DB
    """
    if not db_connection.is_connected:
        await db_connection.connect()
    return db_connection

async def init_database():
    """
    Initialisation de la base de données au démarrage
    """
    connection = await get_database_connection()
    if connection.is_connected:
        logger.info("Base de données initialisée avec succès")
        return True
    else:
        logger.error("Échec initialisation base de données")
        return False