# Настройка базы данных PostgreSQL

## Проблема: Authentication failed

Ошибка означает, что Prisma не может подключиться к PostgreSQL. Вот как это исправить:

## Вариант 1: Локальный PostgreSQL

### Шаг 1: Установите PostgreSQL (если еще не установлен)

**Windows:**
1. Скачайте с https://www.postgresql.org/download/windows/
2. Или используйте установщик через https://www.postgresql.org/download/
3. Во время установки запомните пароль для пользователя `postgres`

**Или используйте Docker:**
```bash
docker run --name lms-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=lms_com -p 5432:5432 -d postgres
```

### Шаг 2: Создайте базу данных

Откройте PostgreSQL командную строку или pgAdmin и выполните:

```sql
CREATE DATABASE lms_com;
```

Или через командную строку:
```bash
psql -U postgres
CREATE DATABASE lms_com;
\q
```

### Шаг 3: Настройте .env файл

Откройте `.env` файл и укажите правильные credentials:

```env
DATABASE_URL="postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/lms_com?schema=public"
```

Замените:
- `postgres` - имя пользователя (обычно `postgres`)
- `ВАШ_ПАРОЛЬ` - пароль, который вы установили при установке PostgreSQL
- `lms_com` - имя базы данных

### Шаг 4: Проверьте подключение

```bash
npm run db:push
```

## Вариант 2: Облачная база данных (рекомендуется для начала)

### Supabase (бесплатно)

1. Зарегистрируйтесь на https://supabase.com
2. Создайте новый проект
3. Перейдите в Settings → Database
4. Скопируйте Connection String (URI)
5. Вставьте в `.env`:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### Neon (бесплатно)

1. Зарегистрируйтесь на https://neon.tech
2. Создайте новый проект
3. Скопируйте Connection String
4. Вставьте в `.env`

### Railway (бесплатно)

1. Зарегистрируйтесь на https://railway.app
2. Создайте новый проект → Add PostgreSQL
3. Скопируйте DATABASE_URL из переменных окружения
4. Вставьте в `.env`

## Вариант 3: SQLite (для быстрого тестирования)

Если не хотите устанавливать PostgreSQL, можно временно использовать SQLite:

1. Измените `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

2. В `.env`:
```env
DATABASE_URL="file:./dev.db"
```

3. Запустите:
```bash
npm run db:push
```

**Примечание:** SQLite не поддерживает все функции PostgreSQL, но подойдет для тестирования.

## Проверка подключения

После настройки `.env`, проверьте:

```bash
# Проверить подключение
npx prisma db pull

# Применить схему
npm run db:push

# Заполнить данными
npm run db:seed
```

## Частые проблемы

### "password authentication failed"
- Проверьте правильность пароля в DATABASE_URL
- Убедитесь, что пользователь существует

### "database does not exist"
- Создайте базу данных: `CREATE DATABASE lms_com;`

### "connection refused"
- Убедитесь, что PostgreSQL запущен
- Проверьте, что порт 5432 не занят другим приложением

### Windows: "psql: command not found"
- Добавьте PostgreSQL в PATH:
  - `C:\Program Files\PostgreSQL\[VERSION]\bin`
- Или используйте pgAdmin для создания БД

## Быстрый старт с Docker

Если у вас установлен Docker:

```bash
# Запустить PostgreSQL
docker run --name lms-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=lms_com \
  -p 5432:5432 \
  -d postgres

# В .env используйте:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lms_com?schema=public"
```

