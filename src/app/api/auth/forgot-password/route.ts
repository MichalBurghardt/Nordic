import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail-Adresse ist erforderlich' },
        { status: 400 }
      );
    }

    // Sprawdź czy użytkownik istnieje
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Ze względów bezpieczeństwa nie ujawniamy, czy email istnieje
      return NextResponse.json(
        { 
          success: true,
          message: 'Falls ein Konto mit dieser E-Mail-Adresse existiert, wurde ein Reset-Link gesendet.'
        },
        { status: 200 }
      );
    }

    // Generuj token resetowania hasła (ważny przez 1 godzinę)
    const resetToken = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        purpose: 'password-reset'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // W prawdziwej aplikacji wyślemy email z linkiem resetowania
    // Na razie zwracamy sukces i logujemy token do konsoli dla testów
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset link: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);

    // Tu będzie integracja z usługą emailową (np. SendGrid, Nodemailer, etc.)
    // await sendPasswordResetEmail(user.email, resetToken);

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    return NextResponse.json(
      { 
        success: true,
        message: 'Reset-Link wurde gesendet',
        // W produkcji nie zwracamy tokenu ani linku - jest tylko dla celów deweloperskich
        ...(process.env.NODE_ENV === 'development' && { 
          resetToken,
          resetLink
        })
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
