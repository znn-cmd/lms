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
    const { lessons } = await request.json();

    if (!lessons || !Array.isArray(lessons)) {
      return NextResponse.json(
        { error: 'Lessons array is required' },
        { status: 400 }
      );
    }

    // Проверяем, что курс существует и принадлежит HR
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Удаляем старые уроки
    await prisma.lesson.deleteMany({
      where: { courseId: id },
    });

    // Создаём новые уроки
    await prisma.lesson.createMany({
      data: lessons.map((lesson: any) => ({
        courseId: id,
        title: lesson.title,
        content: lesson.content,
        order: lesson.order,
      })),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Create lessons error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

