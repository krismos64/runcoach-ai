from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    is_active: bool = True
    created_at: datetime
    profile: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class UserProfile(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    weight: Optional[float] = Field(None, description="Poids en kg")
    height: Optional[float] = Field(None, description="Taille en cm")
    running_experience: Optional[str] = Field(None, description="Niveau d'expérience")
    weekly_volume: Optional[float] = Field(None, description="Volume hebdomadaire moyen")
    personal_records: Optional[Dict[str, str]] = Field(None, description="Records personnels")
    goals: Optional[List[str]] = Field(None, description="Objectifs sportifs")
    preferences: Optional[Dict[str, Any]] = Field(None, description="Préférences utilisateur")

class AthleteComparison(BaseModel):
    user_percentile: float = Field(..., description="Percentile par rapport à la population")
    peer_comparison: Dict[str, Any] = Field(..., description="Comparaison avec les pairs")
    strengths: List[str] = Field(..., description="Points forts identifiés")
    areas_for_improvement: List[str] = Field(..., description="Axes d'amélioration")
    benchmark_data: Dict[str, Any] = Field(..., description="Données de référence")
    progression_potential: str = Field(..., description="Potentiel de progression")