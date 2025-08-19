import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import Client from '@/models/Client';
import Employee from '@/models/Employee';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth';

// GET - generuj i pobierz raport
export const GET = requireAuth(['admin', 'hr'])(async (request: AuthenticatedRequest) => {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'revenue';
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

    // Pobierz dane na podstawie typu raportu
    let reportData: (string | number)[][] = [];
    let headers = [''];
    const filename = `report-${type}-${range}.csv`;

    if (type === 'revenue') {
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

      headers = ['Klient', 'Pracownik', 'Stanowisko', 'Stawka/h', 'Godziny', 'Przychód', 'Status', 'Data rozpoczęcia'];
      reportData = assignments.map(assignment => [
        assignment.clientId?.companyName || 'N/A',
        `${assignment.employeeId?.userId?.firstName || ''} ${assignment.employeeId?.userId?.lastName || ''}`.trim() || 'N/A',
        assignment.position || 'N/A',
        `€${assignment.hourlyRate || 0}`,
        assignment.maxHours || 0,
        `€${(assignment.hourlyRate || 0) * (assignment.maxHours || 0)}`,
        assignment.status || 'N/A',
        assignment.startDate ? new Date(assignment.startDate).toLocaleDateString('de-DE') : 'N/A'
      ]);
    } else if (type === 'employees') {
      const employees = await Employee.find({
        createdAt: { $gte: startDate }
      }).populate('userId', 'firstName lastName email');

      headers = ['Imię', 'Nazwisko', 'Email', 'ID Pracownika', 'Umiejętności', 'Status', 'Dostępność', 'Data rejestracji'];
      reportData = employees.map(employee => [
        employee.userId?.firstName || 'N/A',
        employee.userId?.lastName || 'N/A',
        employee.userId?.email || 'N/A',
        employee.employeeId || 'N/A',
        employee.skills?.join(', ') || 'N/A',
        employee.status || 'N/A',
        employee.availability || 'N/A',
        employee.createdAt ? new Date(employee.createdAt).toLocaleDateString('de-DE') : 'N/A'
      ]);
    } else if (type === 'clients') {
      const clients = await Client.find({
        createdAt: { $gte: startDate }
      });

      headers = ['Nazwa firmy', 'Branża', 'Email', 'Telefon', 'Miasto', 'Status', 'Data rejestracji'];
      reportData = clients.map(client => [
        client.companyName || 'N/A',
        client.industry || 'N/A',
        client.contactEmail || 'N/A',
        client.contactPhone || 'N/A',
        client.address?.city || 'N/A',
        client.isActive ? 'Aktywny' : 'Nieaktywny',
        client.createdAt ? new Date(client.createdAt).toLocaleDateString('de-DE') : 'N/A'
      ]);
    }

    // Generuj CSV
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => 
        row.map((cell: string | number) => 
          typeof cell === 'string' && cell.includes(',') 
            ? `"${cell}"` 
            : cell
        ).join(',')
      )
    ].join('\n');

    // Zwróć plik CSV
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Download report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
