# 🚀 DevHub - Quick Start Guide

## ⚡ Setup in 5 Minutes

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values
# Minimum required:
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - DATABASE_URL (PostgreSQL connection string)
```

### Step 3: Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📦 What's Included

### ✅ Frontend (Next.js 14)
- **App Router** with layouts
- **TypeScript** strict mode
- **Tailwind CSS** + Shadcn UI components
- **React Query** for data fetching
- **Zustand** for state management
- **NextAuth.js** for authentication
- **Dark mode** support

### 🎨 UI Components (Shadcn)
- Buttons, Cards, Forms
- Modals, Dropdowns, Toasts
- Tables, Tabs, Progress bars
- All accessible (ARIA compliant)

### 🔐 Authentication Ready
- Email/Password login
- OAuth (Google, GitHub) - just add credentials
- JWT tokens with refresh
- Protected routes
- Session management

### 📁 Project Structure
```
frontend/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (dashboard)/       # Dashboard pages
│   ├── courses/           # Course pages
│   ├── editor/            # Code editor
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── course/           # Course components
│   ├── editor/           # Editor components
│   └── layout/           # Layout components
├── lib/                   # Utilities
│   ├── api.ts            # API client
│   └── utils.ts          # Helper functions
├── hooks/                 # Custom hooks
├── store/                 # Zustand stores
├── types/                 # TypeScript types
└── public/               # Static assets
```

---

## 🎯 Next Steps

### 1. Add Features (Choose What You Need)

#### A. Courses Module
```bash
# Create course pages
app/courses/page.tsx          # Course list
app/courses/[id]/page.tsx     # Course detail
app/courses/[id]/learn/page.tsx  # Course player
```

#### B. Code Editor
```bash
# Monaco Editor integration
npm install @monaco-editor/react

# Create editor page
app/editor/page.tsx
```

#### C. User Dashboard
```bash
# Dashboard pages
app/(dashboard)/dashboard/page.tsx
app/(dashboard)/profile/page.tsx
app/(dashboard)/my-courses/page.tsx
```

### 2. Backend Setup (Optional)

#### Option A: Use Next.js API Routes (Simpler)
```typescript
// app/api/courses/route.ts
export async function GET() {
  // Your logic here
  return Response.json({ courses: [] })
}
```

#### Option B: Separate Express Backend (Scalable)
```bash
cd backend
npm init -y
npm install express prisma @prisma/client
npx prisma init
```

### 3. Database Setup

#### Using PostgreSQL:
```bash
# Install Prisma
npm install -D prisma
npm install @prisma/client

# Initialize Prisma
npx prisma init

# Create schema in prisma/schema.prisma
# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

#### Example Schema:
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  courses   Enrollment[]
  createdAt DateTime @default(now())
}

model Course {
  id          String   @id @default(cuid())
  title       String
  description String
  price       Float
  enrollments Enrollment[]
}

model Enrollment {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  course    Course   @relation(fields: [courseId], references: [id])
  courseId  String
  enrolledAt DateTime @default(now())
}
```

---

## 🎨 Using Shadcn UI Components

### Install a Component:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
```

### Use in Your Code:
```typescript
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function MyPage() {
  return (
    <Card>
      <Button>Click Me</Button>
    </Card>
  )
}
```

---

## 🔐 Authentication Setup

### 1. Configure NextAuth:
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Your auth logic
        return { id: '1', email: credentials?.email }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id
      return session
    }
  }
})

export { handler as GET, handler as POST }
```

### 2. Protect Routes:
```typescript
// middleware.ts
export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/dashboard/:path*', '/courses/:path*/learn']
}
```

---

## 📊 API Integration

### Using React Query:
```typescript
'use client'
import { useQuery } from '@tanstack/react-query'

export function CourseList() {
  const { data, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await fetch('/api/courses')
      return res.json()
    }
  })

  if (isLoading) return <div>Loading...</div>
  
  return (
    <div>
      {data?.map(course => (
        <div key={course.id}>{course.title}</div>
      ))}
    </div>
  )
}
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended):
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Environment Variables on Vercel:
1. Go to Project Settings
2. Add Environment Variables:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `DATABASE_URL`
   - OAuth credentials (if using)

---

## 📚 Helpful Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Shadcn UI**: https://ui.shadcn.com
- **React Query**: https://tanstack.com/query/latest
- **Prisma**: https://www.prisma.io/docs
- **NextAuth**: https://next-auth.js.org

---

## 🆘 Common Issues

### Issue: Module not found
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Issue: TypeScript errors
```bash
# Regenerate types
npm run type-check
```

### Issue: Prisma Client out of sync
```bash
npx prisma generate
```

---

## 🎯 Recommended Development Flow

1. **Start with UI**: Build pages and components
2. **Add Data Fetching**: Use React Query
3. **Add Authentication**: Setup NextAuth
4. **Connect Database**: Setup Prisma
5. **Deploy**: Push to Vercel

---

**You're all set! Start building! 🚀**

Questions? Check the full README.md for detailed documentation.
