import HrLayout from '@/components/HrLayout';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getCourseData(courseId: string) {
  return await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
      },
      quiz: {
        include: {
          questions: {
            orderBy: { createdAt: 'asc' },
          },
        },
      },
      createdBy: true,
    },
  });
}

export default async function CourseDetailPage({
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

  const course = await getCourseData(id);

  if (!course) {
    redirect('/hr/courses');
  }

  return (
    <HrLayout>
      <div className="space-y-6">
        <div>
          <Link
            href="/hr/courses"
            className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block"
          >
            ← Назад к списку курсов
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-600 mt-2">{course.description}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Информация о курсе</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Статус:</span>{' '}
              {course.isActive ? (
                <span className="text-green-600">Активен</span>
              ) : (
                <span className="text-gray-600">Неактивен</span>
              )}
            </p>
            <p>
              <span className="font-medium">Создан:</span>{' '}
              {new Date(course.createdAt).toLocaleString('ru-RU')}
            </p>
            <p>
              <span className="font-medium">Создал:</span> {course.createdBy.fullName}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Уроки ({course.lessons.length})
          </h2>
          <div className="space-y-3">
            {course.lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <h3 className="font-semibold text-lg mb-2">
                  Урок {lesson.order}: {lesson.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {lesson.content.substring(0, 200)}...
                </p>
              </div>
            ))}
          </div>
        </div>

        {course.quiz && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Тест: {course.quiz.title} ({course.quiz.questions.length} вопросов)
            </h2>
            <p className="text-gray-600 mb-4">{course.quiz.description}</p>
            <div className="space-y-4">
              {course.quiz.questions.map((question, index) => {
                const options = JSON.parse(question.options);
                return (
                  <div
                    key={question.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h3 className="font-semibold mb-2">
                      Вопрос {index + 1}: {question.text}
                    </h3>
                    <div className="space-y-1 ml-4">
                      {options.map((option: string, optIndex: number) => (
                        <p
                          key={optIndex}
                          className={`text-sm ${
                            optIndex === question.correctOptionIndex
                              ? 'text-green-600 font-medium'
                              : 'text-gray-600'
                          }`}
                        >
                          {optIndex === question.correctOptionIndex && '✓ '}
                          {option}
                        </p>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Вес вопроса: {question.weight} баллов
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </HrLayout>
  );
}

