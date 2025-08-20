import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Audit from '@/models/Audit';
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

    // Utwórz testowe audit logi bezpośrednio
    const testAudits = await Audit.create([
      {
        userId: dbUser._id,
        action: 'LOGIN',
        resource: 'User',
        resourceId: dbUser._id,
        timestamp: new Date(),
        details: 'Test login entry',
        ipAddress: '127.0.0.1'
      },
      {
        userId: dbUser._id,
        action: 'CREATE',
        resource: 'message',
        timestamp: new Date(),
        details: 'Test message creation',
        ipAddress: '127.0.0.1'
      },
      {
        userId: dbUser._id,
        action: 'UPDATE',
        resource: 'User',
        resourceId: dbUser._id,
        timestamp: new Date(),
        details: 'Test user update',
        ipAddress: '127.0.0.1'
      }
    ]);

    return NextResponse.json({
      success: true,
      message: `Utworzono ${testAudits.length} testowych audit logów`,
      count: testAudits.length,
      audits: testAudits
    });

  } catch (error) {
    console.error('Direct audit creation error:', error);
    return NextResponse.json(
      { error: `Błąd podczas tworzenia audit logów: ${error}` },
      { status: 500 }
    );
  }
}
