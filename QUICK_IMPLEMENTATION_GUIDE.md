# 🚀 QUICK IMPLEMENTATION GUIDE - CRITICAL FEATURES
## Step-by-step guide to implement missing critical features

---

## 1️⃣ **2FA/MFA Implementation (3 days)**

### **Day 1: Backend Setup**

#### Step 1.1: Install Dependencies
```bash
cd backend/auth-service
npm install speakeasy qrcode crypto
npm install --save-dev @types/qrcode
```

#### Step 1.2: Update User Model
```typescript
// backend/auth-service/src/models/User.ts (or update Prisma schema)

interface User {
  // ... existing fields
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;  // encrypted
  backupCodes?: string[];     // hashed
  twoFactorVerified: boolean;
}
```

#### Step 1.3: Create 2FA Service
```typescript
// backend/auth-service/src/services/twoFactor.service.ts

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

export class TwoFactorService {
  // Generate secret
  async generateSecret(email: string) {
    const secret = speakeasy.generateSecret({
      name: `DevHub (${email})`,
      issuer: 'DevHub'
    });
    
    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url
    };
  }

  // Generate QR code
  async generateQRCode(otpauthUrl: string): Promise<string> {
    return await QRCode.toDataURL(otpauthUrl);
  }

  // Verify TOTP
  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2  // Allow 2 time steps before/after
    });
  }

  // Generate backup codes
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // Hash backup codes
  async hashBackupCodes(codes: string[]): Promise<string[]> {
    const bcrypt = require('bcrypt');
    return Promise.all(
      codes.map(code => bcrypt.hash(code, 10))
    );
  }

  // Verify backup code
  async verifyBackupCode(
    hashedCodes: string[],
    providedCode: string
  ): Promise<boolean> {
    const bcrypt = require('bcrypt');
    for (const hashedCode of hashedCodes) {
      if (await bcrypt.compare(providedCode, hashedCode)) {
        return true;
      }
    }
    return false;
  }
}
```

#### Step 1.4: Create 2FA Controller
```typescript
// backend/auth-service/src/controllers/twoFactor.controller.ts

import { Request, Response } from 'express';
import { TwoFactorService } from '../services/twoFactor.service';

const twoFactorService = new TwoFactorService();

export class TwoFactorController {
  // Setup 2FA - Generate secret & QR
  async setup(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const email = req.user.email;

      // Generate secret
      const { secret, otpauthUrl } = await twoFactorService.generateSecret(email);
      
      // Generate QR code
      const qrCode = await twoFactorService.generateQRCode(otpauthUrl);

      // Save secret (encrypted) to database
      await User.update(userId, {
        twoFactorSecret: encrypt(secret),
        twoFactorEnabled: false,  // Not enabled until verified
        twoFactorVerified: false
      });

      res.json({
        secret,
        qrCode,
        message: 'Scan QR code with authenticator app'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Verify and enable 2FA
  async enable(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { token } = req.body;

      // Get user's secret
      const user = await User.findById(userId);
      const secret = decrypt(user.twoFactorSecret);

      // Verify token
      const isValid = twoFactorService.verifyToken(secret, token);
      
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid token' });
      }

      // Generate backup codes
      const backupCodes = twoFactorService.generateBackupCodes();
      const hashedCodes = await twoFactorService.hashBackupCodes(backupCodes);

      // Enable 2FA
      await User.update(userId, {
        twoFactorEnabled: true,
        twoFactorVerified: true,
        backupCodes: hashedCodes
      });

      res.json({
        message: '2FA enabled successfully',
        backupCodes  // Show once, user must save
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Verify 2FA during login
  async verify(req: Request, res: Response) {
    try {
      const { userId, token } = req.body;

      const user = await User.findById(userId);
      
      if (!user.twoFactorEnabled) {
        return res.status(400).json({ error: '2FA not enabled' });
      }

      const secret = decrypt(user.twoFactorSecret);
      const isValid = twoFactorService.verifyToken(secret, token);

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid 2FA token' });
      }

      res.json({ message: '2FA verified', success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Disable 2FA
  async disable(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { password, token } = req.body;

      // Verify password
      const user = await User.findById(userId);
      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      // Verify 2FA token
      const secret = decrypt(user.twoFactorSecret);
      const isValid = twoFactorService.verifyToken(secret, token);

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid 2FA token' });
      }

      // Disable 2FA
      await User.update(userId, {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: null,
        twoFactorVerified: false
      });

      res.json({ message: '2FA disabled successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get backup codes
  async getBackupCodes(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { password } = req.body;

      // Verify password
      const user = await User.findById(userId);
      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      // Generate new backup codes
      const backupCodes = twoFactorService.generateBackupCodes();
      const hashedCodes = await twoFactorService.hashBackupCodes(backupCodes);

      // Update in database
      await User.update(userId, { backupCodes: hashedCodes });

      res.json({ backupCodes });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

#### Step 1.5: Add Routes
```typescript
// backend/auth-service/src/routes/twoFactor.routes.ts

