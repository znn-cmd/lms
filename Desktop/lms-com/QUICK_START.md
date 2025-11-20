# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database

Create a `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/lms_com?schema=public"
NEXTAUTH_SECRET="your-random-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Initialize Database
```bash
# Generate Prisma client
npm run db:generate

# Create database tables
npm run db:push

# Add demo data
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

## 🔑 Demo Accounts

After seeding, login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | demo123 |
| HR | hr@demo.com | demo123 |
| Mentor | mentor@demo.com | demo123 |
| Candidate | candidate@demo.com | demo123 |

## 📱 Key Features to Test

### As Candidate:
1. Login → Dashboard shows progress
2. Go to "My Courses" → View assigned courses
3. Click a course → Browse modules and lessons
4. Start a lesson → Complete it
5. Go to "Tests" → Take a test
6. Check "Offers" → View job offers

### As HR:
1. Login → Dashboard shows statistics
2. Go to "Vacancies" → View job openings
3. Go to "Candidates" → Browse candidates
4. Go to "Analytics" → View charts and metrics

## 🎯 Registration Flow

1. Get registration link from HR (format: `/register/{vacancyId}/{source}`)
2. Candidate visits link
3. Completes registration form
4. Automatically assigned to vacancy and start course
5. Can login and begin learning

## 📊 What's Working

✅ User authentication
✅ Candidate registration
✅ Course viewing and progress
✅ Lesson completion
✅ Test taking (single/multiple choice)
✅ Test scoring
✅ Offer viewing and response
✅ HR dashboard
✅ Analytics with charts
✅ Candidate management

## 🔨 Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Sync database schema
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed demo data
```

## 📁 Project Structure

```
app/
├── api/              # API routes
├── candidate/        # Candidate pages
├── hr/              # HR/Admin pages
├── auth/            # Authentication
└── register/        # Registration

components/
├── layout/          # Layout components
└── ui/              # Reusable UI components

lib/
├── auth.ts          # Auth configuration
├── prisma.ts        # Database client
└── utils.ts         # Utilities

prisma/
├── schema.prisma    # Database schema
└── seed.ts          # Seed script
```

## 🐛 Troubleshooting

**Database connection error:**
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Verify credentials

**Prisma errors:**
- Run `npm run db:generate`
- Run `npm run db:push`

**Build errors:**
- Delete `.next` folder
- Run `npm install` again

## 📚 Next Steps

See `IMPLEMENTATION_STATUS.md` for what's implemented and what's next.

For detailed setup, see `SETUP.md`.

