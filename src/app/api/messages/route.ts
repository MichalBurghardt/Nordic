import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';
import User from '@/models/User';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { AuditLogger } from '@/lib/auditLogger';

// Pobieranie wiadomości
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

    const { searchParams } = new URL(request.url);
    const conversationWith = searchParams.get('conversationWith');
    const since = searchParams.get('since'); // New parameter for polling
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    let query: Record<string, unknown> = {};

    if (conversationWith) {
      // Wiadomości między dwoma użytkownikami
      query = {
        $or: [
          { sender: decoded.userId, recipient: conversationWith },
          { sender: conversationWith, recipient: decoded.userId }
        ]
      };
    } else {
      // Wszystkie wiadomości użytkownika
      query = {
        $or: [
          { sender: decoded.userId },
          { recipient: decoded.userId }
        ]
      };
    }

    // Add "since" filter for polling new messages
    if (since) {
      query.createdAt = { $gt: new Date(since) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'firstName lastName email role')
      .populate('recipient', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments(query);

    return NextResponse.json({
      messages,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total
      }
    });

  } catch (error) {
    console.error('Błąd pobierania wiadomości:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}

// Wysyłanie wiadomości
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { recipient, content, messageType = 'text', attachments } = body;

    if (!recipient || !content) {
      return NextResponse.json(
        { error: 'Odbiorca i treść wiadomości są wymagane' },
        { status: 400 }
      );
    }

    // Sprawdzenie czy odbiorca istnieje
    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return NextResponse.json(
        { error: 'Odbiorca nie istnieje' },
        { status: 404 }
      );
    }

    const message = new Message({
      sender: decoded.userId,
      recipient,
      content,
      messageType,
      attachments: attachments || [],
    });

    const savedMessage = await message.save();
    
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('sender', 'firstName lastName email role')
      .populate('recipient', 'firstName lastName email role');

    // Audit log
    await AuditLogger.logCreate(
      decoded.userId,
      'message',
      savedMessage._id.toString(),
      {
        recipient: recipient,
        content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        messageType
      },
      request
    );

    return NextResponse.json(populatedMessage, { status: 201 });

  } catch (error) {
    console.error('Błąd wysyłania wiadomości:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}
