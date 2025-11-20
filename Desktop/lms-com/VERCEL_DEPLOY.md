# Quick Vercel Deployment Guide

## Быстрый деплой на Vercel

### 1. Подготовка базы данных

**Рекомендуется Supabase (бесплатный план):**

1. Создайте аккаунт на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. В **Settings** → **Database** найдите **Connection string**
4. Скопируйте **URI** (Connection string) - понадобится для Vercel

### 2. Деплой на Vercel

1. **Импортируйте репозиторий в Vercel:**
   - Перейдите на [vercel.com](https://vercel.com)
   - Нажмите **"Add New Project"**
   - Импортируйте `https://github.com/znn-cmd/lms-sandbox.git`

2. **Настройте переменные окружения:**
   ```
   DATABASE_URL=postgresql://... (из Supabase)
   NEXTAUTH_SECRET=<сгенерируйте: openssl rand -base64 32>
   NEXTAUTH_URL=https://your-project.vercel.app (обновите после деплоя)
   ```

3. **Деплой:**
   - Нажмите **"Deploy"**
   - Дождитесь завершения

### 3. Настройка базы данных

После деплоя примените схему Prisma:

```bash
# Локально, с production DATABASE_URL в .env
npx prisma db push
npm run db:seed
```

### 4. Готово!

Откройте URL вашего проекта и войдите:
- **Admin**: admin@demo.com / demo123
- **HR**: hr@demo.com / demo123
- **Candidate**: candidate@demo.com / demo123

---

**Подробная инструкция:** см. `DEPLOYMENT.md`

