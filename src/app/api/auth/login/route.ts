import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User, { Client } from '@/models/User';
import { AuditLogger } from '@/lib/auditLogger';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    console.log('Próba logowania dla:', email);

    if (!email || !password) {
      console.log('Brak email lub password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Znajdź użytkownika
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('Znaleziony użytkownik:', user ? `${user.firstName} ${user.lastName}` : 'nie znaleziono');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Sprawdź hasło
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Sprawdź czy konto jest aktywne
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Wygeneruj JWT token
    const tokenPayload: Record<string, unknown> = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    // Jeśli to klient, dodaj clientId
    if (user.role === 'client') {
      const client = await Client.findOne({ email: user.email });
      if (client) {
        tokenPayload.clientId = client._id;
      }
    }

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });

    // Ustaw cookie z tokenem
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 86400, // 24 godziny
      path: '/', // Upewnij się, że cookie jest dostępne dla całej aplikacji
    });

    // Loguj udane logowanie
    await AuditLogger.logLogin(
      user._id.toString(),
      request,
      `Użytkownik ${user.firstName} ${user.lastName} zalogował się do systemu`
    );

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
