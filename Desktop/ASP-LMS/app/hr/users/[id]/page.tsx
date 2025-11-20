import HrLayout from '@/components/HrLayout';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getUserData(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      activeCourse: {
        include: {
          lessons: true,
          quiz: {
            include: {
              questions: true,
            },
          },
        },
      },
      attempts: {
        include: {
          quiz: {
            include: {
              course: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    NEW: 'Новый',
    COURSE_IN_PROGRESS: 'В обучении',
    QUIZ_PENDING: 'Ожидает тест',
    QUIZ_COMPLETED: 'Тест завершён',
    REJECTED: 'Отказ',
    OFFER_TRAINEE: 'Офер стажёр',
    OFFER_REALTOR: 'Офер риэлтор',
    OFFER_DECLINED: 'Офер отклонён',
    HIRED_TRAINEE: 'Нанят как стажёр',
    HIRED_REALTOR: 'Нанят как риэлтор',
  };
  return statusMap[status] || status;
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    redirect('/login');
  }

  const user = verifyToken(token);
  
  if (!user || user.role !== 'HR') {
    redirect('/login');
  }

  const studentData = await getUserData(id);

  if (!studentData || studentData.role !== 'STUDENT') {
    redirect('/hr/users');
  }

  return (
    <HrLayout>
      <div className="space-y-6">
        <div>
          <Link
            href="/hr/users"
            className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block"
          >
            ← Назад к списку кандидатов
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Кандидат: {studentData.fullName}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">ФИО:</span> {studentData.fullName}
              </p>
              <p>
                <span className="font-medium">Логин:</span> {studentData.username}
              </p>
              <p>
                <span className="font-medium">Роль:</span> Студент
              </p>
              <p>
                <span className="font-medium">Статус:</span>{' '}
                {getStatusText(studentData.status)}
              </p>
              <p>
                <span className="font-medium">Балл:</span>{' '}
                {studentData.score !== null ? `${studentData.score}/100` : '—'}
              </p>
              <p>
                <span className="font-medium">Статус офера:</span>{' '}
                {studentData.offerStatus === 'NONE'
                  ? '—'
                  : studentData.offerStatus === 'SENT'
                  ? 'Отправлен'
                  : studentData.offerStatus === 'ACCEPTED'
                  ? 'Принят'
                  : 'Отклонён'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Активный курс</h2>
            {studentData.activeCourse ? (
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Название:</span>{' '}
                  {studentData.activeCourse.title}
                </p>
                <p>
                  <span className="font-medium">Уроков:</span>{' '}
                  {studentData.activeCourse.lessons.length}
                </p>
                <p>
                  <span className="font-medium">Тест:</span>{' '}
                  {studentData.activeCourse.quiz ? 'Есть' : 'Нет'}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Курс не выбран</p>
            )}
          </div>
        </div>

        {studentData.attempts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Попытки прохождения теста</h2>
            <div className="space-y-4">
              {studentData.attempts.map((attempt) => (
                <div key={attempt.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">
                        Курс: {attempt.quiz.course.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(attempt.createdAt).toLocaleString('ru-RU')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600">
                        {attempt.score}/100
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Статус: {attempt.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </HrLayout>
  );
}

