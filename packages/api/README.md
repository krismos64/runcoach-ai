# RunCoach AI - API Python Backend

## 🚀 Overview

Backend API Python avec FastAPI pour les analyses avancées de données de course à pied utilisant l'intelligence artificielle et le machine learning.

## 🛠 Technologies utilisées

- **FastAPI** - Framework web moderne et rapide
- **Python 3.11** - Langage de programmation
- **scikit-learn** - Machine Learning
- **pandas/numpy** - Manipulation de données
- **TensorFlow/Keras** - Deep Learning (optionnel)
- **Kaggle API** - Datasets de référence
- **Docker** - Conteneurisation

## 📦 Installation

### Prérequis

- Python 3.11+
- Docker (optionnel)
- Node.js 18+ (pour le frontend)

### Installation locale

```bash
# Cloner le repository
cd packages/api

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres
```

### Installation Docker

```bash
# Build et lancement avec Docker Compose
docker-compose up --build

# Ou build manuel
docker build -t runcoach-api .
docker run -p 8000:8000 runcoach-api
```

## 🔧 Configuration

### Variables d'environnement

```bash
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./runcoach.db
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
KAGGLE_USERNAME=your_kaggle_username
KAGGLE_KEY=your_kaggle_api_key
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Configuration Kaggle (optionnelle)

Pour utiliser les datasets Kaggle :

1. Créer un compte sur [kaggle.com](https://kaggle.com)
2. Aller dans Account → API → Create New API Token
3. Télécharger le fichier `kaggle.json`
4. Configurer les variables `KAGGLE_USERNAME` et `KAGGLE_KEY`

## 🚀 Lancement

### Développement

```bash
# Mode développement avec rechargement automatique
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Ou avec les logs détaillés
python -m uvicorn main:app --reload --log-level debug
```

### Production

```bash
# Lancement production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Avec Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker

```bash
# Avec Docker Compose (recommandé)
docker-compose up

# Build et run manuel
docker build -t runcoach-api .
docker run -p 8000:8000 -e SECRET_KEY=your-secret-key runcoach-api
```

## 📊 API Endpoints

### Health Check

```bash
GET /health
# Response: {"status": "healthy", "version": "1.0.0"}
```

### Analyse d'entraînement

```bash
POST /analyze/workout
Content-Type: application/json

[
  {
    "id": "workout_1",
    "date": "2024-01-15",
    "type": "endurance",
    "duration": 45,
    "distance": 8.5,
    "pace": "5:30",
    "heart_rate": 150
  }
]
```

### Analyse des tendances

```bash
POST /analyze/performance-trend
Content-Type: application/json

# Même format que /analyze/workout avec historique complet
```

### Prédiction de performance

```bash
POST /predict/performance
Content-Type: application/json

{
  "workout_history": [...],
  "target_distance": 10.0,
  "target_date": "2024-06-15"
}
```

### Analyse des zones d'entraînement

```bash
POST /analyze/training-zones
Content-Type: application/json

# Historique d'entraînements pour analyser la distribution
```

### Évaluation risque de blessure

```bash
POST /analyze/injury-risk
Content-Type: application/json

# Historique d'entraînements récents
```

### Comparaison profil athlète

```bash
POST /compare/athlete-profile
Content-Type: application/json

{
  "user_workouts": [...],
  "age": 35,
  "gender": "male",
  "experience_level": "intermediate"
}
```

### Données de référence

```bash
GET /datasets/running-benchmarks
# Retourne les données de référence Kaggle
```

## 🧠 Intelligence Artificielle

### Analyses disponibles

1. **Score de qualité d'entraînement** - IA évalue la session (0-100)
2. **Prédiction de performance** - ML prédit les temps de course
3. **Détection des tendances** - Analyse l'évolution de la forme
4. **Évaluation des risques** - Prévention des blessures
5. **Comparaison avec peers** - Benchmarking avec datasets publics
6. **Zones d'entraînement** - Optimisation de la répartition des intensités

### Algorithmes utilisés

- **Random Forest** - Prédictions de temps de course
- **Gradient Boosting** - Analyse des tendances de performance
- **Réseaux de neurones** - Scoring complexe des entraînements
- **Clustering** - Détection de patterns comportementaux
- **Série temporelles** - Prévision des cycles de forme

### Datasets de référence

