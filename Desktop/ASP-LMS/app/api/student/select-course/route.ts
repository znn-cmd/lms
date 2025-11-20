import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);

  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const courseId = formData.get('courseId') as string;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || !course.isActive) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        activeCourseId: courseId,
        status: 'COURSE_IN_PROGRESS',
      },
    });

    return NextResponse.redirect(new URL('/student', request.url));
  } catch (error) {
    console.error('Select course error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

