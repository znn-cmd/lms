# Инструкция по заполнению базы данных на Vercel

## Проблема
После деплоя на Vercel база данных пустая, поэтому логины `user/user` и `hr/hr` не работают.

## Решение

### Вариант 1: Через Vercel CLI (Рекомендуется)

1. Установите Vercel CLI (если еще не установлен):
```bash
npm i -g vercel
```

2. Войдите в аккаунт:
```bash
vercel login
```

3. Подключите проект:
```bash
cd C:\Users\zaice\Desktop\ASP-LMS
vercel link
```

4. Получите переменные окружения:
```bash
vercel env pull .env.local
```

5. Заполните базу данных:
```bash
# Выполните миграции (если еще не выполнены)
npx prisma migrate deploy

# Заполните базу данных
npm run db:seed
```

### Вариант 2: Через Vercel Dashboard (Postgres Studio)

1. Зайдите на [Vercel Dashboard](https://vercel.com/dashboard)
2. Перейдите в **Storage** → выберите вашу Postgres базу
3. Нажмите **"..."** → **Open in Postgres Studio**
4. В Postgres Studio выполните SQL запросы для создания пользователей

### Вариант 3: Создать пользователей вручную через SQL

Выполните следующие SQL запросы в Postgres Studio или через Vercel CLI:

```sql
-- Создание пользователя student (пароль: user)
INSERT INTO "User" (id, username, "passwordHash", role, "fullName", status, "offerStatus", "createdAt", "updatedAt")
VALUES (
  'student-id-here',
  'user',
  '$2a$10$YourHashedPasswordHere',  -- Замените на реальный хеш
  'STUDENT',
  'Demo Student',
  'NEW',
  'NONE',
  NOW(),
  NOW()
);

-- Создание пользователя hr (пароль: hr)
INSERT INTO "User" (id, username, "passwordHash", role, "fullName", status, "offerStatus", "createdAt", "updatedAt")
VALUES (
  'hr-id-here',
  'hr',
  '$2a$10$YourHashedPasswordHere',  -- Замените на реальный хеш
  'HR',
  'Demo HR',
  'NEW',
  'NONE',
  NOW(),
  NOW()
);
```

**ВНИМАНИЕ:** Для получения правильных хешей паролей выполните локально:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('user', 10).then(h => console.log('user:', h)); bcrypt.hash('hr', 10).then(h => console.log('hr:', h));"
```

### Вариант 4: Автоматический seed через Vercel CLI

Создайте временный скрипт для выполнения seed на Vercel:

```bash
vercel env pull .env.local
npx prisma migrate deploy
npm run db:seed
```

## Проверка

После заполнения базы данных попробуйте войти:
- **Student:** `user` / `user`
- **HR:** `hr` / `hr`

## Если проблема сохраняется

1. Проверьте, что переменная `DATABASE_URL` правильно настроена в Vercel
2. Убедитесь, что миграции выполнены: `npx prisma migrate deploy`
3. Проверьте логи в Vercel Dashboard → Deployments → Function Logs

