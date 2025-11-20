# Deployment Guide - Vercel

Это руководство поможет вам развернуть LMS платформу на Vercel.

## Предварительные требования

1. **GitHub аккаунт** и репозиторий проекта
2. **Vercel аккаунт** (бесплатный план доступен)
3. **PostgreSQL база данных** (рекомендуется Supabase, Neon, или Railway)

## Шаг 1: Подготовка базы данных

### Вариант A: Supabase (Рекомендуется)

1. Перейдите на [supabase.com](https://supabase.com) и создайте аккаунт
2. Создайте новый проект
3. В настройках проекта найдите **Database** → **Connection string**
4. Скопируйте **URI** (Connection string) - он понадобится на шаге 3

### Вариант B: Neon

1. Перейдите на [neon.tech](https://neon.tech) и создайте аккаунт
2. Создайте новый проект
3. Скопируйте **Connection string**

### Вариант C: Railway

1. Перейдите на [railway.app](https://railway.app) и создайте аккаунт
2. Создайте новый PostgreSQL проект
3. Скопируйте **DATABASE_URL** из переменных окружения

## Шаг 2: Подготовка репозитория

1. Убедитесь, что все изменения закоммичены:
```bash
git add .
git commit -m "Prepare for deployment"
```

2. Создайте репозиторий на GitHub (если еще не создан):
```bash
git remote add origin https://github.com/znn-cmd/lms-sandbox.git
git branch -M main
git push -u origin main
```

## Шаг 3: Деплой на Vercel

### Через веб-интерфейс Vercel

1. Перейдите на [vercel.com](https://vercel.com) и войдите через GitHub
2. Нажмите **"Add New Project"**
3. Импортируйте репозиторий `lms-sandbox`
4. Настройте проект:
   - **Framework Preset**: Next.js (определится автоматически)
   - **Root Directory**: `./` (по умолчанию)
   - **Build Command**: `npm run build` (по умолчанию)
   - **Output Directory**: `.next` (по умолчанию)
   - **Install Command**: `npm install` (по умолчанию)

5. **Добавьте переменные окружения**:
   - `DATABASE_URL` - строка подключения к PostgreSQL (из шага 1)
   - `NEXTAUTH_SECRET` - сгенерируйте случайную строку:
     ```bash
     openssl rand -base64 32
     ```
   - `NEXTAUTH_URL` - URL вашего приложения (будет автоматически установлен Vercel, но можно указать вручную)
   - `UPLOADTHING_SECRET` (опционально, если используете Uploadthing)
   - `UPLOADTHING_APP_ID` (опционально)

6. Нажмите **"Deploy"**

### Через Vercel CLI

1. Установите Vercel CLI:
```bash
npm i -g vercel
```

2. Войдите в Vercel:
```bash
vercel login
```

3. Деплой:
```bash
vercel
```

4. Добавьте переменные окружения:
```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```

## Шаг 4: Настройка базы данных

После деплоя нужно применить схему Prisma к базе данных:

### Вариант 1: Через Vercel CLI (рекомендуется)

1. Установите переменные окружения локально в `.env`:
```bash
DATABASE_URL=your-production-database-url
```

2. Примените схему:
```bash
npx prisma db push
```

3. Заполните демо-данными:
```bash
npm run db:seed
```

### Вариант 2: Через Prisma Studio (альтернатива)

1. Установите переменные окружения локально
2. Запустите Prisma Studio:
```bash
npx prisma studio
```
3. Вручную создайте необходимые записи

## Шаг 5: Обновление NEXTAUTH_URL

После первого деплоя Vercel предоставит URL вида `your-project.vercel.app`.

1. Обновите переменную окружения `NEXTAUTH_URL` в настройках Vercel:
   - Перейдите в **Settings** → **Environment Variables**
   - Обновите `NEXTAUTH_URL` на `https://your-project.vercel.app`

2. Передеплойте проект (или дождитесь автоматического деплоя)

## Шаг 6: Настройка Socket.io (опционально)

Socket.io требует дополнительной настройки для работы на Vercel. 

**Вариант 1: Использовать Vercel Serverless Functions**
- Socket.io будет работать через API routes
- Убедитесь, что все Socket.io endpoints находятся в `/app/api`

**Вариант 2: Использовать отдельный сервер для Socket.io**
- Разверните Socket.io сервер на отдельном хостинге (Railway, Render, etc.)
- Обновите клиентский код для подключения к внешнему серверу

## Проверка деплоя

1. Откройте URL вашего приложения
2. Войдите с демо-аккаунтом:
   - **Admin**: admin@demo.com / demo123
   - **HR**: hr@demo.com / demo123
   - **Mentor**: mentor@demo.com / demo123
   - **Candidate**: candidate@demo.com / demo123

## Обновление проекта

После каждого push в `main` ветку, Vercel автоматически передеплоит проект.

Для ручного деплоя:
```bash
vercel --prod
```

## Troubleshooting

### Ошибка подключения к базе данных

- Убедитесь, что `DATABASE_URL` правильно настроен
- Проверьте, что база данных доступна из интернета (не заблокирована файрволом)
- Для Supabase: используйте **Connection pooling** URL для production

### Ошибка Prisma Client

- Убедитесь, что `postinstall` скрипт выполняется: `prisma generate`
- Проверьте, что Prisma Client сгенерирован в `node_modules/.prisma/client`

### Ошибки NextAuth

- Проверьте, что `NEXTAUTH_SECRET` установлен и достаточно длинный
- Убедитесь, что `NEXTAUTH_URL` соответствует вашему домену

### Проблемы с Socket.io

- Socket.io может не работать в serverless окружении Vercel
- Рассмотрите использование альтернативных решений для real-time коммуникации

## Дополнительные ресурсы

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/configuration/options#nextauth_url)
