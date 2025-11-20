# Быстрое исправление проблемы с логином

## Проблема
Логины `user/user` и `hr/hr` не работают, ошибка на русском языке.

## Решение

### Шаг 1: Получите DATABASE_URL от Vercel

**Вариант A: Через Vercel CLI (рекомендуется)**
```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите
vercel login

# Подключите проект
cd C:\Users\zaice\Desktop\ASP-LMS
vercel link

# Получите переменные окружения
vercel env pull .env.local
```

**Вариант B: Вручную через Dashboard**
1. Зайдите на [Vercel Dashboard](https://vercel.com/dashboard)
2. Перейдите в **Storage** → выберите вашу Postgres базу
3. Скопируйте **Connection String**
4. Создайте файл `.env.local` в корне проекта:
```env
DATABASE_URL="postgres://user:password@host:5432/database"
JWT_SECRET="any-random-secret-key"
```

### Шаг 2: Заполните базу данных

```bash
# Выполните миграции
npx prisma migrate deploy

# Заполните базу данных (создаст пользователей user/user и hr/hr)
npm run db:seed
```

Или используйте автоматический скрипт:
```bash
npm run db:seed:vercel
```

### Шаг 3: Проверьте логин

После выполнения seed попробуйте войти:
- **Student:** `user` / `user`
- **HR:** `hr` / `hr`

## Если проблема сохраняется

1. Проверьте логи в Vercel Dashboard → Deployments → Function Logs
2. Убедитесь, что пользователи созданы в базе:
   ```bash
   npx prisma studio
   ```
   Откройте таблицу User и проверьте наличие пользователей `user` и `hr`

3. Проверьте, что пароли правильно хешированы (должны начинаться с `$2a$10$`)

## Локальная разработка

Для локальной разработки используйте SQLite. Создайте `.env.local`:
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="local-secret"
```

Затем:
```bash
npx prisma migrate dev
npm run db:seed
```

