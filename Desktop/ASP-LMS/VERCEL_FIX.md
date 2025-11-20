# Исправление ошибки "No Next.js version detected" на Vercel

## Проблема
Vercel не может найти Next.js в зависимостях проекта.

## Решение

### 1. Проверьте настройки проекта в Vercel

Зайдите в настройки проекта на Vercel:
- **Settings** → **General**
- Убедитесь, что **Root Directory** установлен в `./` (корень проекта)
- Если Root Directory указан неправильно, измените его на `./`

### 2. Проверьте Framework Preset

В настройках проекта:
- **Settings** → **General** → **Framework Preset**
- Должно быть: **Next.js**
- Если не установлено, выберите **Next.js** вручную

### 3. Проверьте Build Command

В настройках проекта:
- **Settings** → **General** → **Build & Development Settings**
- **Build Command** должен быть: `npm run vercel-build`
- Или оставьте пустым для автоматического определения

### 4. Убедитесь, что package.json в корне

Файл `package.json` должен быть в корне репозитория (не в подпапке).

### 5. Пересоберите проект

После изменения настроек:
1. Зайдите в **Deployments**
2. Найдите последний деплой
3. Нажмите **Redeploy** → **Use existing Build Cache** (снимите галочку)
4. Нажмите **Redeploy**

### 6. Альтернативное решение

Если проблема сохраняется, попробуйте:

1. Удалите `vercel.json` из репозитория
2. В настройках Vercel проекта вручную установите:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 7. Проверьте переменные окружения

Убедитесь, что установлены:
- `DATABASE_URL` - строка подключения к PostgreSQL
- `JWT_SECRET` - секретный ключ для JWT

## Текущая структура проекта

```
ASP-LMS/
├── package.json          ← должен быть здесь
├── next.config.js
├── app/
├── prisma/
└── ...
```

## Проверка

После применения исправлений, в логах деплоя должно быть:
```
✓ Detected Next.js version: 14.2.5
✓ Running "npm run vercel-build"
```

