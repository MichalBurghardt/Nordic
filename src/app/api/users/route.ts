import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
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

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const baseQuery = { 
      isActive: true,
      _id: { $ne: decoded.userId } // Wykluczenie siebie z listy
    };

    const query = role && role !== 'all' 
      ? { ...baseQuery, role } 
      : baseQuery;

    const users = await User.find(query)
      .select('firstName lastName email role')
      .sort({ firstName: 1, lastName: 1 });

    // Grupowanie użytkowników według ról
    const usersByRole = {
      admin: users.filter(user => user.role === 'admin'),
      hr: users.filter(user => user.role === 'hr'),
      employee: users.filter(user => user.role === 'employee'),
      client: users.filter(user => user.role === 'client'),
    };

    return NextResponse.json({
      users,
      usersByRole,
      roles: [
        { value: 'admin', label: 'Administratorzy', count: usersByRole.admin.length },
        { value: 'hr', label: 'HR', count: usersByRole.hr.length },
        { value: 'employee', label: 'Pracownicy', count: usersByRole.employee.length },
        { value: 'client', label: 'Klienci', count: usersByRole.client.length },
      ]
    });

  } catch (error) {
    console.error('Błąd pobierania użytkowników:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}
