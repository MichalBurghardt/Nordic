import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User, { Client } from '@/models/User';
import Employee from '@/models/Employee';
import Assignment from '@/models/Assignment';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth';

// POST - wyczyść całą bazę danych (tylko dla administratorów)
export const POST = requireAuth(['admin'])(async (request: AuthenticatedRequest) => {
  try {
    await dbConnect();
    
    const { confirm } = await request.json();
    
    // Zabezpieczenie - wymaga potwierdzenia
    if (confirm !== 'DELETE_ALL_DATA') {
      return NextResponse.json(
        { error: 'Confirmation required. Send { "confirm": "DELETE_ALL_DATA" }' },
        { status: 400 }
      );
    }

    // Usuń wszystkie kolekcje
    const deleteResults = await Promise.all([
      Assignment.deleteMany({}),
      Employee.deleteMany({}),
      Client.deleteMany({}),
      User.deleteMany({}),
    ]);

    const totalDeleted = deleteResults.reduce((sum, result) => sum + result.deletedCount, 0);

    return NextResponse.json({
      success: true,
      message: 'Database cleared successfully',
      deletedDocuments: {
        assignments: deleteResults[0].deletedCount,
        employees: deleteResults[1].deletedCount,
        clients: deleteResults[2].deletedCount,
        users: deleteResults[3].deletedCount,
        total: totalDeleted,
      },
    });

  } catch (error) {
    console.error('Database clear error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// GET - sprawdź ile dokumentów jest w bazie
export const GET = requireAuth(['admin'])(async () => {
  try {
    await dbConnect();
    
    const [
      totalUsers,
      adminCount,
      hrCount,
      employeeCount,
      clientCount,
      totalClients,
      totalEmployees,
      totalAssignments
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'hr' }),
      User.countDocuments({ role: 'employee' }),
      User.countDocuments({ role: 'client' }),
      Client.countDocuments(),
      Employee.countDocuments(),
      Assignment.countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      collections: {
        users: totalUsers,
        usersByRole: {
          admin: adminCount,
          hr: hrCount,
          employee: employeeCount,
          client: clientCount
        },
        clients: totalClients,
        employees: totalEmployees,
        assignments: totalAssignments,
        total: totalUsers + totalClients + totalEmployees + totalAssignments,
      },
    });

  } catch (error) {
    console.error('Database count error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
