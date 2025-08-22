import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

interface JWTPayload {
  userId: string;
  role: string;
  email: string;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/api/auth/login',
    '/api/auth/register',
    '/_next',
    '/favicon.ico',
    '/api/health'
  ];

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify JWT token
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Check for admin routes
    if (pathname.startsWith('/admin')) {
      const userRole = payload.role;
      if (userRole !== 'admin' && userRole !== 'hr') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('user-id', payload.userId);
    requestHeaders.set('user-role', payload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error('JWT verification failed:', error);
    // Remove invalid token and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};