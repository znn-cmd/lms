# LMS Platform - Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or remote)
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/lms_com?schema=public"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

Replace the database credentials with your PostgreSQL connection string.

### 3. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with demo data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Demo Accounts

After running the seed script, you can login with:

- **Admin**: admin@demo.com / demo123
- **HR**: hr@demo.com / demo123
- **Mentor**: mentor@demo.com / demo123
- **Candidate**: candidate@demo.com / demo123

## Project Structure

```
lms-com/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── candidate/         # Candidate dashboard
│   ├── hr/                # HR/Admin dashboard
│   ├── mentor/            # Mentor dashboard
│   └── register/          # Registration pages
├── components/            # React components
│   ├── layout/            # Layout components
│   └── ui/                # UI components (Shadcn)
├── lib/                   # Utilities and configs
├── prisma/                # Database schema and seeds
└── public/                # Static files
```

## Key Features Implemented

✅ User authentication with NextAuth
✅ Candidate registration with profile
✅ Course management and learning
✅ Test system with multiple question types
✅ HR dashboard with analytics
✅ Vacancy management
✅ Registration source tracking
✅ Progress tracking
✅ Basic analytics with charts

## Next Steps for Production

1. Set up proper environment variables
2. Configure email service for notifications
3. Set up file upload service (Uploadthing/S3)
4. Configure Socket.io for real-time chat
5. Add PWA configuration
6. Set up i18n with next-intl
7. Add comprehensive error handling
8. Set up monitoring and logging
9. Configure CI/CD pipeline
10. Add comprehensive tests

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file
- Verify database credentials

### Prisma Issues

- Run `npm run db:generate` after schema changes
- Run `npm run db:push` to sync schema

### Build Issues

- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

