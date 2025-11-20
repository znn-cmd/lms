import StudentLayout from '@/components/StudentLayout';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getLessonData(userId: string, lessonId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      activeCourse: {
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!user?.activeCourse) {
    return null;
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });

  if (!lesson || lesson.courseId !== user.activeCourseId) {
    return null;
  }

  const currentIndex = user.activeCourse.lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? user.activeCourse.lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < user.activeCourse.lessons.length - 1
      ? user.activeCourse.lessons[currentIndex + 1]
      : null;

  return { lesson, prevLesson, nextLesson, course: user.activeCourse };
}

export default async function LessonPage({
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
  
  if (!user || user.role !== 'STUDENT') {
    redirect('/login');
  }

  const data = await getLessonData(user.id, id);

  if (!data) {
    redirect('/student/course');
  }

  const { lesson, prevLesson, nextLesson, course } = data;

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link
            href="/student/course"
            className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block"
          >
            ← Назад к списку уроков
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Урок {lesson.order}: {lesson.title}
          </h1>
          <div className="prose max-w-none mt-6">
            <div className="whitespace-pre-line text-gray-700 leading-relaxed">
              {lesson.content}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center bg-white rounded-lg shadow p-4">
          {prevLesson ? (
            <Link
              href={`/student/course/lesson/${prevLesson.id}`}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              ← Предыдущий урок
            </Link>
          ) : (
            <div></div>
          )}
          {nextLesson ? (
            <Link
              href={`/student/course/lesson/${nextLesson.id}`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Следующий урок →
            </Link>
          ) : (
            <Link
              href="/student/course"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Вернуться к курсу
            </Link>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}

