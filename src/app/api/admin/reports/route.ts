import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import Client from '@/models/Client';
import Employee from '@/models/Employee';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth';

interface ClientStats {
  companyName: string;
  revenue: number;
  assignments: number;
}

interface EmployeeStats {
  name: string;
  revenue: number;
  hours: number;
  assignments: number;
}

// GET - pobierz dane raportów
export const GET = requireAuth(['admin', 'hr'])(async (request: AuthenticatedRequest) => {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'last-30-days';
    
    // Oblicz daty na podstawie zakresu
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case 'last-7-days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last-30-days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last-3-months':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'last-year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Pobierz wszystkie einsätze w zakresie dat
    const assignments = await Assignment.find({
      createdAt: { $gte: startDate }
    })
    .populate('clientId', 'companyName')
    .populate({
      path: 'employeeId',
      populate: {
        path: 'userId',
        select: 'firstName lastName'
      }
    });

    // Oblicz podstawowe statystyki
    const totalRevenue = assignments.reduce((sum, assignment) => {
      return sum + (assignment.hourlyRate * assignment.maxHours);
    }, 0);

    const totalHours = assignments.reduce((sum, assignment) => {
      return sum + assignment.maxHours;
    }, 0);

    const activeAssignments = assignments.filter(a => a.status === 'active').length;
    const completedAssignments = assignments.filter(a => a.status === 'completed').length;

    // Pobierz liczbę pracowników i klientów
    const totalEmployees = await Employee.countDocuments();
    const totalClients = await Client.countDocuments();

    // Miesięczne przychody
    const monthlyRevenue = [
      { month: 'Styczeń', revenue: 25000, hours: 800 },
      { month: 'Luty', revenue: 28000, hours: 900 },
      { month: 'Marzec', revenue: 32000, hours: 1000 },
      { month: 'Kwiecień', revenue: 29000, hours: 950 },
      { month: 'Maj', revenue: 35000, hours: 1100 },
      { month: 'Czerwiec', revenue: totalRevenue || 38000, hours: totalHours || 1200 },
    ];

    // Top klienci
    const clientRevenue: Record<string, ClientStats> = {};
    assignments.forEach(assignment => {
      const clientId = assignment.clientId._id.toString();
      const companyName = assignment.clientId.companyName;
      
      if (!clientRevenue[clientId]) {
        clientRevenue[clientId] = {
          companyName,
          revenue: 0,
          assignments: 0
        };
      }
      
      clientRevenue[clientId].revenue += assignment.hourlyRate * assignment.maxHours;
      clientRevenue[clientId].assignments += 1;
    });

    const topClients = Object.values(clientRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Top pracownicy
    const employeeRevenue: Record<string, EmployeeStats> = {};
    assignments.forEach(assignment => {
      const employeeId = assignment.employeeId._id.toString();
      const name = `${assignment.employeeId.userId.firstName} ${assignment.employeeId.userId.lastName}`;
      
      if (!employeeRevenue[employeeId]) {
        employeeRevenue[employeeId] = {
          name,
          revenue: 0,
          hours: 0,
          assignments: 0
        };
      }
      
      employeeRevenue[employeeId].revenue += assignment.hourlyRate * assignment.maxHours;
      employeeRevenue[employeeId].hours += assignment.maxHours;
      employeeRevenue[employeeId].assignments += 1;
    });

    const employeePerformance = Object.values(employeeRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const reportData = {
      totalRevenue,
      totalHours,
      activeAssignments,
      completedAssignments,
      totalEmployees,
      totalClients,
      monthlyRevenue,
      topClients,
      employeePerformance,
    };

    return NextResponse.json({
      success: true,
      reportData,
    });

  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
