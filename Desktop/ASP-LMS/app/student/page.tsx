import StudentLayout from '@/components/StudentLayout';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getStudentData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      activeCourse: {
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
          quiz: {
            include: {
              questions: true,
            },
          },
        },
      },
      attempts: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  const courses = await prisma.course.findMany({
    where: { isActive: true },
    include: {
      lessons: true,
      quiz: true,
    },
  });

  return { user, courses };
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

export default async function StudentDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    redirect('/login');
  }

  const user = verifyToken(token);
  
  if (!user || user.role !== 'STUDENT') {
    redirect('/login');
  }

  const { user: studentData, courses } = await getStudentData(user.id);

  if (!studentData) {
    redirect('/login');
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Добро пожаловать, {studentData.fullName}!
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Ваш статус</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Статус:</span>{' '}
              {getStatusText(studentData.status)}
            </p>
            {studentData.score !== null && (
              <p>
                <span className="font-medium">Балл:</span> {studentData.score} из 100
              </p>
            )}
            {studentData.offerStatus !== 'NONE' && (
              <p>
                <span className="font-medium">Статус офера:</span>{' '}
                {studentData.offerStatus === 'SENT' && 'Отправлен'}
                {studentData.offerStatus === 'ACCEPTED' && 'Принят'}
                {studentData.offerStatus === 'DECLINED' && 'Отклонён'}
              </p>
            )}
          </div>
        </div>

        {!studentData.activeCourseId ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Выберите курс</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Уроков: {course.lessons.length} | Тест: {course.quiz ? 'Есть' : 'Нет'}
                  </p>
                  <form action="/api/student/select-course" method="POST">
                    <input type="hidden" name="courseId" value={course.id} />
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Начать этот курс
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Активный курс: {studentData.activeCourse?.title}
            </h2>
            <p className="text-gray-600 mb-4">
              {studentData.activeCourse?.description}
            </p>
            <div className="space-y-2 mb-4">
              <p>
                <span className="font-medium">Уроков:</span>{' '}
                {studentData.activeCourse?.lessons.length || 0}
              </p>
              {studentData.activeCourse?.quiz && (
                <p>
                  <span className="font-medium">Тест:</span> Доступен
                </p>
              )}
            </div>
            <div className="flex space-x-4">
              <Link
                href="/student/course"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Перейти к урокам
              </Link>
              {studentData.attempts.length > 0 && (
                <Link
                  href="/student/result"
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Посмотреть результаты
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

