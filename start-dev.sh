#!/bin/bash
# Script para iniciar todo el proyecto PropFinder

echo "🚀 Iniciando PropFinder..."

# Compilar shared
echo "📦 Compilando shared..."
cd shared && npm run build && cd ..

# Iniciar backend en segundo plano
echo "🔧 Iniciando Backend (puerto 3001)..."
cd backend && npm run start:dev &
BACKEND_PID=$!

# Esperar un poco para que el backend inicie
sleep 3

# Iniciar frontend
echo "🎨 Iniciando Frontend (puerto 3000)..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo "✅ PropFinder iniciado!"
echo "🔧 Backend: http://localhost:3001"
echo "🎨 Frontend: http://localhost:3000"
echo "📚 API Docs: http://localhost:3001/api/docs"

# Función para limpiar procesos al salir
cleanup() {
    echo "🛑 Cerrando servicios..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Mantener el script corriendo
wait
