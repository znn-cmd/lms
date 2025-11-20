# Настройка деплоя на Vercel

## Шаг 1: Подготовка репозитория

Код уже подготовлен и готов к пушу в GitHub.

## Шаг 2: Создание Vercel Postgres

1. Зайдите на [Vercel Dashboard](https://vercel.com/dashboard)
2. Перейдите в раздел **Storage**
3. Нажмите **Create Database** → выберите **Postgres**
4. Выберите план (Hobby для демо бесплатный)
5. Создайте базу данных
6. Перейдите в **Settings** → **Connection String**
7. Скопируйте строку подключения (она будет выглядеть как `postgres://...`)

## Шаг 3: Подключение проекта к Vercel

1. Зайдите на [Vercel Dashboard](https://vercel.com/dashboard)
2. Нажмите **Add New Project**
3. Импортируйте репозиторий `znn-cmd/lms` из GitHub
4. В настройках проекта:
   - **Framework Preset**: Next.js (определится автоматически)
   - **Root Directory**: `./` (по умолчанию)
   - **Build Command**: оставьте по умолчанию (используется `vercel-build` из package.json)
   - **Output Directory**: `.next` (по умолчанию)

## Шаг 4: Настройка переменных окружения

В настройках проекта Vercel перейдите в **Environment Variables** и добавьте:

### Обязательные переменные:

1. **DATABASE_URL**
   - Значение: строка подключения к Vercel Postgres (из шага 2)
   - Environment: Production, Preview, Development

2. **JWT_SECRET**
   - Значение: любая случайная строка (например, сгенерируйте через `openssl rand -base64 32`)
   - Environment: Production, Preview, Development

### Пример:
```
DATABASE_URL=postgres://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-here
```

## Шаг 5: Обновление схемы Prisma для PostgreSQL

**Важно**: Перед деплоем нужно обновить схему Prisma для использования PostgreSQL.

### Вариант A: Автоматическое переключение (рекомендуется)

Создайте скрипт, который автоматически переключает схему:

```bash
# В package.json уже есть vercel-build команда, которая использует PostgreSQL
# Но нужно обновить schema.prisma для production
```

### Вариант B: Ручное переключение

1. Перед деплоем замените содержимое `prisma/schema.prisma` на содержимое `prisma/schema.postgres.prisma`
2. Или используйте переменную окружения для переключения

## Шаг 6: Деплой

1. После настройки всех переменных окружения нажмите **Deploy**
2. Vercel автоматически:
   - Установит зависимости
   - Сгенерирует Prisma Client
   - Выполнит миграции (`prisma migrate deploy`)
   - Соберет Next.js приложение

## Шаг 7: Заполнение базы данных (Seed)

После первого успешного деплоя нужно заполнить базу данных:

### Через Vercel CLI:

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите в аккаунт
vercel login

# Подключите проект
vercel link

# Запустите seed
vercel env pull .env.local
npx prisma migrate deploy
npm run db:seed
```

### Или через Vercel Dashboard:

1. Перейдите в проект → **Settings** → **Environment Variables**
2. Убедитесь, что `DATABASE_URL` установлен
3. Используйте Vercel CLI для выполнения seed команды

## Шаг 8: Проверка

После деплоя откройте ваш сайт и проверьте:
- Логин работает (user/user и hr/hr)
- Курсы отображаются
- Можно создать новый курс

## Локальная разработка

Для локальной разработки продолжайте использовать SQLite:

```bash
# .env.local
DATABASE_URL="file:./dev.db"
JWT_SECRET="local-secret-key"
```

## Troubleshooting

### Ошибка: "Prisma schema not found"
- Убедитесь, что `prisma/schema.prisma` использует `provider = "postgresql"` для production

### Ошибка: "Migration failed"
- Проверьте, что `DATABASE_URL` правильно настроен
- Убедитесь, что база данных создана и доступна

### Ошибка: "JWT secret not found"
- Добавьте `JWT_SECRET` в Environment Variables

## Полезные ссылки

- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js on Vercel](https://nextjs.org/docs/deployment)