- **Kaggle Running Performance** - Données de courses publiques
- **Elite Athletes Data** - Benchmarks athlètes de haut niveau
- **Age Group Standards** - Standards par âge et genre
- **Training Load Research** - Recherche scientifique sur la charge

## 🔗 Intégration Frontend

### Service TypeScript

```typescript
import { apiService } from '../services/apiService';

// Analyse d'entraînement
const analysis = await apiService.analyzeWorkout(workouts);

// Prédiction
const prediction = await apiService.predictPerformance(
  workouts,
  10.0,
  '2024-06-15'
);
```

### Hook React

```typescript
import { useAdvancedAnalytics } from '../hooks/useAdvancedAnalytics';

const {
  isApiConnected,
  analyzeLatestWorkout,
  workoutAnalysis
} = useAdvancedAnalytics();
```

## 📁 Structure du projet

```
packages/api/
├── main.py                 # Point d'entrée FastAPI
├── requirements.txt        # Dépendances Python
├── Dockerfile             # Configuration Docker
├── docker-compose.yml     # Services Docker
├── .env.example          # Variables d'environnement exemple
├── models/               # Modèles Pydantic
│   ├── workout.py        # Modèles d'entraînement
│   └── user.py          # Modèles utilisateur
├── services/            # Logique métier
│   ├── ai_analytics.py  # Service IA principal
│   ├── ml_predictor.py  # Prédictions ML
│   ├── kaggle_service.py # Intégration Kaggle
│   └── workout_service.py # Gestion workouts
├── database/           # Gestion données
│   └── connection.py   # Connexion DB
└── data/              # Cache et datasets
    └── kaggle_benchmarks.json
```

## 🧪 Tests et développement

### Tests unitaires

```bash
# Installer pytest
pip install pytest pytest-asyncio

# Lancer les tests
pytest tests/ -v

# Avec coverage
pytest tests/ --cov=. --cov-report=html
```

### Tests d'intégration

```bash
# Test des endpoints
curl -X POST http://localhost:8000/analyze/workout \
  -H "Content-Type: application/json" \
  -d @test_data/sample_workout.json

# Test de santé
curl http://localhost:8000/health
```

### Debugging

```bash
# Mode debug avec logs détaillés
python -m uvicorn main:app --reload --log-level debug

# Profiling des performances
python -m cProfile -o profile_output.prof main.py
```

## 🚀 Déploiement

### Développement local

1. Lancer l'API : `uvicorn main:app --reload`
2. Lancer le frontend : `cd ../web && npm run dev`
3. Accéder à l'app : `http://localhost:5173`

### Production

```bash
# Avec Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Avec reverse proxy nginx
# Configurer nginx pour proxy_pass vers :8000
```

### Surveillance

- Logs : `/app/logs/`
- Métriques : `/metrics` (Prometheus)
- Health : `/health`

## 📈 Performance et optimisation

### Mise en cache

- Cache Redis pour les analyses fréquentes
- Cache local pour les benchmarks Kaggle
- Invalidation automatique après 24h

### Optimisations ML

- Modèles pré-entraînés sauvegardés
- Batch processing pour analyses multiples
- Calculs asynchrones pour UI responsive

### Monitoring

```python
# Métriques personnalisées
from prometheus_client import Counter, Histogram

ANALYSIS_COUNTER = Counter('analysis_requests_total')
ANALYSIS_TIME = Histogram('analysis_duration_seconds')
```

## 🔒 Sécurité

### Authentification

- JWT tokens pour sessions
- Rate limiting par IP
- Validation stricte des inputs
- Sanitisation des données

### Protection données

- Pas de stockage permanent des données utilisateur
- Chiffrement des communications (HTTPS)
- Logs anonymisés
- Conformité RGPD

## 📚 Documentation API

### Swagger/OpenAPI

- Documentation interactive : `http://localhost:8000/docs`
- Schéma OpenAPI : `http://localhost:8000/openapi.json`
- ReDoc alternative : `http://localhost:8000/redoc`

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push la branche (`git push origin feature/amazing-feature`)
5. Créer une Pull Request

## 📄 License

MIT License - voir le fichier [LICENSE](LICENSE) pour les détails.

## 🐛 Support

- Issues GitHub : [Créer un ticket](../../issues)
- Documentation : [Wiki du projet](../../wiki)
- Email : support@runcoach-ai.com