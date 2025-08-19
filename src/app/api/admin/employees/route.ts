import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth';

// GET - pobierz wszystkich pracowników
export const GET = requireAuth(['admin', 'hr'])(async (request: AuthenticatedRequest) => {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;
    
    // Buduj filter
    const filter: Record<string, unknown> = {};
    if (search) {
      // Pobierz najpierw userów których szukamy
      const User = (await import('@/models/User')).default;
      const matchingUsers = await User.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      
      const userIds = matchingUsers.map(user => user._id);
      
      filter.$or = [
        { userId: { $in: userIds } },
        { employeeId: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const employees = await Employee.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Employee.countDocuments(filter);

    return NextResponse.json({
      success: true,
      employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Get employees error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
