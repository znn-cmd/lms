import StudentLayout from '@/components/StudentLayout';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { AcceptOfferButton, DeclineOfferButton } from '@/components/OfferButtons';

async function getStudentResult(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      attempts: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          quiz: {
            include: {
              course: true,
            },
          },
        },
      },
    },
  });

  return user;
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    REJECTED: 'Отказ',
    OFFER_TRAINEE: 'Офер стажёр',
    OFFER_REALTOR: 'Офер риэлтор',
    OFFER_DECLINED: 'Офер отклонён',
    HIRED_TRAINEE: 'Нанят как стажёр',
    HIRED_REALTOR: 'Нанят как риэлтор',
  };
  return statusMap[status] || status;
}

function getStatusDescription(status: string, score: number | null): string {
  if (status === 'REJECTED') {
    return 'К сожалению, на текущем этапе вы не подходите для работы в нашем агентстве. Рекомендуем пройти дополнительное обучение и попробовать снова.';
  }
  if (status === 'OFFER_TRAINEE' || status === 'HIRED_TRAINEE') {
    return 'Поздравляем! Вы прошли отбор на позицию стажёра. Мы предлагаем вам начать карьеру в нашем агентстве с позиции стажёра с возможностью дальнейшего роста.';
  }
  if (status === 'OFFER_REALTOR' || status === 'HIRED_REALTOR') {
    return 'Поздравляем! Вы прошли отбор на позицию риэлтора. Мы предлагаем вам начать работу в нашем агентстве на позиции риэлтора.';
  }
  if (status === 'OFFER_DECLINED') {
    return 'Вы отклонили предложение о работе. Если передумаете, свяжитесь с HR-отделом.';
  }
  return '';
}

function getOfferText(status: string): string {
  if (status === 'OFFER_TRAINEE' || status === 'HIRED_TRAINEE') {
    return `Офер на позицию стажёра:

• Оклад: 30,000 руб. + комиссия с продаж
• График: полный рабочий день, гибкий график
• Обучение: наставничество от опытных риэлторов
• Перспективы: возможность роста до позиции риэлтора через 3-6 месяцев
• Соцпакет: медицинская страховка, корпоративные мероприятия

Условия:
- Работа с клиентами под руководством наставника
- Изучение рынка недвижимости и объектов
- Помощь в организации просмотров и сделок
- Еженедельные отчёты и планерки`;
  }
  if (status === 'OFFER_REALTOR' || status === 'HIRED_REALTOR') {
    return `Офер на позицию риэлтора:

• Оклад: 50,000 руб. + комиссия с продаж (от 30% до 50% в зависимости от объёма)
• График: полный рабочий день, гибкий график
• Автономность: самостоятельная работа с клиентами
• Инструменты: доступ к CRM, база объектов, маркетинговые материалы
• Соцпакет: медицинская страховка, корпоративные мероприятия, обучение

Условия:
- Самостоятельная работа с клиентами от лида до сделки
- Работа с объектами недвижимости (апартаменты, виллы, коммерческая недвижимость)
- Ведение переговоров и сопровождение сделок
- Еженедельные отчёты и участие в планерках`;
  }
  return '';
}

export default async function ResultPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    redirect('/login');
  }

  const user = verifyToken(token);
  
  if (!user || user.role !== 'STUDENT') {
    redirect('/login');
  }

  const studentData = await getStudentResult(user.id);

  if (!studentData) {
    redirect('/student');
  }

  const lastAttempt = studentData.attempts[0];
  const canAcceptOffer =
    (studentData.status === 'OFFER_TRAINEE' ||
      studentData.status === 'OFFER_REALTOR') &&
    studentData.offerStatus === 'SENT';

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Результаты теста</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Ваш результат</h2>
          {studentData.score !== null && (
            <div className="mb-4">
              <p className="text-2xl font-bold text-indigo-600">
                {studentData.score} из 100 баллов
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-indigo-600 h-4 rounded-full"
                  style={{ width: `${studentData.score}%` }}
                ></div>
              </div>
            </div>
          )}
          <div className="mt-4">
            <p className="font-medium">Статус: {getStatusText(studentData.status)}</p>
            <p className="text-gray-600 mt-2">
              {getStatusDescription(studentData.status, studentData.score)}
            </p>
          </div>
        </div>

        {canAcceptOffer && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Предложение о работе</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {getOfferText(studentData.status)}
              </pre>
            </div>
            <div className="flex space-x-4">
              <AcceptOfferButton status={studentData.status} />
              <DeclineOfferButton />
            </div>
          </div>
        )}

        {studentData.status === 'HIRED_TRAINEE' || studentData.status === 'HIRED_REALTOR' ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              Поздравляем! Вы приняты на работу!
            </h2>
            <p className="text-green-700">
              С вами свяжется HR-отдел для обсуждения деталей выхода на работу.
            </p>
          </div>
        ) : null}

        <div className="bg-white rounded-lg shadow p-6">
          <Link
            href="/student"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Вернуться на дашборд
          </Link>
        </div>
      </div>
    </StudentLayout>
  );
}

