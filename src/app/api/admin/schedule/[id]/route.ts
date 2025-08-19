import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Schedule from '@/models/Schedule';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { AuditLogger } from '@/lib/auditLogger';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Token wymagany' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Nieprawidłowy token' }, { status: 401 });
    }

    const body = await request.json();
    const scheduleId = id;

    const existingSchedule = await Schedule.findById(scheduleId);
    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Harmonogram nie został znaleziony' },
        { status: 404 }
      );
    }

    // Zapisz stare dane do audit log
    const oldData = existingSchedule.toObject();

    // Aktualizuj tylko podane pola
    Object.keys(body).forEach(key => {
      if (key !== '_id' && key !== 'createdBy' && key !== 'createdAt') {
        if (key === 'startDate' || key === 'endDate') {
          existingSchedule[key as keyof typeof existingSchedule] = new Date(body[key]);
        } else {
          existingSchedule[key as keyof typeof existingSchedule] = body[key];
        }
      }
    });

    await existingSchedule.save();

    const populatedSchedule = await Schedule.findById(existingSchedule._id)
      .populate('employeeId', 'employeeId userId')
      .populate('clientId', 'name nordicClientNumber')
      .populate('createdBy', 'name email');

    // Audit log - Schedule update
    await AuditLogger.logUpdate(
      decoded.userId,
      'Schedule',
      scheduleId,
      AuditLogger.sanitizeData(oldData),
      AuditLogger.sanitizeData(existingSchedule.toObject()),
      request,
      `Zaktualizowano harmonogram ID: ${scheduleId}`
    );

    return NextResponse.json({
      success: true,
      schedule: populatedSchedule
    });

  } catch (error) {
    console.error('Schedule PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Token wymagany' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Nieprawidłowy token' }, { status: 401 });
    }

    const scheduleId = id;

    const schedule = await Schedule.findById(scheduleId)
      .populate('employeeId', 'employeeId userId')
      .populate('clientId', 'name nordicClientNumber');
      
    if (!schedule) {
      return NextResponse.json(
        { error: 'Harmonogram nie został znaleziony' },
        { status: 404 }
      );
    }

    // Zapisz dane do audit log przed usunięciem
    const scheduleData = schedule.toObject();

    await Schedule.findByIdAndDelete(scheduleId);

    // Audit log - Schedule deletion
    await AuditLogger.logDelete(
      decoded.userId,
      'Schedule',
      scheduleId,
      AuditLogger.sanitizeData(scheduleData),
      request,
      `Usunięto harmonogram dla pracownika ${schedule.employeeId.employeeId} i klienta ${schedule.clientId.name}`
    );

    return NextResponse.json({
      success: true,
      message: 'Harmonogram został usunięty'
    });

  } catch (error) {
    console.error('Schedule DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
