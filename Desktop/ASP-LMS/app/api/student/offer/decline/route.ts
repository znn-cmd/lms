import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);

  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'OFFER_DECLINED',
        offerStatus: 'DECLINED',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Decline offer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

