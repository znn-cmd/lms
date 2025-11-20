import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = getAuthUser(request);

  if (!user || user.role !== 'HR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, description, questions } = await request.json();

    if (!title || !description || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Title, description and questions are required' },
        { status: 400 }
      );
    }

    // Проверяем, что курс существует
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Удаляем старый тест, если есть
    await prisma.question.deleteMany({
      where: { quiz: { courseId: id } },
    });
    await prisma.quiz.deleteMany({
      where: { courseId: id },
    });

    // Создаём новый тест
    const quiz = await prisma.quiz.create({
      data: {
        courseId: id,
        title,
        description,
        questions: {
          create: questions.map((q: any) => ({
            text: q.text,
            options: JSON.stringify(q.options),
            correctOptionIndex: q.correctOptionIndex,
            weight: q.weight || 10,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, quiz });
  } catch (error) {
    console.error('Create quiz error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

