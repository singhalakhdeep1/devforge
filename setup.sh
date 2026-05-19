#!/bin/bash

echo "🚀 DevHub Full-Stack Platform - Startup Script"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. Install Docker to run databases easily."
    echo "   You can still run the project with local databases."
else
    echo "✅ Docker version: $(docker --version)"
fi

echo ""
echo "=============================================="
echo "📦 Installing Dependencies..."
echo "=============================================="
echo ""

# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all

echo ""
echo "=============================================="
echo "✅ Installation Complete!"
echo "=============================================="
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and configure"
echo "2. Start databases: npm run docker:dev"
echo "3. Start all services: npm run dev"
echo ""
echo "📚 Documentation:"
echo "- Setup Guide: docs/SETUP.md"
echo "- Quick Reference: docs/QUICK_REFERENCE.md"
echo "- Architecture: docs/ARCHITECTURE.md"
echo "- API Docs: docs/API.md"
echo ""
echo "🌐 Services will run on:"
echo "- Frontend: http://localhost:3000"
echo "- API Gateway: http://localhost:4000"
echo "- Auth Service: http://localhost:4001"
echo "- WebSocket: http://localhost:4006"
echo ""
echo "Happy Coding! 🎉"
