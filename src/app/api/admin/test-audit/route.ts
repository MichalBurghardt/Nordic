import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { AuditLogger } from '@/lib/auditLogger';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Brak uprawnień' },
        { status: 403 }
      );
    }

    // Znajdź użytkownika w bazie
    const dbUser = await User.findById(user.userId);
    if (!dbUser) {
      return NextResponse.json(
        { error: 'Użytkownik nie został znaleziony' },
        { status: 404 }
      );
    }

    // Utwórz kilka testowych audit logów
    await AuditLogger.logLogin(user.userId, request);
    
    await AuditLogger.logCreate(
      user.userId,
      'User',
      dbUser._id.toString(),
      { test: 'Test user creation' },
      request
    );
    
    await AuditLogger.logUpdate(
      user.userId,
      'Schedule',
      '000000000000000000000000', // Dummy ObjectId
      { before: { status: 'pending' }, after: { status: 'active' } },
      { status: { before: 'pending', after: 'active' } },
      request
    );
    
    await AuditLogger.logDelete(
      user.userId,
      'Assignment',
      '000000000000000000000001', // Dummy ObjectId
      { name: 'Test assignment', status: 'deleted' },
      request
    );

    return NextResponse.json({
      success: true,
      message: 'Utworzono 4 testowe audit logi',
      count: 4
    });

  } catch (error) {
    console.error('Test audit logs creation error:', error);
    return NextResponse.json(
      { error: 'Błąd podczas tworzenia testowych audit logów' },
      { status: 500 }
    );
  }
}
