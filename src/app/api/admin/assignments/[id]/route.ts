import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - pobierz konkretny einsatz
export async function GET(
  request: AuthenticatedRequest,
  { params }: RouteParams
) {
  return requireAuth(['admin', 'hr', 'manager'])(async () => {
    try {
      await dbConnect();
      const { id } = await params;

      const assignment = await Assignment.findById(id)
        .populate('clientId', 'name contactPerson')
        .populate({
          path: 'employeeId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email'
          }
        });

      if (!assignment) {
        return NextResponse.json(
          { error: 'Einsatz nie został znaleziony' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        assignment,
      });

    } catch (error) {
      console.error('Get assignment error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

// PATCH - aktualizuj einsatz
export async function PATCH(
  request: AuthenticatedRequest,
  { params }: RouteParams
) {
  return requireAuth(['admin', 'hr', 'manager'])(async () => {
    try {
      await dbConnect();
      const { id } = await params;

      const updates = await request.json();
      const allowedUpdates = [
        'position',
        'startDate',
        'endDate',
        'workLocation',
        'hourlyRate',
        'maxHours',
        'description',
        'status',
        'requirements',
      ];

      const updateData: Record<string, unknown> = {};
      for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
          updateData[key] = updates[key];
        }
      }

      const assignment = await Assignment.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )
        .populate('clientId', 'name contactPerson')
        .populate({
          path: 'employeeId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email'
          }
        });

      if (!assignment) {
        return NextResponse.json(
          { error: 'Einsatz nie został znaleziony' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Einsatz został zaktualizowany',
        assignment,
      });

    } catch (error) {
      console.error('Update assignment error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

// PUT - pełna aktualizacja einsatz
export async function PUT(
  request: AuthenticatedRequest,
  { params }: RouteParams
) {
  return requireAuth(['admin', 'hr', 'manager'])(async () => {
    try {
      await dbConnect();
      const { id } = await params;

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
        status,
      } = data;

      // Walidacja
      if (!clientId || !employeeId || !position || !description || !startDate || !endDate || !workLocation || !hourlyRate || !maxHours) {
        return NextResponse.json(
          { error: 'Wszystkie wymagane pola muszą być wypełnione' },
          { status: 400 }
        );
      }

      // Sprawdź czy assignment istnieje
      const assignment = await Assignment.findById(id);
      if (!assignment) {
        return NextResponse.json(
          { error: 'Einsatz nie został znaleziony' },
          { status: 404 }
        );
      }

      // Sprawdź czy klient i pracownik istnieją
      const Client = (await import('@/models/Client')).default;
      const Employee = (await import('@/models/Employee')).default;
      
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

      // Aktualizuj assignment
      const updatedAssignment = await Assignment.findByIdAndUpdate(
        id,
        {
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
          status: status || assignment.status,
        },
        { new: true, runValidators: true }
      )
        .populate('clientId', 'name contactPerson')
        .populate({
          path: 'employeeId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email'
          }
        });

      return NextResponse.json({
        success: true,
        message: 'Einsatz został zaktualizowany pomyślnie',
        assignment: updatedAssignment,
      });

    } catch (error) {
      console.error('Update assignment error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

// DELETE - usuń einsatz
export async function DELETE(
  request: AuthenticatedRequest,
  { params }: RouteParams
) {
  return requireAuth(['admin'])(async () => {
    try {
      await dbConnect();
      const { id } = await params;

      const assignment = await Assignment.findById(id);
      if (!assignment) {
        return NextResponse.json(
          { error: 'Einsatz nie został znaleziony' },
          { status: 404 }
        );
      }

      await Assignment.findByIdAndDelete(id);

      return NextResponse.json({
        success: true,
        message: 'Einsatz został usunięty pomyślnie',
      });

    } catch (error) {
      console.error('Delete assignment error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}
