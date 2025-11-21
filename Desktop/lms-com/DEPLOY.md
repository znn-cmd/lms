# Инструкция по развертыванию на Vercel

## Предварительные требования

1. Аккаунт на [Vercel](https://vercel.com)
2. База данных PostgreSQL (рекомендуется [Supabase](https://supabase.com), [Neon](https://neon.tech) или [Railway](https://railway.app))
3. GitHub репозиторий с вашим кодом

## Шаг 1: Подготовка базы данных

1. Создайте базу данных PostgreSQL на одном из сервисов:
   - **Supabase**: https://supabase.com
   - **Neon**: https://neon.tech
   - **Railway**: https://railway.app

2. Скопируйте connection string (DATABASE_URL) из вашей базы данных

## Шаг 2: Подготовка проекта

1. Убедитесь, что все изменения закоммичены в Git:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   ```

2. Запушьте код в GitHub:
   ```bash
   git push origin main
   ```

## Шаг 3: Деплой на Vercel

### Вариант 1: Через веб-интерфейс Vercel

1. Перейдите на https://vercel.com и войдите в аккаунт
2. Нажмите "Add New Project"
3. Импортируйте ваш GitHub репозиторий
4. Настройте проект:
   - **Framework Preset**: Next.js (определится автоматически)
   - **Root Directory**: `./` (оставьте по умолчанию)
   - **Build Command**: `prisma generate && npm run build` (уже настроено в vercel.json)
   - **Output Directory**: `.next` (оставьте по умолчанию)
   - **Install Command**: `npm install` (оставьте по умолчанию)

5. Добавьте переменные окружения (Environment Variables):
   - `DATABASE_URL` - строка подключения к PostgreSQL
   - `NEXTAUTH_SECRET` - сгенерируйте через: `openssl rand -base64 32`
   - `NEXTAUTH_URL` - URL вашего приложения на Vercel (например: `https://your-app.vercel.app`)
   - `UPLOADTHING_SECRET` (опционально, если используете)
   - `UPLOADTHING_APP_ID` (опционально, если используете)

6. Нажмите "Deploy"

### Вариант 2: Через Vercel CLI

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

После деплоя нужно применить миграции Prisma:

1. Подключитесь к вашей базе данных через Prisma Studio или напрямую
2. Выполните миграции:
   ```bash
   npx prisma db push
   ```
   Или если у вас есть миграции:
   ```bash
   npx prisma migrate deploy
   ```

3. (Опционально) Заполните базу тестовыми данными:
   ```bash
   npm run db:seed
   ```

## Шаг 5: Проверка деплоя

1. После успешного деплоя Vercel предоставит вам URL приложения
2. Откройте приложение в браузере
3. Проверьте, что все работает корректно

## Переменные окружения

### Обязательные:
- `DATABASE_URL` - строка подключения к PostgreSQL
- `NEXTAUTH_SECRET` - секретный ключ для NextAuth (сгенерируйте: `openssl rand -base64 32`)
- `NEXTAUTH_URL` - URL вашего приложения (например: `https://your-app.vercel.app`)

### Опциональные:
- `UPLOADTHING_SECRET` - для загрузки файлов
- `UPLOADTHING_APP_ID` - для загрузки файлов
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` - для отправки email

## Проблемы и решения

### Ошибка "Prisma Client not generated"
- Убедитесь, что в `package.json` есть скрипт `postinstall: "prisma generate"`
- Проверьте, что `buildCommand` в `vercel.json` включает `prisma generate`

### Ошибка подключения к базе данных
- Проверьте, что `DATABASE_URL` правильно настроен в Vercel
- Убедитесь, что база данных доступна из интернета (не localhost)
- Проверьте, что IP адреса Vercel разрешены в настройках базы данных

### Ошибка NextAuth
- Убедитесь, что `NEXTAUTH_URL` соответствует URL вашего приложения
- Проверьте, что `NEXTAUTH_SECRET` установлен

## Обновление приложения

После каждого изменения в коде:
1. Закоммитьте изменения:
   ```bash
   git add .
   git commit -m "Update"
   git push
   ```

2. Vercel автоматически задеплоит новую версию

## Дополнительные ресурсы

- [Документация Vercel](https://vercel.com/docs)
- [Документация Prisma](https://www.prisma.io/docs)
- [Документация Next.js](https://nextjs.org/docs)

