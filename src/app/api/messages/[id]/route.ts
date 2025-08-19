import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { AuditLogger } from '@/lib/auditLogger';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const message = await Message.findById(id);
    if (!message) {
      return NextResponse.json(
        { error: 'Wiadomość nie została znaleziona' },
        { status: 404 }
      );
    }

    // Sprawdzenie czy użytkownik jest odbiorcą wiadomości
    if (message.recipient.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'Brak uprawnień' },
        { status: 403 }
      );
    }

    const oldData = { isRead: message.isRead, readAt: message.readAt };

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    const newData = { isRead: message.isRead, readAt: message.readAt };

    // Audit log
    await AuditLogger.logUpdate(
      decoded.userId,
      'message',
      id,
      oldData,
      newData,
      request
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Błąd oznaczania wiadomości jako przeczytanej:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}