import { Router } from 'express';
import { TwoFactorController } from '../controllers/twoFactor.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const controller = new TwoFactorController();

// Protected routes (require authentication)
router.post('/2fa/setup', authenticateToken, controller.setup);
router.post('/2fa/enable', authenticateToken, controller.enable);
router.post('/2fa/disable', authenticateToken, controller.disable);
router.post('/2fa/backup-codes', authenticateToken, controller.getBackupCodes);

// Public route (during login)
router.post('/2fa/verify', controller.verify);

export default router;
```

### **Day 2: Update Login Flow**

```typescript
// backend/auth-service/src/controllers/auth.controller.ts

async login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Send temporary token (short-lived, 5 minutes)
      const tempToken = jwt.sign(
        { userId: user.id, purpose: '2fa' },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );

      return res.json({
        requires2FA: true,
        tempToken,
        message: 'Enter 2FA code'
      });
    }

    // No 2FA - generate regular tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({ accessToken, refreshToken, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// New endpoint: Complete login with 2FA
async loginWith2FA(req: Request, res: Response) {
  try {
    const { tempToken, token } = req.body;

    // Verify temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (decoded.purpose !== '2fa') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await User.findById(decoded.userId);

    // Verify 2FA token
    const secret = decrypt(user.twoFactorSecret);
    const isValid = twoFactorService.verifyToken(secret, token);

    if (!isValid) {
      // Try backup code
      const isBackupValid = await twoFactorService.verifyBackupCode(
        user.backupCodes,
        token
      );

      if (!isBackupValid) {
        return res.status(401).json({ error: 'Invalid 2FA code' });
      }

      // Remove used backup code
      // TODO: Remove the used backup code from database
    }

    // Generate regular tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({ accessToken, refreshToken, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### **Day 3: Frontend Implementation**

```typescript
// frontend/app/settings/security/2fa/page.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

export default function TwoFactorAuth() {
  const [step, setStep] = useState<'disabled' | 'setup' | 'verify'>('disabled');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleSetup = async () => {
    const res = await fetch('/api/auth/2fa/setup', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    
    setQrCode(data.qrCode);
    setSecret(data.secret);
    setStep('setup');
  };

  const handleEnable = async () => {
    const res = await fetch('/api/auth/2fa/enable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ token })
    });

    const data = await res.json();
    
    if (res.ok) {
      setBackupCodes(data.backupCodes);
      setStep('verify');
      alert('2FA enabled! Save your backup codes.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Two-Factor Authentication</h1>

      {step === 'disabled' && (
        <div>
          <p className="mb-4">
            Add an extra layer of security to your account by enabling 2FA.
          </p>
          <Button onClick={handleSetup}>Enable 2FA</Button>
        </div>
      )}

      {step === 'setup' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Scan QR Code</h2>
          <p className="mb-4">
            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </p>
          
          {qrCode && (
            <Image src={qrCode} alt="2FA QR Code" width={256} height={256} />
          )}

          <p className="my-4">Or enter this code manually:</p>
          <code className="block bg-gray-100 p-2 rounded mb-4">{secret}</code>

          <Input
            placeholder="Enter 6-digit code"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            maxLength={6}
            className="mb-4"
          />

          <Button onClick={handleEnable}>Verify & Enable</Button>
        </div>
      )}

      {step === 'verify' && backupCodes.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Save Backup Codes</h2>
          <p className="mb-4">
            Save these backup codes in a safe place. You can use them to access 
            your account if you lose your authenticator device.
          </p>

          <div className="bg-gray-100 p-4 rounded mb-4">
            {backupCodes.map((code, idx) => (
              <div key={idx} className="font-mono">{code}</div>
            ))}
          </div>

          <Button onClick={() => {
            navigator.clipboard.writeText(backupCodes.join('\n'));
            alert('Backup codes copied!');
          }}>
            Copy Codes
          </Button>
        </div>
      )}
    </div>
  );
}
```

---

## 2️⃣ **CI/CD Pipeline Implementation (3-5 days)**

### **Day 1-2: GitHub Actions Setup**

#### Create CI Workflow
```yaml
# .github/workflows/ci.yml

name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run Prettier check
        run: npm run format:check

  test-backend:
    name: Test Backend
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: devhub_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017
      
      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      
      - name: Run migrations
        run: |
          cd backend
          npm run migrate:test
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/devhub_test
      
      - name: Run tests
        run: |
          cd backend
          npm test
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/devhub_test
          MONGODB_URI: mongodb://localhost:27017/devhub_test
          REDIS_URL: redis://localhost:6379
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info
          flags: backend

  test-frontend:
    name: Test Frontend
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Run tests
        run: |
          cd frontend
          npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/lcov.info
          flags: frontend

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Start services
        run: docker-compose -f docker-compose.test.yml up -d
      
      - name: Wait for services
        run: npm run wait-for-services
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: true
      
      - name: Run Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          command: test
        continue-on-error: true

  build:
    name: Build Docker Images
    runs-on: ubuntu-latest
    needs: [lint, test-backend, test-frontend]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push images
        run: |
          docker build -t devhub/api-gateway:${{ github.sha }} ./backend/api-gateway
          docker push devhub/api-gateway:${{ github.sha }}
          
          docker build -t devhub/auth-service:${{ github.sha }} ./backend/auth-service
          docker push devhub/auth-service:${{ github.sha }}
          
          # ... repeat for all services
```

#### Create Deploy Workflow
```yaml
# .github/workflows/deploy-production.yml

name: Deploy to Production

on:
  push:
    branches: [ main ]
    tags:
      - 'v*'

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push images
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/devhub-api-gateway:$IMAGE_TAG ./backend/api-gateway
          docker push $ECR_REGISTRY/devhub-api-gateway:$IMAGE_TAG
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster devhub-production --service api-gateway --force-new-deployment
      
      - name: Run health checks
        run: |
          chmod +x ./scripts/health-check.sh
          ./scripts/health-check.sh
      
      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Deployment to production ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 3️⃣ **Monitoring Setup (1 week)**

### **Prometheus + Grafana**

#### docker-compose.monitoring.yml
```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - grafana-data:/var/lib/grafana

  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"

volumes:
  prometheus-data:
  grafana-data:
```

#### Prometheus Config
```yaml
# monitoring/prometheus/prometheus.yml

global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['api-gateway:3000']
  
  - job_name: 'auth-service'
    static_configs:
      - targets: ['auth-service:3001']
  
  # ... all services
  
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

#### Add Metrics to Services
```typescript
// backend/shared/middleware/metrics.ts

import promClient from 'prom-client';
import { Request, Response, NextFunction } from 'express';

// Create metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Middleware
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;

    httpRequestDuration.observe(
      { method: req.method, route, status_code: res.statusCode },
      duration
    );

    httpRequestTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode
    });
  });

  next();
}

// Metrics endpoint
export function metricsEndpoint(req: Request, res: Response) {
  res.set('Content-Type', promClient.register.contentType);
  res.end(promClient.register.metrics());
}
```

---

## 📝 **SUMMARY CHECKLIST**

### **Week 1:**
- [ ] Install 2FA dependencies
- [ ] Create 2FA service & controller
- [ ] Update user model
- [ ] Implement setup endpoint
- [ ] Implement verification endpoint
- [ ] Test 2FA flow
- [ ] Create frontend UI

### **Week 2:**
- [ ] Setup GitHub Actions
- [ ] Create CI workflow
- [ ] Add test jobs
- [ ] Add security scanning
- [ ] Create deploy workflow
- [ ] Test CI/CD pipeline

### **Week 3:**
- [ ] Setup Prometheus
- [ ] Setup Grafana
- [ ] Add metrics middleware
- [ ] Create dashboards
- [ ] Setup alerts
- [ ] Test monitoring

---

**Follow this guide step-by-step, and you'll have production-ready features in 3 weeks!** 🚀
