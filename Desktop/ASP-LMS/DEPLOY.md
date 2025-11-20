# Инструкция по деплою на Vercel

## ⚠️ Важно: SQLite не работает на Vercel

SQLite - это файловая база данных, которая не работает на serverless функциях Vercel. Для деплоя нужно использовать PostgreSQL.

## Вариант 1: Vercel Postgres (Рекомендуется)

### Шаг 1: Создайте Vercel Postgres

1. Зайдите на [Vercel Dashboard](https://vercel.com/dashboard)
2. Перейдите в раздел Storage
3. Создайте новую базу данных Postgres
4. Скопируйте строку подключения (Connection String)

### Шаг 2: Обновите схему Prisma

Измените `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Шаг 3: Настройте переменные окружения в Vercel

1. В настройках проекта Vercel перейдите в Environment Variables
2. Добавьте:
   - `DATABASE_URL` - строка подключения к Vercel Postgres
   - `JWT_SECRET` - секретный ключ для JWT (любая случайная строка)

### Шаг 4: Обновите build команду

Vercel автоматически выполнит миграции при деплое, если добавить в `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "vercel-build": "prisma migrate deploy && next build"
  }
}
```

### Шаг 5: Запустите seed после первого деплоя

После первого деплоя нужно выполнить seed вручную через Vercel CLI или добавить в build команду.

## Вариант 2: Внешний PostgreSQL (Supabase, Neon, etc.)

1. Создайте базу данных на любом провайдере PostgreSQL
2. Получите строку подключения
3. Добавьте `DATABASE_URL` в переменные окружения Vercel
4. Обновите схему Prisma как в Варианте 1

## Быстрый старт

1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения
3. Деплой произойдет автоматически

## Локальная разработка

Для локальной разработки можно продолжать использовать SQLite:

```bash
# Локально используйте SQLite
DATABASE_URL="file:./dev.db" npm run dev
```

Или создайте `.env.local`:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-local-secret"
```

