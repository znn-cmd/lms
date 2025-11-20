import StudentLayout from '@/components/StudentLayout';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getCourseData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      activeCourse: {
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
          quiz: true,
        },
      },
    },
  });

  return user;
}

export default async function CoursePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    redirect('/login');
  }

  const user = verifyToken(token);
  
  if (!user || user.role !== 'STUDENT') {
    redirect('/login');
  }

  const studentData = await getCourseData(user.id);

  if (!studentData || !studentData.activeCourseId || !studentData.activeCourse) {
    redirect('/student');
  }

  const course = studentData.activeCourse;
  const totalLessons = course.lessons.length;
  const canTakeQuiz = totalLessons > 0; // В демо можно сразу перейти к тесту

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <Link
            href="/student"
            className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block"
          >
            ← Назад к дашборду
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-600 mt-2">{course.description}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Уроки курса</h2>
          <div className="space-y-3">
            {course.lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">
                      Урок {lesson.order}: {lesson.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {lesson.content.substring(0, 150)}...
                    </p>
                  </div>
                  <Link
                    href={`/student/course/lesson/${lesson.id}`}
                    className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 whitespace-nowrap"
                  >
                    Открыть
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {canTakeQuiz && course.quiz && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Итоговый тест</h2>
            <p className="text-gray-600 mb-4">
              После изучения всех уроков пройдите итоговый тест для проверки знаний.
            </p>
            <Link
              href="/student/quiz"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
            >
              Перейти к тесту
            </Link>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

