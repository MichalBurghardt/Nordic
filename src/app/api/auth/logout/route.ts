import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { AuditLogger } from '@/lib/auditLogger';
import dbConnect from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Pobierz informacje o użytkowniku przed wylogowaniem
    const token = getTokenFromRequest(request);
    let userId = null;
    
    if (token) {
      const user = verifyToken(token);
      if (user) {
        userId = user.userId;
        // Loguj wylogowanie
        await AuditLogger.logLogout(
          userId,
          request,
          'Użytkownik wylogował się z systemu'
        );
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Usuń cookie z tokenem
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
  }
}
