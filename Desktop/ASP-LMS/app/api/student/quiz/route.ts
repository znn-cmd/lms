import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);

  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const student = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        activeCourse: {
          include: {
            quiz: {
              include: {
                questions: {
                  orderBy: { createdAt: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!student?.activeCourseId || !student.activeCourse) {
      return NextResponse.json(
        { error: 'No active course' },
        { status: 400 }
      );
    }

    const quiz = student.activeCourse.quiz;

    if (!quiz) {
      return NextResponse.json({ error: 'No quiz found' }, { status: 404 });
    }

    // Парсим options из JSON
    const questionsWithParsedOptions = quiz.questions.map((q) => ({
      ...q,
      options: JSON.parse(q.options),
    }));

    return NextResponse.json({
      quiz: {
        ...quiz,
        questions: questionsWithParsedOptions,
      },
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

