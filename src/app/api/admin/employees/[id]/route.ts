import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth';
import { AuditLogger } from '@/lib/auditLogger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - pobierz konkretnego pracownika
export async function GET(
  request: AuthenticatedRequest,
  { params }: RouteParams
) {
  return requireAuth(['admin', 'hr'])(async () => {
    try {
      await dbConnect();
      const { id } = await params;

      const employee = await Employee.findById(id)
        .populate('userId', 'firstName lastName email');

      if (!employee) {
        return NextResponse.json(
          { error: 'Pracownik nie został znaleziony' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        employee,
      });

    } catch (error) {
      console.error('Get employee error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

// PATCH - aktualizuj pracownika
export async function PATCH(
  request: AuthenticatedRequest,
  { params }: RouteParams
) {
  return requireAuth(['admin', 'hr'])(async () => {
    try {
      await dbConnect();
      const { id } = await params;

      const updates = await request.json();
      const allowedUpdates = [
        'employeeId',
        'hourlyRate',
        'skills',
        'availability',
        'bankAccount',
        'taxId',
        'socialSecurityNumber',
        'emergencyContact',
        'workPermit',
        'contractType',
        'status',
      ];

      // Pobierz istniejące dane do audit log
      const existingEmployee = await Employee.findById(id);
      if (!existingEmployee) {
        return NextResponse.json(
          { error: 'Pracownik nie został znaleziony' },
          { status: 404 }
        );
      }

      const oldData = existingEmployee.toObject();

      const updateData: Record<string, unknown> = {};
      for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
          updateData[key] = updates[key];
        }
      }

      const employee = await Employee.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('userId', 'firstName lastName email');

      if (!employee) {
        return NextResponse.json(
          { error: 'Pracownik nie został znaleziony' },
          { status: 404 }
        );
      }

      // Audit log - Employee update
      await AuditLogger.logUpdate(
        request.user?.userId || 'unknown',
        'Employee',
        id,
        AuditLogger.sanitizeData(oldData),
        AuditLogger.sanitizeData(employee.toObject()),
        request,
        `Zaktualizowano dane pracownika ${employee.employeeId}`
      );

      return NextResponse.json({
        success: true,
        message: 'Pracownik został zaktualizowany',
        employee,
      });

    } catch (error) {
      console.error('Update employee error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}