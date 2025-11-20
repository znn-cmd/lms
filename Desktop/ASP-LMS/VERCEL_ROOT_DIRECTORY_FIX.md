# КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Root Directory в Vercel

## Проблема
Vercel не может найти Next.js, потому что **Root Directory** настроен неправильно.

## Решение (ОБЯЗАТЕЛЬНО)

### Шаг 1: Проверьте Root Directory в Vercel

1. Зайдите на [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите ваш проект `lms`
3. Перейдите в **Settings** → **General**
4. Найдите раздел **Root Directory**

### Шаг 2: Исправьте Root Directory

**ВАЖНО:** Root Directory должен быть **ПУСТЫМ** или содержать `./`

- ❌ **НЕПРАВИЛЬНО:** `Desktop/ASP-LMS` или любая другая папка
- ✅ **ПРАВИЛЬНО:** Оставьте поле **ПУСТЫМ** или укажите `./`

### Шаг 3: Проверьте Framework Preset

В том же разделе **Settings** → **General**:

1. Найдите **Framework Preset**
2. Убедитесь, что выбрано: **Next.js**
3. Если не выбрано, выберите **Next.js** вручную

### Шаг 4: Проверьте Build Settings

В **Settings** → **General** → **Build & Development Settings**:

- **Build Command:** `npm run vercel-build` (или оставьте пустым)
- **Output Directory:** `.next` (или оставьте пустым для автоопределения)
- **Install Command:** `npm install` (или оставьте пустым)

### Шаг 5: Пересоберите проект

1. Перейдите в **Deployments**
2. Найдите последний деплой
3. Нажмите **"..."** (три точки) → **Redeploy**
4. **ВАЖНО:** Снимите галочку **"Use existing Build Cache"**
5. Нажмите **Redeploy**

## Альтернативное решение

Если проблема сохраняется:

1. **Удалите проект** из Vercel (Settings → Delete Project)
2. **Создайте проект заново:**
   - Add New Project
   - Import Git Repository → выберите `znn-cmd/lms`
   - **ВАЖНО:** В настройках импорта:
     - **Root Directory:** оставьте **ПУСТЫМ**
     - **Framework Preset:** выберите **Next.js**
   - Нажмите **Deploy**

## Проверка структуры репозитория

Убедитесь, что структура такая:

```
lms/ (корень репозитория)
├── package.json          ← должен быть здесь
├── next.config.js
├── app/
├── prisma/
└── ...
```

**НЕ должно быть:**
```
lms/
└── Desktop/
    └── ASP-LMS/
        ├── package.json  ← НЕПРАВИЛЬНО!
```

## После исправления

После правильной настройки Root Directory, в логах деплоя должно появиться:

```
✓ Detected Next.js version: 14.2.5
✓ Running "npm run vercel-build"
```

## Если ничего не помогает

Попробуйте создать новый проект в Vercel с нуля, убедившись, что:
1. Root Directory пустой
2. Framework Preset = Next.js
3. Все переменные окружения настроены

