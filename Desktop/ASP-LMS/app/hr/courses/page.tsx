import HrLayout from '@/components/HrLayout';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getCourses() {
  return await prisma.course.findMany({
    include: {
      lessons: true,
      quiz: {
        include: {
          questions: true,
        },
      },
      createdBy: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function CoursesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    redirect('/login');
  }

  const user = verifyToken(token);
  
  if (!user || user.role !== 'HR') {
    redirect('/login');
  }

  const courses = await getCourses();

  return (
    <HrLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Курсы</h1>
            <p className="text-gray-600 mt-2">
              Управление учебными курсами
            </p>
          </div>
          <Link
            href="/hr/courses/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Создать новый курс
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">
                  {course.title}
                </h3>
                {course.isActive ? (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    Активен
                  </span>
                ) : (
                  <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                    Неактивен
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {course.description}
              </p>
              <div className="space-y-1 mb-4 text-sm text-gray-500">
                <p>Уроков: {course.lessons.length}</p>
                <p>Тест: {course.quiz ? `Есть (${course.quiz.questions.length} вопросов)` : 'Нет'}</p>
                <p className="text-xs">
                  Создан: {new Date(course.createdAt).toLocaleDateString('ru-RU')}
                </p>
              </div>
              <Link
                href={`/hr/courses/${course.id}`}
                className="inline-block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Подробнее
              </Link>
            </div>
          ))}
        </div>
      </div>
    </HrLayout>
  );
}

