# 🏃‍♂️ RunCoach AI - Monorepo

> **Architecture moderne 2024-2025** - Application d'entraînement intelligent avec IA

## 📁 Structure du Projet

```
runcoach-ai/
├── packages/
│   ├── api/              # 🚀 Backend Node.js + TypeScript
│   │   ├── src/
│   │   │   ├── infrastructure/   # Sécurité, logging, database
│   │   │   ├── presentation/     # Controllers, middleware, validators
│   │   │   ├── shared/          # Configuration, erreurs, types
│   │   │   └── routes/          # Routes avec validation + sécurité
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/              # 🎨 Frontend React + Vite
│       ├── src/
│       ├── package.json
│       └── vite.config.ts
├── package.json          # 📦 Configuration workspace
└── README.md
```

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0
- **MongoDB** (local ou Atlas)

### Installation
```bash
# Installation des dépendances (tous les packages)
npm install

# Installation d'un package spécifique
npm install --workspace=packages/api
npm install --workspace=packages/web
```

### Développement

```bash
# Démarrer l'API uniquement (port 3001)
npm run dev:api

# Démarrer le frontend uniquement (port 3000)
npm run dev:web

# Démarrer API + Frontend simultanément
npm run dev:all

# Démarrage par défaut (API seulement)
npm run dev
```

### Production

```bash
# Build tous les packages
npm run build

# Build spécifique
npm run build:api
npm run build:web

# Démarrer en production
npm start
```

## 🔧 Configuration

### Variables d'Environnement

Créer `.env` dans `packages/api/` :

```bash
# Serveur
PORT=3001
NODE_ENV=development

# Base de données
MONGODB_URI=mongodb://localhost:27017/runcoach-ai

# JWT
JWT_SECRET=your_32_characters_secret_key_here
JWT_EXPIRES_IN=15m

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# Logging
LOG_LEVEL=info

# Sécurité
BCRYPT_ROUNDS=12
```

## 🛡️ Architecture & Sécurité

### Fonctionnalités Sécurité

- **🔒 Helmet** : Protection headers HTTP (CSP, HSTS, XSS)
- **⚡ Rate Limiting** : 100 req/15min global, 5 req/15min auth
- **✅ Validation Zod** : Schémas TypeScript-first robustes
- **🧹 Sanitisation** : Protection injection NoSQL et XSS
- **🔑 JWT sécurisé** : Tokens courts (15min) avec validation stricte

### Logging & Monitoring

- **📊 Pino** : Logging haute performance (+300% vs console.log)
- **📈 Logs structurés** : auth, database, performance tracking
- **🚨 Gestion d'erreurs centralisée** : AppError avec codes spécifiques

## 📚 Scripts Disponibles

### Racine (Monorepo)
- `npm run dev` - Démarrer l'API
- `npm run dev:all` - API + Frontend
- `npm run build` - Build tous les packages
- `npm run test` - Tests tous les packages
- `npm run lint` - Lint tous les packages
- `npm run clean` - Nettoyer node_modules

### API (packages/api)
- `npm run dev --workspace=packages/api` - Mode développement
- `npm run build --workspace=packages/api` - Build TypeScript
- `npm run start --workspace=packages/api` - Production

### Frontend (packages/web)
- `npm run dev --workspace=packages/web` - Serveur Vite
- `npm run build --workspace=packages/web` - Build production
- `npm run preview --workspace=packages/web` - Prévisualiser build

## 🌐 Endpoints API

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil utilisateur
- `PUT /api/auth/profile` - Mise à jour profil

### Health & Monitoring
- `GET /health` - Health check
- `GET /` - API info

### Workouts & Training
- `GET /api/workouts` - Liste des entraînements
- `POST /api/workouts` - Créer un entraînement
- `GET /api/predictions` - Prédictions IA
- `GET /api/training-plans` - Plans d'entraînement

## 🧪 Tests

```bash
# Tests tous les packages
npm run test

# Tests spécifiques
npm run test --workspace=packages/api
npm run test --workspace=packages/web
```

## 🚀 Déploiement

### Docker (Recommandé)

```bash
# Build images
docker-compose build

# Démarrer stack complète
docker-compose up -d

# Logs
docker-compose logs -f
```

### Production Manuelle

```bash
# Build
npm run build

# Démarrer API
cd packages/api && npm start

# Servir frontend (nginx recommandé)
cd packages/web && npm run preview
```

## 📈 Performance

- **API** : Architecture Clean + TypeScript strict
- **Frontend** : React 19 + Vite + Code splitting
- **Base de données** : MongoDB avec indexes optimisés
- **Sécurité** : Protection OWASP Top 10 complète

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📝 License

MIT License - voir [LICENSE](LICENSE) pour plus de détails.

---

**🎯 RunCoach AI v2.0 - Architecture moderne, sécurisée et évolutive pour 2024-2025**