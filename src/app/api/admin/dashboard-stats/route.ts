import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Client from '@/models/Client';
import Employee from '@/models/Employee';
import Assignment from '@/models/Assignment';
import { requireAuth } from '@/lib/auth';

// GET - pobierz statystyki dashboard
export const GET = requireAuth(['admin', 'hr'])(async () => {
  try {
    await dbConnect();

    // Pobierz wszystkie statystyki równolegle
    const [
      usersCount,
      clientsCount,
      employeesCount,
      assignmentsCount,
      activeAssignments,
      pendingAssignments,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Client.countDocuments({ isActive: true }),
      Employee.countDocuments(),
      Assignment.countDocuments(),
      Assignment.countDocuments({ status: 'active' }),
      Assignment.countDocuments({ status: 'pending' }),
    ]);

    const stats = {
      users: usersCount,
      clients: clientsCount,
      employees: employeesCount,
      assignments: assignmentsCount,
      activeAssignments,
      pendingAssignments,
    };

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
