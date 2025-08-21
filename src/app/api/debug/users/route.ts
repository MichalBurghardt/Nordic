import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    
    const users = await User.find({}).select('email firstName lastName role isActive').limit(10);
    
    return NextResponse.json({
      success: true,
      count: users.length,
      users: users
    });

  } catch (error) {
    console.error('Błąd pobierania użytkowników:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}
