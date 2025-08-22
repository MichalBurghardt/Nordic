import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import Employee from '@/models/Employee';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth';
import { AuditLogger } from '@/lib/auditLogger';

// GET - pobierz wszystkie einsätze
export const GET = requireAuth(['admin', 'hr', 'manager'])(async (request: AuthenticatedRequest) => {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;
    
    // Buduj filter
    const filter: Record<string, unknown> = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      // Przeszukaj po klientach i pracownikach
      const Client = (await import('@/models/Client')).default;
      const User = (await import('@/models/User')).default;
      
      const matchingClients = await Client.find({
        name: { $regex: search, $options: 'i' }
      }).select('_id');
      
      const matchingUsers = await User.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const matchingEmployees = await Employee.find({
        userId: { $in: matchingUsers.map(u => u._id) }
      }).select('_id');
      
      filter.$or = [
        { clientId: { $in: matchingClients.map(c => c._id) } },
        { employeeId: { $in: matchingEmployees.map(e => e._id) } },
        { position: { $regex: search, $options: 'i' } },
        { workLocation: { $regex: search, $options: 'i' } }
      ];
    }

    const assignments = await Assignment.find(filter)
      .populate('clientId', 'name')
      .populate({
        path: 'employeeId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Assignment.countDocuments(filter);

    return NextResponse.json({
      success: true,
      assignments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Get assignments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST - utwórz nowy einsatz
export const POST = requireAuth(['admin', 'hr', 'manager'])(async (request: AuthenticatedRequest) => {
  try {
    await dbConnect();
    
    const data = await request.json();
    const {
      clientId,
      employeeId,
      position,
      description,
      startDate,
      endDate,
      workLocation,
      hourlyRate,
      maxHours,
      requirements,
    } = data;

    // Walidacja
    if (!clientId || !employeeId || !position || !description || !startDate || !endDate || !workLocation || !hourlyRate || !maxHours) {
      return NextResponse.json(
        { error: 'Wszystkie wymagane pola muszą być wypełnione' },
        { status: 400 }
      );
    }

    // Sprawdź czy klient i pracownik istnieją
    const Client = (await import('@/models/Client')).default;
    
    const client = await Client.findById(clientId);
    const employee = await Employee.findById(employeeId);
    
    if (!client) {
      return NextResponse.json(
        { error: 'Klient nie został znaleziony' },
        { status: 404 }
      );
    }
    
    if (!employee) {
      return NextResponse.json(
        { error: 'Pracownik nie został znaleziony' },
        { status: 404 }
      );
    }

    const assignment = new Assignment({
      clientId,
      employeeId,
      position,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      workLocation,
      hourlyRate: parseFloat(hourlyRate),
      maxHours: parseFloat(maxHours),
      requirements: requirements || [],
      status: 'pending',
      createdBy: request.user!.userId,
    });

    await assignment.save();

    // Loguj utworzenie einsatz
    await AuditLogger.logCreate(
      request.user!.userId,
      'Assignment',
      assignment._id.toString(),
      AuditLogger.sanitizeData(assignment.toObject()),
      request,
      `Utworzono nowy einsatz: ${assignment.position} dla klienta ${client.name}`
    );

    // Populate dla response
    await assignment.populate('clientId', 'name contactPerson');
    await assignment.populate({
      path: 'employeeId',
      populate: {
        path: 'userId',
        select: 'firstName lastName email'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Einsatz został utworzony pomyślnie',
      assignment,
    }, { status: 201 });

  } catch (error) {
    console.error('Create assignment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
