import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token ist erforderlich' },
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

      return NextResponse.json(
        { 
          success: true,
          email: decoded.email,
          userId: decoded.userId
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
    console.error('Verify reset token error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
