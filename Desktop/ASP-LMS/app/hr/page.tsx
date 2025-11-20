import HrLayout from '@/components/HrLayout';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getDashboardData() {
  const users = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    include: {
      activeCourse: true,
      attempts: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  const courses = await prisma.course.findMany({
    where: { isActive: true },
  });

  // Подсчёт воронки
  const funnel = {
    total: users.length,
    NEW: users.filter((u) => u.status === 'NEW').length,
    COURSE_IN_PROGRESS: users.filter((u) => u.status === 'COURSE_IN_PROGRESS').length,
    QUIZ_PENDING: users.filter((u) => u.status === 'QUIZ_PENDING').length,
    QUIZ_COMPLETED: users.filter((u) => u.status === 'QUIZ_COMPLETED').length,
    REJECTED: users.filter((u) => u.status === 'REJECTED').length,
    OFFER_TRAINEE: users.filter((u) => u.status === 'OFFER_TRAINEE').length,
    OFFER_REALTOR: users.filter((u) => u.status === 'OFFER_REALTOR').length,
    OFFER_DECLINED: users.filter((u) => u.status === 'OFFER_DECLINED').length,
    HIRED_TRAINEE: users.filter((u) => u.status === 'HIRED_TRAINEE').length,
    HIRED_REALTOR: users.filter((u) => u.status === 'HIRED_REALTOR').length,
  };

  return { users, courses, funnel };
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

export default async function HrDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    redirect('/login');
  }

  const user = verifyToken(token);
  
  if (!user || user.role !== 'HR') {
    redirect('/login');
  }

  const { users, courses, funnel } = await getDashboardData();

  const funnelCards = [
    { label: 'Всего кандидатов', value: funnel.total, color: 'bg-blue-500' },
    { label: 'Новых (NEW)', value: funnel.NEW, color: 'bg-gray-500' },
    { label: 'В обучении', value: funnel.COURSE_IN_PROGRESS, color: 'bg-yellow-500' },
    { label: 'Ожидают тест', value: funnel.QUIZ_PENDING, color: 'bg-orange-500' },
    { label: 'Тест завершён', value: funnel.QUIZ_COMPLETED, color: 'bg-purple-500' },
    { label: 'Отказ', value: funnel.REJECTED, color: 'bg-red-500' },
    { label: 'Офер стажёр', value: funnel.OFFER_TRAINEE, color: 'bg-green-500' },
    { label: 'Офер риэлтор', value: funnel.OFFER_REALTOR, color: 'bg-teal-500' },
    { label: 'Офер отклонён', value: funnel.OFFER_DECLINED, color: 'bg-pink-500' },
    { label: 'Нанят как стажёр', value: funnel.HIRED_TRAINEE, color: 'bg-emerald-500' },
    { label: 'Нанят как риэлтор', value: funnel.HIRED_REALTOR, color: 'bg-cyan-500' },
  ];

  return (
    <HrLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Воронка обучения</h1>
          <p className="text-gray-600 mt-2">
            Обзор кандидатов по статусам прохождения обучения
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {funnelCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className={`${card.color} w-12 h-12 rounded-lg mb-3 flex items-center justify-center text-white font-bold text-xl`}>
                {card.value}
              </div>
              <h3 className="text-sm font-medium text-gray-700">{card.label}</h3>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Список кандидатов</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ФИО
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Логин
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Курс
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Балл
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Офер
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.activeCourse?.title || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getStatusText(student.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.score !== null ? `${student.score}/100` : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.offerStatus === 'NONE'
                        ? '—'
                        : student.offerStatus === 'SENT'
                        ? 'Отправлен'
                        : student.offerStatus === 'ACCEPTED'
                        ? 'Принят'
                        : 'Отклонён'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/hr/users/${student.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Подробнее
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </HrLayout>
  );
}

