# 🚀 RunCoach AI - Guide de Démarrage Rapide

## ⚡ Technologies 2025 - Lancement en 1 commande

### 🚀 **Commande magique (RECOMMANDÉE)**
```bash
npm start
# ou
./reset-and-start.sh
```

**✨ Technologies mises à jour automatiquement :**
- ⚛️ **React 19.1+** (Mars 2025) avec Vite optimisé
- 🐍 **FastAPI >=0.112.0** avec dépendances standard
- 🧠 **Python 3.13** compatible avec scikit-learn 1.7+
- 📊 **pandas >=2.2.0** et **numpy >=1.26.0**
- 🔄 **Nettoyage automatique** des caches et environnements
- ✅ **Verification des compatibilités** avant lancement

### 🎯 **Commandes alternatives**

#### Frontend seul
```bash
npm run dev:web
# ➜ http://localhost:3001
```

#### API Python seule
```bash
npm run dev:python
# ➜ http://localhost:8000
```

#### Avec Docker
```bash
npm run docker:up
# Stack complète avec Docker
```

#### Installation manuelle Python
```bash
npm run setup:python
# Configure l'environnement virtuel Python
```

## 🎯 Test rapide

1. **Lancer l'application :** `npm start`
2. **Accéder :** http://localhost:3001
3. **Se connecter :**
   - Email : `c.mostefaoui@yahoo.fr`
   - Mot de passe : `Mostefaoui1.`
4. **Tester l'IA :** Composant de test sur le Dashboard
5. **Importer des données :** Section "Importer des données" → glisser-déposer un fichier GPX/TCX/CSV
6. **Voir les analyses IA :** Page "Statistiques" → Onglet "Analyses IA Avancées"

## 📊 Ce qui fonctionne

### ✅ **Avec API Python (mode complet)**
- 🧠 **Scoring d'entraînements IA** (0-100)
- 🔮 **Prédictions de performance ML**
- ⚠️ **Évaluation risques blessures**
- 📈 **Analyses de tendances avancées**
- 🏆 **Comparaisons benchmarks**
- 💡 **Recommandations personnalisées**

### ✅ **Sans API Python (mode local)**
- 📊 **Import de données** (GPX/TCX/CSV/ZIP)
- 📈 **Dashboard avec métriques**
- 📊 **Analyses JavaScript basiques**
- 🎯 **Gestion des objectifs**
- 📱 **Interface complète**

## 🔗 URLs importantes

- **Application :** http://localhost:3001
- **API Python :** http://localhost:8000
- **Documentation API :** http://localhost:8000/docs
- **Health Check :** http://localhost:8000/health

## 🛠 Scripts disponibles

```bash
npm start              # 🚀 Lancement complet avec reset (recommandé)
npm run reset          # 🧹 Reset complet + lancement
npm run dev:web        # ⚛️  Frontend React seulement
npm run dev:python     # 🐍 API Python seulement
npm run setup:python   # 📦 Setup environnement Python optimisé
npm run docker:up      # 🐳 Docker Compose
npm run docker:down    # ⏹️  Arrêt Docker
npm run build          # 🏗️  Build production
npm run clean          # 🧹 Nettoyage complet
```

### ✅ **Technologies confirmées via Web Search 2025**
- **React 19** : Dernière version stable avec nouvelles features async
- **FastAPI** : Version >=0.112.0 avec support Python 3.13
- **scikit-learn 1.7+** : Compatible Python 3.13 avec wheels optimisés
- **pandas >=2.2.0** : Version compatible Python 3.13
- **Vite** : Build tool moderne recommandé (remplace Create React App)

## 🐛 Résolution rapide

### Le script ne démarre pas
```bash
chmod +x start.sh
npm run setup:python
npm start
```

### Port déjà utilisé
```bash
lsof -ti:3001 | xargs kill -9
lsof -ti:8000 | xargs kill -9
npm start
```

### Problème Python
```bash
rm -rf packages/api/venv
npm run setup:python
```

---

**🎯 Commande pour tout lancer : `npm start`**