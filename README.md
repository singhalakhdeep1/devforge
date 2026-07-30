# DevForge - Full-Stack Developer Platform

A production-ready, enterprise-grade full-stack learning management platform built with modern technologies and microservices architecture.

## 🎯 Project Overview

DevForge is a comprehensive developer learning platform featuring:
- Course management and enrollment system
- Real-time collaboration features
- User authentication and authorization
- Progress tracking and analytics
- Discussion forums and Q&A
- Code execution environment
- Payment integration (Stripe)
- **17 microservices** for scalable architecture

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Axios (API client)

**Backend:**
- Node.js + Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Socket.IO (real-time)
- Microservices architecture

**DevOps:**
- Docker & Docker Compose
- Kubernetes configurations
- CI/CD pipelines
- Monitoring stack (Prometheus/Grafana)

## 📁 Project Structure

```
devforge/
├── backend/                    # Backend microservices
│   ├── src/                   # Main backend application
│   │   ├── controllers/      # Request handlers
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Express middleware
│   │   └── utils/            # Utility functions
│   ├── auth-service/         # Authentication microservice
│   ├── email-service/        # Email processing
│   ├── analytics-service/    # Analytics & reporting
│   ├── search-service/       # Elasticsearch integration
│   ├── video-service/        # WebRTC video calls
│   ├── editor-service/       # Collaborative code editor
│   ├── payment-service/      # Stripe integration
│   ├── kanban-service/       # Project management
│   ├── graphql-api/          # GraphQL API layer
│   └── [other services]      # Additional microservices
├── frontend/                 # Next.js 15 application
│   ├── app/                 # App Router pages
│   │   ├── page.tsx        # Landing page
│   │   ├── login/          # Authentication
│   │   ├── courses/        # Course management
│   │   ├── dashboard/      # User dashboard
│   │   └── profile/        # User profile
│   ├── components/         # React components
│   │   └── ui/            # Reusable UI components
│   └── lib/               # Utilities & API client
├── websocket-server/       # Real-time WebSocket server
├── docs/                  # Documentation
├── k8s/                   # Kubernetes manifests
└── monitoring/            # Monitoring configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd devforge

# Frontend Setup
cd frontend
npm install
cp .env.example .env.local
cd ..

# Backend Setup
cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL in .env
npx prisma migrate dev
npx prisma generate
cd ..

# Start Development Servers
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

### Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432

## ✨ Key Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Student, Instructor, Admin)
- Email verification and password reset
- Protected API routes

### Course Management
- Course creation and management
- Module and lesson structure
- Course enrollment system
- Progress tracking
- Category-based filtering

### Learning Features
- Video lesson support
- Interactive quizzes
- Code execution environment
- Progress analytics
- Certificate generation

### User Experience
- Responsive design (mobile-friendly)
- Dark mode support
- Real-time notifications
- User profiles with skills
- Achievement badges

### Advanced Features
- Real-time collaboration (WebSockets)
- Video conferencing (WebRTC)
- Collaborative code editing (CRDTs)
- Advanced search (Elasticsearch)
- Payment processing (Stripe)
- Project management (Kanban)

## 📊 Project Statistics

- **Total Lines of Code**: ~73,000
- **Frontend Pages**: 7 complete pages
- **UI Components**: 8 reusable components
- **Backend Controllers**: 7 complete controllers
- **API Endpoints**: 50+ endpoints
- **Microservices**: 17 services
- **Database Models**: 12+ Prisma models

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only

# Building
npm run build            # Build both frontend and backend
npm run build:frontend   # Build frontend only
npm run build:backend    # Build backend only

# Docker
npm run docker:up        # Start Docker services
npm run docker:down      # Stop Docker services
```

## 📚 Documentation

- [Architecture Documentation](docs/architecture/ARCHITECTURE.md)
- [API Reference](docs/architecture/API.md)
- [Setup Guide](docs/architecture/SETUP.md)
- [Quick Reference](docs/architecture/QUICK_REFERENCE.md)

## 🧪 Testing

The project includes testing infrastructure:
- Unit tests (Jest)
- Integration tests
- E2E tests (Playwright)
- Component tests

## 🚀 Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Kubernetes Deployment
```bash
kubectl apply -f k8s/base/
```

## 🤝 Contributing

This is a portfolio project demonstrating full-stack development skills. For questions or suggestions, please open an issue.

## 📝 License

This project is for educational and portfolio purposes.

## 👨‍💻 Developer Notes

This project demonstrates expertise in:
- Full-stack development (React/Node.js)
- Microservices architecture
- Database design (PostgreSQL, MongoDB)
- Real-time systems (WebSockets, WebRTC)
- Cloud services (AWS, Stripe)
- DevOps practices (Docker, Kubernetes)
- Modern development practices (TypeScript, CI/CD)

---

**Built with ❤️ for demonstrating professional full-stack development skills**