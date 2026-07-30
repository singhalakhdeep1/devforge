# ⚡ Quick Reference Guide

## 🚀 Instant Commands

### Development
```bash
# Start everything
npm run dev

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Start WebSocket server
npm run dev:ws

# Start databases
npm run docker:dev
```

### Installation
```bash
# Install all dependencies
npm run install:all

# Install root dependencies
npm install
```

### Database
```bash
# Run migrations
npm run migrate

# View database (Prisma Studio)
cd backend/api-gateway && npx prisma studio
```

### Testing
```bash
# All tests
npm test

# Backend tests
npm run test:backend

# Frontend tests
npm run test:frontend

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Docker
```bash
# Start databases
docker-compose up -d postgres mongodb redis

# Stop all
docker-compose down

# View logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build
```

---

## 🔑 Environment Variables (Quick Setup)

Create `.env` file:

```env
NODE_ENV=development
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
DATABASE_URL=postgresql://devhub_user:devhub_password@localhost:5432/devhub
MONGODB_URI=mongodb://localhost:27017/devhub
REDIS_URL=redis://localhost:6379
```

---

## 📡 API Endpoints (Quick Reference)

### Auth
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Users
- `GET /api/v1/users/me` - Current user
- `GET /api/v1/users/:id` - User by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user (admin)

### Projects
- `GET /api/v1/projects` - List projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/:id` - Get project
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project (admin)

### Health
- `GET /health` - Health check
- `GET /health/ready` - Readiness
- `GET /health/live` - Liveness

---

## 🌐 Service Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| API Gateway | 4000 | http://localhost:4000 |
| Auth Service | 4001 | http://localhost:4001 |
| Notification | 4002 | http://localhost:4002 |
| Email Service | 4003 | http://localhost:4003 |
| File Service | 4004 | http://localhost:4004 |
| Analytics | 4005 | http://localhost:4005 |
| WebSocket | 4006 | http://localhost:4006 |
| PostgreSQL | 5432 | localhost:5432 |
| MongoDB | 27017 | localhost:27017 |
| Redis | 6379 | localhost:6379 |

---

## 📁 Key Files & Locations

### Backend
```
backend/api-gateway/src/index.ts          # Main server
backend/api-gateway/src/routes/           # API routes
backend/api-gateway/src/middleware/       # Middleware
backend/auth-service/src/services/        # Auth logic
backend/shared/src/types.ts               # Shared types
```

### Frontend
```
frontend/app/page.tsx                     # Home page
frontend/app/layout.tsx                   # Root layout
frontend/app/dashboard/page.tsx           # Dashboard
frontend/lib/api.ts                       # API client
frontend/store/authStore.ts               # Auth state
frontend/hooks/useWebSocket.ts            # WebSocket hook
```

### Configuration
```
.env                                      # Environment variables
package.json                              # Root package
docker-compose.yml                        # Docker config
```

---

## 🔧 Common Tasks

### Add New API Route
1. Create route file in `backend/api-gateway/src/routes/`
2. Import in `backend/api-gateway/src/index.ts`
3. Add to router: `app.use('/api/v1/resource', resourceRoutes)`

### Add New Frontend Page
1. Create `frontend/app/pagename/page.tsx`
2. Add navigation link in layout or other pages

### Add New Microservice
1. Create folder: `backend/new-service/`
2. Copy structure from existing service
3. Add to docker-compose.yml
4. Add to root package.json workspaces

---

## 🐛 Troubleshooting

### Port in use
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Unix
lsof -i :4000
kill -9 <PID>
```

### Database connection failed
```bash
# Restart databases
docker-compose restart postgres mongodb redis

# Check if running
docker-compose ps
```

### Module not found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
rm -rf */node_modules */package-lock.json
npm install
npm run install:all
```

### TypeScript errors
```bash
# Rebuild shared module
cd backend/shared
npm run build
```

---

## 📝 Code Snippets

### Frontend - API Call
```typescript
import apiClient from '@/lib/api';

const response = await apiClient.get('/api/v1/projects');
const projects = response.data.data;
```

### Frontend - Auth Check
```typescript
import { useAuthStore } from '@/store/authStore';

const { user, isAuthenticated } = useAuthStore();
if (!isAuthenticated) {
  // Redirect to login
}
```

### Backend - Protected Route
```typescript
import { authenticate, authorize } from '../middleware/auth';

router.get('/admin', authenticate, authorize('ADMIN'), handler);
```

### Backend - Error Handling
```typescript
import { AppError } from '@devhub/shared';

throw new AppError(404, 'Resource not found');
```

---

## 🧪 Testing Examples

### Unit Test
```typescript
describe('AuthService', () => {
  it('should hash password', async () => {
    const service = new AuthService();
    const hashed = await service.hashPassword('password');
    expect(hashed).toBeDefined();
  });
});
```

### API Test
```typescript
import request from 'supertest';
import app from '../src/index';

it('GET /health', async () => {
  const response = await request(app).get('/health');
  expect(response.status).toBe(200);
});
```

---

## 📚 Documentation Links

- [Complete Setup](./SETUP.md)
- [Architecture](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Project Summary](../PROJECT_SUMMARY.md)

---

## 🎯 Next Steps Checklist

- [ ] Clone/navigate to project
- [ ] Install dependencies (`npm run install:all`)
- [ ] Create `.env` file
- [ ] Start databases (`npm run docker:dev`)
- [ ] Start services (`npm run dev`)
- [ ] Open http://localhost:3000
- [ ] Read [SETUP.md](./SETUP.md)
- [ ] Start building! 🚀

---

**Keep this file bookmarked for quick reference!** 🔖
