# Инструкция по выгрузке и деплою на Vercel

## Шаг 1: Добавить все файлы в Git

```bash
cd C:\Users\zaice\Desktop\lms-com
git add .
```

## Шаг 2: Проверить, что добавлено

```bash
git status
```

Убедитесь, что добавлены:
- ✅ `.env.example`
- ✅ `vercel.json`
- ✅ `next.config.js` (обновлен)
- ✅ `DEPLOYMENT.md`
- ✅ `VERCEL_DEPLOY.md`
- ✅ `PRE_DEPLOY_CHECKLIST.md`
- ✅ `README.md` (обновлен)
- ✅ Все остальные файлы проекта

**НЕ должны быть добавлены:**
- ❌ `.env` (уже в .gitignore)
- ❌ `node_modules/` (уже в .gitignore)
- ❌ `.next/` (уже в .gitignore)

## Шаг 3: Создать коммит

```bash
git commit -m "Prepare for Vercel deployment

- Add .env.example with environment variables
- Add vercel.json configuration
- Update next.config.js for production
- Add deployment documentation
- Update README with deployment instructions"
```

## Шаг 4: Добавить remote (если еще не добавлен)

```bash
git remote -v
```

Если remote не настроен:
```bash
git remote add origin https://github.com/znn-cmd/lms-sandbox.git
```

## Шаг 5: Отправить в GitHub

```bash
git push -u origin main
```

Если репозиторий пустой, возможно потребуется:
```bash
git push -u origin main --force
```

## Шаг 6: Деплой на Vercel

1. Перейдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите **"Add New Project"**
4. Импортируйте репозиторий `znn-cmd/lms-sandbox`
5. Настройте переменные окружения:
   - `DATABASE_URL` - из Supabase/Neon/Railway
   - `NEXTAUTH_SECRET` - сгенерируйте: `openssl rand -base64 32`
   - `NEXTAUTH_URL` - будет автоматически установлен, обновите после деплоя
6. Нажмите **"Deploy"**

## Шаг 7: Настройка базы данных

После успешного деплоя:

1. Локально создайте `.env` с production `DATABASE_URL`:
```bash
DATABASE_URL=postgresql://... (из вашей БД)
```

2. Примените схему:
```bash
npx prisma db push
```

3. Заполните демо-данными:
```bash
npm run db:seed
```

## Шаг 8: Обновить NEXTAUTH_URL

1. В Vercel Dashboard → Settings → Environment Variables
2. Обновите `NEXTAUTH_URL` на `https://your-project.vercel.app`
3. Передеплойте проект

## Готово! 🎉

Ваше приложение должно быть доступно по адресу:
`https://your-project.vercel.app`

**Демо-аккаунты:**
- Admin: admin@demo.com / demo123
- HR: hr@demo.com / demo123
- Mentor: mentor@demo.com / demo123
- Candidate: candidate@demo.com / demo123

---

**Подробная документация:** см. `DEPLOYMENT.md`

