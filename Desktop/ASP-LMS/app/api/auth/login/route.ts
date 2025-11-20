import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'MISSING_CREDENTIALS' },
        { status: 400 }
      );
    }

    // Debug logging (remove in production)
    console.log('Login attempt:', { username, passwordLength: password?.length });

    const user = await authenticateUser(username, password);

    if (!user) {
      console.log('Authentication failed for username:', username);
      return NextResponse.json(
        { error: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    console.log('Authentication successful for user:', user.username);
    const response = NextResponse.json({ user });
    setAuthCookie(response, user);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

