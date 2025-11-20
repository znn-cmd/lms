import HrLayout from '@/components/HrLayout';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getUsers() {
  return await prisma.user.findMany({
    where: { role: 'STUDENT' },
    include: {
      activeCourse: true,
      attempts: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
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

export default async function UsersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    redirect('/login');
  }

  const user = verifyToken(token);
  
  if (!user || user.role !== 'HR') {
    redirect('/login');
  }

  const users = await getUsers();

  return (
    <HrLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Кандидаты</h1>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
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

