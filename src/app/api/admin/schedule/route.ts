import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Schedule from '@/models/Schedule';
import Employee from '@/models/Employee';
import { Client } from '@/models/User';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { AuditLogger } from '@/lib/auditLogger';

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
    const weekStart = searchParams.get('weekStart');
    const employeeId = searchParams.get('employeeId');
    const clientId = searchParams.get('clientId');

    const query: Record<string, unknown> = {};

    // Filtruj po tygodniu jeśli podano
    if (weekStart) {
      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6); // 7 dni

      // Znajdź schedules które nakładają się z tym tygodniem
      // Schedule nakłada się jeśli: schedule.endDate >= weekStart AND schedule.startDate <= weekEnd
      query.$and = [
        { endDate: { $gte: startDate } },
        { startDate: { $lte: endDate } }
      ];
    }

    // Filtruj po pracowniku
    if (employeeId) {
      query.employeeId = employeeId;
    }

    // Filtruj po kliencie
    if (clientId) {
      query.clientId = clientId;
    }

    const schedules = await Schedule.find(query)
      .populate({
        path: 'employeeId',
        select: 'employeeId userId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('clientId', 'name nordicClientNumber')
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 });

    console.log(`📅 Schedule API: Found ${schedules.length} schedules for query:`, JSON.stringify(query, null, 2));
    if (schedules.length > 0) {
      console.log('📅 First schedule:', JSON.stringify(schedules[0], null, 2));
    }

    return NextResponse.json({
      success: true,
      schedules
    });

  } catch (error) {
    console.error('Schedule GET error:', error);
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

    const body = await request.json();
    const {
      employeeId,
      clientId,
      startDate,
      endDate,
      startTime,
      endTime,
      weeklyHours,
      notes
    } = body;

    // Walidacja wymaganych pól
    if (!employeeId || !clientId || !startDate || !endDate || !startTime || !endTime || !weeklyHours) {
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

    // Sprawdź czy klient istnieje
    const client = await Client.findById(clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Klient nie został znaleziony' },
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
      clientId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime,
      endTime,
      weeklyHours: Number(weeklyHours),
      notes,
      createdBy: decoded.userId,
      status: 'planned'
    });

    await schedule.save();

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('employeeId', 'employeeId userId')
      .populate('clientId', 'name nordicClientNumber')
      .populate('createdBy', 'name email');

    // Audit log - Schedule creation
    await AuditLogger.logCreate(
      decoded.userId,
      'Schedule',
      schedule._id.toString(),
      AuditLogger.sanitizeData(schedule.toObject()),
      request,
      `Utworzono nowy harmonogram dla pracownika ${employee.employeeId} i klienta ${client.name}`
    );

    return NextResponse.json({
      success: true,
      schedule: populatedSchedule
    });

  } catch (error) {
    console.error('Schedule POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
