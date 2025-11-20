import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from './auth';

export function requireAuth(
  request: NextRequest,
  allowedRoles?: ('STUDENT' | 'HR')[]
): { user: any; response?: NextResponse } | { user: null; response: NextResponse } {
  const user = getAuthUser(request);

  if (!user) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    return { user: null, response };
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    return { user: null, response };
  }

  return { user };
}

