#!/bin/bash
# Quick start script for Bingo App

echo "🎮 Starting Bingo App..."
echo ""

# Check if backend is running
echo "📡 Checking backend (port 8000)..."
if ! nc -z localhost 8000 2>/dev/null; then
    echo "⚠️  Backend not running. Start it with:"
    echo "   cd backend && uvicorn app.main:app --reload"
    echo ""
fi

# Check if frontend is running
echo "🌐 Checking frontend (port 3000)..."
if ! nc -z localhost 3000 2>/dev/null; then
    echo "⚠️  Frontend not running. Start it with:"
    echo "   cd frontend && npm run dev"
    echo ""
fi

echo "✅ If both are running, open http://localhost:3000 in your browser"
