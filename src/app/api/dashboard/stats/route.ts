import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User, { Client } from '@/models/User';
import Employee from '@/models/Employee';
import Assignment from '@/models/Assignment';
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

    // Pobierz statystyki
    const [
      totalUsers,
      adminCount,
      hrCount,
      employeeCount,
      clientCount,
      totalClients,
      totalEmployees,
      totalAssignments,
      activeAssignments
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'admin', isActive: true }),
      User.countDocuments({ role: 'hr', isActive: true }),
      User.countDocuments({ role: 'employee', isActive: true }),
      User.countDocuments({ role: 'client', isActive: true }),
      Client.countDocuments({ isActive: true }),
      Employee.countDocuments({ status: 'active' }),
      Assignment.countDocuments(),
      Assignment.countDocuments({ status: 'active' })
    ]);

    const stats = {
      totalUsers,
      usersByRole: {
        admin: adminCount,
        hr: hrCount,
        employee: employeeCount,
        client: clientCount
      },
      totalClients,
      totalEmployees,
      totalAssignments,
      activeAssignments
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
