import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Schedule from '@/models/Schedule';
import Employee from '@/models/Employee';
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

    // Tylko klienci mogą korzystać z tego API
    if (decoded.role !== 'client' || !decoded.clientId) {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get('weekStart');

    const query: Record<string, unknown> = {
      clientId: decoded.clientId // Tylko harmonogramy tego klienta
    };

    // Filtruj po tygodniu jeśli podano
    if (weekStart) {
      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6); // 7 dni

      query.startDate = { $gte: startDate };
      query.endDate = { $lte: endDate };
    }

    const schedules = await Schedule.find(query)
      .populate('employeeId', 'employeeId userId')
      .populate('clientId', 'name nordicClientNumber')
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 });

    return NextResponse.json({
      success: true,
      schedules
    });

  } catch (error) {
    console.error('Client Schedule GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Tylko klienci mogą korzystać z tego API
    if (decoded.role !== 'client' || !decoded.clientId) {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
    }

    const body = await request.json();
    const {
      employeeId,
      startDate,
      endDate,
      startTime,
      endTime,
      weeklyHours,
      notes
    } = body;

    // Walidacja wymaganych pól
    if (!employeeId || !startDate || !endDate || !startTime || !endTime || !weeklyHours) {
      return NextResponse.json(
        { error: 'Wszystkie wymagane pola muszą być wypełnione' },
        { status: 400 }
      );
    }

    // Sprawdź czy pracownik istnieje
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json(
        { error: 'Pracownik nie został znaleziony' },
        { status: 404 }
      );
    }

    // Sprawdź konflikty w harmonogramie
    const conflicts = await Schedule.find({
      employeeId,
      status: { $in: ['planned', 'confirmed', 'active'] },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ]
    });

    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: 'Pracownik ma już zaplanowany termin w tym okresie' },
        { status: 409 }
      );
    }

    const schedule = new Schedule({
      employeeId,
      clientId: decoded.clientId, // Automatycznie ustaw klienta
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime,
      endTime,
      weeklyHours: Number(weeklyHours),
      notes,
      createdBy: decoded.userId,
      status: 'planned' // Klienci mogą tylko planować, HR musi potwierdzić
    });

    await schedule.save();

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('employeeId', 'employeeId userId')
      .populate('clientId', 'name nordicClientNumber')
      .populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      schedule: populatedSchedule
    });

  } catch (error) {
    console.error('Client Schedule POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
