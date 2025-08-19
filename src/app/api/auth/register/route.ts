import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { AuditLogger } from '@/lib/auditLogger';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email, password, firstName, lastName, role = 'employee' } = await request.json();

    // Walidacja
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Sprawdź czy użytkownik już istnieje
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hashuj hasło
    const hashedPassword = await bcrypt.hash(password, 12);

    // Utwórz nowego użytkownika
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role,
    });

    await user.save();

    // Audit log - User registration
    await AuditLogger.logCreate(
      user._id.toString(),
      'User',
      user._id.toString(),
      AuditLogger.sanitizeData(user.toObject()),
      request,
      `Nowy użytkownik zarejestrowany: ${user.email}`
    );

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
