import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Token wymagany' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Nieprawidłowy token' }, { status: 401 });
    }

    // Count unread messages where user is recipient
    const count = await Message.countDocuments({
      recipient: decoded.userId,
      isRead: false
    });

    return NextResponse.json({ count });

  } catch (error) {
    console.error('Błąd pobierania liczby nieprzeczytanych wiadomości:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}
