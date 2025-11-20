# LMS Platform - Commercial Demo

Полнофункциональная LMS-платформа для найма, оценки, фильтрации и обучения сотрудников агентства недвижимости.

## ✨ Реализованные модули

- ✅ **Модуль кандидата** - регистрация, курсы, тесты, оферы
- ✅ **Модуль наставника** - управление кандидатами, чат, проверка тестов
- ✅ **Модуль HR/Администратора** - вакансии, кандидаты, аналитика
- ✅ **Редактор курсов** - drag-and-drop, управление модулями и уроками
- ✅ **Система тестов** - multiple choice, open answers, автоматическая проверка
- ✅ **Talent Pool** - кадровый резерв с фильтрацией
- ✅ **Вебинары** - календарь с FullCalendar
- ✅ **Аналитика** - графики и воронки найма
- ✅ **i18n** - поддержка EN/RU
- ✅ **PWA** - готовность к установке как приложение
- ✅ **Real-time чат** - Socket.io интеграция

## Технологии

- Next.js 14 (App Router)
- TypeScript
- Prisma ORM + PostgreSQL
- NextAuth (JWT)
- Tailwind CSS + Shadcn/UI
- Recharts для аналитики
- Socket.io для чатов
- FullCalendar для вебинаров
- react-beautiful-dnd для drag-and-drop
- PWA ready

## Быстрый старт

1. Установите зависимости:
```bash
npm install
```

2. Настройте базу данных:
```bash
# Создайте .env файл с DATABASE_URL
cp .env.example .env

# ⚠️ ВАЖНО: Отредактируйте .env и укажите правильный DATABASE_URL
# См. QUICK_DB_SETUP.md для быстрой настройки (рекомендуется Supabase)

# Примените схему к базе данных
npm run db:push

# Заполните демо-данными
npm run db:seed
```

**Проблемы с подключением к БД?** См. `DATABASE_SETUP.md` или `QUICK_DB_SETUP.md`

3. Запустите dev сервер:
```bash
npm run dev
```

4. (Опционально) Запустите Socket.io сервер для чата:
```bash
# См. SOCKET_SETUP.md для инструкций
```

## Структура проекта

- `/app` - Next.js App Router страницы
  - `/candidate` - модуль кандидата
  - `/hr` - модуль HR/администратора
  - `/mentor` - модуль наставника
  - `/api` - API routes
- `/components` - React компоненты
- `/lib` - Утилиты и конфигурации
- `/i18n` - Переводы (EN/RU)
- `/prisma` - Схема базы данных и seed скрипты
- `/server` - Socket.io сервер
- `/public` - Статические файлы

## Демо-аккаунты

После seed будут созданы:
- **Admin**: admin@demo.com / demo123
- **HR**: hr@demo.com / demo123
- **Mentor**: mentor@demo.com / demo123
- **Candidate**: candidate@demo.com / demo123

## Документация

- `QUICK_START.md` - быстрый старт
- `SETUP.md` - подробная установка
- `SOCKET_SETUP.md` - настройка Socket.io
- `IMPLEMENTATION_STATUS.md` - статус реализации
- `FINAL_STATUS.md` - финальный статус всех модулей

## Основные возможности

### Для кандидатов
- Регистрация по уникальным ссылкам
- Прохождение курсов с прогрессом
- Сдача тестов разных типов
- Получение и ответ на оферы
- Чат с наставником

### Для наставников
- Управление назначенными кандидатами
- Real-time чат
- Проверка открытых ответов в тестах
- Мониторинг прогресса

### Для HR
- Управление вакансиями и источниками
- Просмотр всех кандидатов
- Аналитика с графиками
- Talent Pool управление
- Календарь вебинаров

## Production Deployment

### Быстрый деплой на Vercel

1. **Подготовьте базу данных:**
   - Рекомендуется [Supabase](https://supabase.com) (бесплатный план)
   - Создайте проект и скопируйте Connection string

2. **Деплой:**
   - Импортируйте репозиторий в [Vercel](https://vercel.com)
   - Добавьте переменные окружения:
     - `DATABASE_URL` (из Supabase)
     - `NEXTAUTH_SECRET` (сгенерируйте: `openssl rand -base64 32`)
     - `NEXTAUTH_URL` (обновите после деплоя)
   - Нажмите "Deploy"

3. **Настройте базу данных:**
   ```bash
   npx prisma db push
   npm run db:seed
   ```

**Подробная инструкция:** см. `DEPLOYMENT.md` или `VERCEL_DEPLOY.md`

