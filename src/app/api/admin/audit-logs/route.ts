import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Audit from '@/models/Audit';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Sprawdź czy użytkownik jest zalogowany i ma uprawnienia admina
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Brak uprawnień do przeglądania audit logs' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Filtry
    const action = searchParams.get('action');
    const resource = searchParams.get('resource');
    const userId = searchParams.get('userId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Buduj query
    const query: Record<string, unknown> = {};
    
    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (userId) query.userId = userId;
    
    if (dateFrom || dateTo) {
      query.timestamp = {};
      if (dateFrom) (query.timestamp as Record<string, unknown>).$gte = new Date(dateFrom);
      if (dateTo) (query.timestamp as Record<string, unknown>).$lte = new Date(dateTo);
    }

    // Pobierz audit logs z populacją użytkownika
    const auditLogs = await Audit.find(query)
      .populate('userId', 'firstName lastName email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Policz całkowitą liczbę rekordów
    const total = await Audit.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: auditLogs,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error('Audit logs fetch error:', error);
    return NextResponse.json(
      { error: 'Błąd podczas pobierania audit logs' },
      { status: 500 }
    );
  }
}

// Endpoint do pobierania statystyk audit logs
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Brak uprawnień' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type } = body; // 'stats' lub 'export'

    if (type === 'stats') {
      // Statystyki ostatnich 30 dni
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const stats = await Audit.aggregate([
        {
          $match: {
            timestamp: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 }
          }
        }
      ]);

      const resourceStats = await Audit.aggregate([
        {
          $match: {
            timestamp: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: '$resource',
            count: { $sum: 1 }
          }
        }
      ]);

      const dailyStats = await Audit.aggregate([
        {
          $match: {
            timestamp: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$timestamp'
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ]);

      return NextResponse.json({
        success: true,
        stats: {
          byAction: stats,
          byResource: resourceStats,
          daily: dailyStats,
        },
      });
    }

    return NextResponse.json(
      { error: 'Nieznany typ żądania' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Audit stats error:', error);
    return NextResponse.json(
      { error: 'Błąd podczas generowania statystyk' },
      { status: 500 }
    );
  }
}
