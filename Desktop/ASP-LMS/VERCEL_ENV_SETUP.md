# Настройка переменных окружения в Vercel

## Проблема
Ошибка: `Environment variable not found: DATABASE_URL`

## Решение

### Вариант 1: Через Vercel Dashboard (Рекомендуется)

1. Зайдите на [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите проект `lms`
3. Перейдите в **Settings** → **Environment Variables**
4. Добавьте следующие переменные:

#### 1. DATABASE_URL
- **Key:** `DATABASE_URL`
- **Value:** строка подключения к Vercel Postgres (см. ниже как получить)
- **Environment:** выберите все (Production, Preview, Development)

#### 2. JWT_SECRET
- **Key:** `JWT_SECRET`
- **Value:** любой случайный секретный ключ (например, сгенерируйте через `openssl rand -base64 32`)
- **Environment:** выберите все (Production, Preview, Development)

### Вариант 2: Через Vercel CLI

```bash
# Установите Vercel CLI (если еще не установлен)
npm i -g vercel

# Войдите в аккаунт
vercel login

# Подключите проект (если еще не подключен)
cd C:\Users\zaice\Desktop\ASP-LMS
vercel link

# Добавьте переменные окружения
vercel env add DATABASE_URL
# Введите значение при запросе

vercel env add JWT_SECRET
# Введите значение при запросе
```

## Как получить DATABASE_URL

### Шаг 1: Создайте Vercel Postgres

1. Зайдите на [Vercel Dashboard](https://vercel.com/dashboard)
2. Перейдите в **Storage**
3. Нажмите **Create Database**
4. Выберите **Postgres**
5. Выберите план (Hobby для демо бесплатный)
6. Создайте базу данных

### Шаг 2: Получите Connection String

1. В списке баз данных найдите созданную базу
2. Нажмите на неё
3. Перейдите в **Settings** → **Connection String**
4. Скопируйте строку подключения (она будет выглядеть как `postgres://...`)

### Шаг 3: Добавьте в Environment Variables

1. В проекте `lms` → **Settings** → **Environment Variables**
2. Добавьте `DATABASE_URL` со скопированным значением

## Генерация JWT_SECRET

### Через PowerShell:
```powershell
# Генерация случайного ключа
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Или используйте онлайн генератор:
- https://generate-secret.vercel.app/32
- Или любой другой генератор случайных строк

## После настройки переменных

1. Перейдите в **Deployments**
2. Найдите последний деплой
3. Нажмите **"..."** → **Redeploy**
4. Снимите галочку **"Use existing Build Cache"**
5. Нажмите **Redeploy**

## Проверка

После успешного деплоя:
- Приложение должно быть доступно по адресу Preview
- База данных будет создана автоматически через миграции
- После первого деплоя нужно выполнить seed для заполнения данных

## Выполнение seed после деплоя

После успешного деплоя выполните:

```bash
# Получите переменные окружения локально
vercel env pull .env.local

# Выполните миграции (если еще не выполнены)
npx prisma migrate deploy

# Заполните базу данных
npm run db:seed
```

Или используйте Vercel CLI для выполнения команды на сервере (если поддерживается).

