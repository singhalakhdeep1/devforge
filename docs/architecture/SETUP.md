# 🚀 DevHub Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **npm** 10+ (comes with Node.js)
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

Optional:
- **PostgreSQL** 16+ (if not using Docker)
- **MongoDB** 7+ (if not using Docker)
- **Redis** 7+ (if not using Docker)

## Quick Start (5 minutes)

### 1. Clone the Repository

```bash
cd d:/Frontend-Practice/DevHub-FullStack-Platform
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### 3. Environment Setup

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

**Minimum required environment variables:**
```env
NODE_ENV=development
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
DATABASE_URL=postgresql://devhub_user:devhub_password@localhost:5432/devhub
MONGODB_URI=mongodb://localhost:27017/devhub
REDIS_URL=redis://localhost:6379
```

### 4. Start Databases with Docker

```bash
npm run docker:dev
```

This will start:
- PostgreSQL on port `5432`
- MongoDB on port `27017`
- Redis on port `6379`

### 5. Run Database Migrations

```bash
npm run migrate
```

### 6. Start All Services

```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:4000
- **Auth Service**: http://localhost:4001
- **Notification Service**: http://localhost:4002
- **Email Service**: http://localhost:4003
- **File Service**: http://localhost:4004
- **Analytics Service**: http://localhost:4005
- **WebSocket Server**: http://localhost:4006

### 7. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:4000/api-docs (if Swagger is enabled)
- **Health Check**: http://localhost:4000/health

---

## Detailed Setup

### Backend Services Setup

#### 1. Shared Module
```bash
cd backend/shared
npm install
npm run build
```

#### 2. API Gateway
```bash
cd backend/api-gateway
npm install
npm run dev
```

#### 3. Auth Service
```bash
cd backend/auth-service
npm install
npm run dev
```

#### 4. Other Services
Repeat for notification-service, email-service, file-service, analytics-service.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### WebSocket Server Setup

```bash
cd websocket-server
npm install
npm run dev
```

---

## Environment Variables Reference

### Database Configuration

```env
# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=devhub
POSTGRES_USER=devhub_user
POSTGRES_PASSWORD=devhub_password
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}

# MongoDB
MONGODB_URI=mongodb://localhost:27017/devhub

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password
REDIS_URL=redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}
```

### Authentication

```env
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-characters
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

### OAuth (Optional)

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### AWS S3 (Optional)

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=devhub-files
```

### Email Service

```env
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@devhub.com
```

### Stripe (Optional)

```env
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
```

---

## Docker Setup

### Development Environment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### Production Environment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## Testing

### Run All Tests

```bash
npm test
```

### Backend Tests

```bash
npm run test:backend
```

### Frontend Tests

```bash
npm run test:frontend
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:coverage
```

---

## Database Management

### PostgreSQL Migrations

```bash
# Create migration
cd backend/api-gateway
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# View database
npx prisma studio
```

### MongoDB

MongoDB doesn't require migrations, but you can use MongoDB Compass for GUI management.

---

## Troubleshooting

### Port Already in Use

If ports are already in use, you can change them in `.env`:

```env
API_GATEWAY_PORT=4000
AUTH_SERVICE_PORT=4001
# ... etc
```

### Docker Connection Issues

```bash
# Reset Docker volumes
docker-compose down -v
docker-compose up -d
```

### Node Modules Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf */node_modules */package-lock.json
npm install
npm run install:all
```

### Database Connection Issues

1. Check if databases are running:
```bash
docker-compose ps
```

2. Check connection strings in `.env`

3. Restart databases:
```bash
docker-compose restart postgres mongodb redis
```

---

## Development Workflow

### 1. Create a New Feature

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Edit code in respective service directories.

### 3. Test Changes

```bash
npm test
npm run lint
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add your feature description"
```

### 5. Push Changes

```bash
git push origin feature/your-feature-name
```

---

## Production Deployment

### AWS Deployment

1. Build Docker images
2. Push to AWS ECR
3. Deploy to ECS/EKS
4. Configure load balancer
5. Set up RDS and ElastiCache

### Vercel (Frontend Only)

```bash
cd frontend
vercel deploy
```

---

## Performance Optimization

### Frontend

- Enable image optimization in `next.config.js`
- Use code splitting with dynamic imports
- Implement lazy loading for components
- Enable caching strategies

### Backend

- Enable Redis caching
- Optimize database queries
- Use connection pooling
- Implement rate limiting

---

## Monitoring

### Health Checks

- API Gateway: http://localhost:4000/health
- Auth Service: http://localhost:4001/health
- All services have `/health` endpoints

### Logging

Logs are stored in `logs/` directory for each service.

View logs:
```bash
tail -f backend/api-gateway/logs/combined.log
```

---

## Support

For issues and questions:
- Check documentation in `/docs`
- Review error logs in `/logs`
- Check GitHub issues (if repository is public)

---

## Next Steps

1. ✅ Complete environment setup
2. ✅ Start all services
3. 📝 Review [API Documentation](./API.md)
4. 🎨 Review [Frontend Guide](./FRONTEND.md)
5. 🔧 Review [Backend Guide](./BACKEND.md)
6. 🚀 Start building features!

---

**Happy Coding! 🎉**
