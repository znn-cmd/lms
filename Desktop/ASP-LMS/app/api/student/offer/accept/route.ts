import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);

  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const student = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!student) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let newStatus: string;

    if (student.status === 'OFFER_TRAINEE') {
      newStatus = 'HIRED_TRAINEE';
    } else if (student.status === 'OFFER_REALTOR') {
      newStatus = 'HIRED_REALTOR';
    } else {
      return NextResponse.json(
        { error: 'Invalid status for accepting offer' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: newStatus as any,
        offerStatus: 'ACCEPTED',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Accept offer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

