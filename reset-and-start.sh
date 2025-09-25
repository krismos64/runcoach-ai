#!/bin/bash

echo "🧹 RunCoach AI - Reset et Redémarrage Complet"
echo "=============================================="

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[Reset]${NC} $1"; }
error() { echo -e "${RED}[ERREUR]${NC} $1"; }
warn() { echo -e "${YELLOW}[ATTENTION]${NC} $1"; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }

# Nettoyage des processus
log "🔄 Arrêt des processus en cours..."
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "uvicorn" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
lsof -ti:3001,3002,8000 | xargs kill -9 2>/dev/null || true

# Nettoyage environnement Python
log "🐍 Nettoyage environnement Python..."
rm -rf packages/api/venv
rm -rf packages/api/__pycache__
rm -rf packages/api/**/__pycache__

# Nettoyage cache Vite
log "⚡ Nettoyage cache Vite..."
rm -rf packages/web/node_modules/.vite
rm -rf packages/web/.vite

# Création environnement Python avec versions compatibles
log "🚀 Création nouvel environnement Python (3.13)..."
cd packages/api
python3 -m venv venv
source venv/bin/activate

log "📦 Installation dépendances Python optimisées..."
pip install --upgrade pip
pip install -r requirements.txt

# Test rapide de l'environnement Python
log "🧪 Test environnement Python..."
python -c "import fastapi, pandas, sklearn; print('✅ Python environment OK')" || {
    error "Environnement Python défaillant"
    exit 1
}

cd ../..

log "✅ Reset terminé ! Lancement de l'application..."
echo ""

# Fonction de nettoyage à l'arrêt
cleanup() {
    log "Arrêt des services..."
    kill $FRONTEND_PID 2>/dev/null || true
    kill $BACKEND_PID 2>/dev/null || true
    exit
}
trap cleanup SIGINT

# Lancement backend Python
log "🐍 Démarrage API Python (port 8000)..."
cd packages/api
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ../..

# Attente API
sleep 5

# Test API
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    log "✅ API Python opérationnelle sur http://localhost:8000"
else
    warn "⚠️  API Python non accessible - mode local seulement"
fi

# Lancement frontend React
log "⚛️  Démarrage frontend React (port 3001)..."
cd packages/web
npm run dev &
FRONTEND_PID=$!
cd ../..

sleep 3

echo ""
log "🎉 RunCoach AI avec technologies 2025 !"
echo ""
info "🌐 Application : http://localhost:3001"
info "🐍 API Python  : http://localhost:8000"
info "📖 API Docs    : http://localhost:8000/docs"
echo ""
info "📚 Technologies mises à jour :"
info "   • React 19.1+ (Mars 2025)"
info "   • FastAPI >=0.112.0 (standard)"
info "   • Python 3.13 compatible"
info "   • scikit-learn >=1.7.0"
info "   • pandas >=2.2.0"
echo ""
log "👤 Compte de test :"
info "   Email    : c.mostefaoui@yahoo.fr"
info "   Password : Mostefaoui1."
echo ""
warn "Appuyez sur Ctrl+C pour arrêter tous les services"
echo ""

wait