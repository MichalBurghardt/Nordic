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

    // Pobierz szczegółowe statystyki
    const [
      // Użytkownicy
      totalUsers,
      activeUsers,
      adminCount,
      hrCount,
      managerCount,
      employeeUserCount,
      clientUserCount,
      
      // Klienci
      totalClients,
      activeClients,
      inactiveClients,
      
      // Pracownicy
      totalEmployees,
      availableEmployees,
      employeesOnLeave,
      employeesOnSickLeave,
      employeesOnCompTime,
      employeesAwaitingAssignment,
      
      // Umowy/Assignments
      totalAssignments,
      activeAssignments,
      pendingAssignments,
      completedAssignments,
      
      // Pracownicy z umowami
      allEmployeesWithAssignments,
      employeesWithActiveAssignments,
      employeesWithPendingAssignments
    ] = await Promise.all([
      // Użytkownicy
      User.countDocuments(), // wszyscy użytkownicy
      User.countDocuments({ isActive: true }), // z loginem
      User.countDocuments({ role: 'admin', isActive: true }),
      User.countDocuments({ role: 'hr', isActive: true }),
      User.countDocuments({ role: 'manager', isActive: true }),
      User.countDocuments({ role: 'employee', isActive: true }),
      User.countDocuments({ role: 'client', isActive: true }),
      
      // Klienci
      Client.countDocuments(), // wszyscy klienci
      Client.countDocuments({ isActive: true }), // aktywni
      Client.countDocuments({ isActive: false }), // nieaktywni
      
      // Pracownicy (używając rzeczywistych statusów z bazy + nowe statusy)
      Employee.countDocuments(), // wszyscy pracownicy
      Employee.countDocuments({ status: 'available' }), // dostępni do pracy
      Employee.countDocuments({ status: 'on_leave' }), // na urlopie
      Employee.countDocuments({ status: 'sick_leave' }), // na chorobowym
      Employee.countDocuments({ status: 'comp_time' }), // wolne za nadgodziny
      Employee.countDocuments({ status: 'awaiting_assignment' }), // oczekujący na umowę
      
      // Umowy/Assignments (używając rzeczywistych statusów z bazy)
      Assignment.countDocuments(), // wszystkie umowy
      Assignment.countDocuments({ status: 'active' }), // w realizacji (74)
      Assignment.countDocuments({ status: 'pending' }), // oczekujące na realizację (19)
      Assignment.countDocuments({ status: 'completed' }), // zakończone (0 w obecnej bazie)
      
      // Dodatkowe statystyki pracowników z umowami
      Assignment.distinct('employeeId'), // unikalni pracownicy z jakąkolwiek umową (active + pending)
      Assignment.distinct('employeeId', { status: 'active' }), // pracownicy z aktywnymi umowami
      Assignment.distinct('employeeId', { status: 'pending' }) // pracownicy z oczekującymi umowami
    ]);

    const stats = {
      // Użytkownicy
      users: {
        total: totalUsers,
        withLogin: activeUsers,
        byRole: {
          admin: adminCount,
          hr: hrCount,
          employee: employeeUserCount,
          client: clientUserCount
        }
      },
      
      // Klienci
      clients: {
        total: totalClients,
        active: activeClients,
        inactive: inactiveClients
      },
      
      // Pracownicy
      employees: {
        total: totalEmployees,
        available: availableEmployees, // dostępni do pracy
        onLeave: employeesOnLeave, // na urlopie
        onSickLeave: employeesOnSickLeave, // na chorobowym
        onCompTime: employeesOnCompTime, // wolne za nadgodziny
        awaitingAssignment: employeesAwaitingAssignment, // oczekujący na umowę
        withAssignments: allEmployeesWithAssignments.length, // FIX: wszyscy z umowami (active + pending)
        withActiveWork: employeesWithActiveAssignments.length, // obecnie pracujący
        withPendingWork: employeesWithPendingAssignments.length, // czekający na rozpoczęcie
        withoutWork: totalEmployees - allEmployeesWithAssignments.length, // bez umów
        utilizationRate: totalEmployees > 0 ? Math.round((allEmployeesWithAssignments.length / totalEmployees) * 100) : 0 // % z umowami
      },
      
      // Umowy/Assignments
      assignments: {
        total: totalAssignments,
        inProgress: activeAssignments,
        pending: pendingAssignments,
        completed: completedAssignments
      },
      
      // Zachowanie kompatybilności z poprzednią wersją API
      totalUsers: activeUsers, // tylko z loginem
      usersByRole: {
        admin: adminCount,
        hr: hrCount,
        manager: managerCount,
        employee: employeeUserCount,
        client: clientUserCount
      },
      totalClients,
      totalEmployees,
      totalAssignments,
      activeAssignments,
      pendingAssignments
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
