#!/bin/bash

echo "🏃‍♂️ RunCoach AI - Démarrage complet"
echo "=================================="

# Couleurs pour les logs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les logs colorés
log() {
    echo -e "${GREEN}[RunCoach]${NC} $1"
}

error() {
    echo -e "${RED}[ERREUR]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[ATTENTION]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Vérification des prérequis
log "Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
    exit 1
fi

# Vérifier Python
if ! command -v python3 &> /dev/null; then
    error "Python 3 n'est pas installé. Veuillez l'installer."
    exit 1
fi

log "✅ Prérequis OK - Node.js $(node --version), Python $(python3 --version)"

# Installation des dépendances frontend si nécessaire
if [ ! -d "packages/web/node_modules" ]; then
    log "Installation des dépendances frontend..."
    cd packages/web
    npm install
    cd ../..
else
    log "✅ Dépendances frontend déjà installées"
fi

# Vérification environnement virtuel Python
if [ ! -d "packages/api/venv" ]; then
    log "Création de l'environnement virtuel Python..."
    cd packages/api
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ../..
else
    log "✅ Environnement virtuel Python déjà créé"
fi

# Fonction pour nettoyer les processus à l'arrêt
cleanup() {
    log "Arrêt des services..."
    kill $FRONTEND_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    exit
}

# Capturer Ctrl+C
trap cleanup SIGINT

# Lancement du backend Python
log "🐍 Démarrage de l'API Python (port 8000)..."
cd packages/api
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ../..

# Attendre que l'API soit prête
sleep 3

# Test de l'API
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    log "✅ API Python prête sur http://localhost:8000"
else
    warn "⚠️  API Python non accessible - analyses IA désactivées"
fi

# Lancement du frontend React
log "⚛️  Démarrage du frontend React (port 3001)..."
cd packages/web
npm run dev &
FRONTEND_PID=$!
cd ../..

# Attendre que le frontend soit prêt
sleep 3

echo ""
log "🎉 RunCoach AI démarré avec succès !"
echo ""
info "📱 Application : http://localhost:3001"
info "🐍 API Python  : http://localhost:8000"
info "📖 API Docs    : http://localhost:8000/docs"
echo ""
log "👤 Compte de test :"
info "   Email    : c.mostefaoui@yahoo.fr"
info "   Password : Mostefaoui1."
echo ""
warn "Appuyez sur Ctrl+C pour arrêter tous les services"
echo ""

# Attendre indéfiniment (les processus tournent en arrière-plan)
wait