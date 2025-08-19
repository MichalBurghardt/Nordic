import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token und Passwort sind erforderlich' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Passwort muss mindestens 6 Zeichen lang sein' },
        { status: 400 }
      );
    }

    try {
      // Sprawdź ważność tokenu
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
        purpose: string;
      };
      
      // Sprawdź czy token jest do resetowania hasła
      if (decoded.purpose !== 'password-reset') {
        return NextResponse.json(
          { error: 'Ungültiger Token-Typ' },
          { status: 400 }
        );
      }

      // Znajdź użytkownika
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return NextResponse.json(
          { error: 'Benutzer nicht gefunden' },
          { status: 404 }
        );
      }

      // Zahaszuj nowe hasło
      const hashedPassword = await bcrypt.hash(password, 10);

      // Aktualizuj hasło użytkownika
      await User.findByIdAndUpdate(decoded.userId, {
        password: hashedPassword,
        updatedAt: new Date()
      });

      return NextResponse.json(
        { 
          success: true,
          message: 'Passwort wurde erfolgreich zurückgesetzt'
        },
        { status: 200 }
      );

    } catch {
      return NextResponse.json(
        { error: 'Token ist ungültig oder abgelaufen' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
