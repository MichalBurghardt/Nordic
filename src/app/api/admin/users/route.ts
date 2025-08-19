import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth';
import { AuditLogger } from '@/lib/auditLogger';

// GET - pobierz wszystkich użytkowników
export const GET = requireAuth(['admin'])(async (request: AuthenticatedRequest) => {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const roleFilter = searchParams.get('role') || '';
    const statusFilter = searchParams.get('status') || '';

    const skip = (page - 1) * limit;
    
    // Buduj filter
    const filter: Record<string, unknown> = {};
    
    // Wyszukiwanie tekstowe
    if (search) {
      filter.$or = [
        { lastName: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Filtrowanie po roli
    if (roleFilter) {
      filter.role = roleFilter;
    }
    
    // Filtrowanie po statusie
    if (statusFilter) {
      filter.isActive = statusFilter === 'active';
    }

    // Buduj sortowanie
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const users = await User.find(filter)
      .select('-password') // Nie zwracaj hasła
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        search,
        sortBy,
        sortOrder,
        roleFilter,
        statusFilter,
      },
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST - stwórz nowego użytkownika
export const POST = requireAuth(['admin'])(async (request: AuthenticatedRequest) => {
  try {
    await dbConnect();
    
    const { firstName, lastName, email, role, password, isActive } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !role || !password) {
      return NextResponse.json(
        { error: 'Alle Pflichtfelder müssen ausgefüllt werden' },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Passwort muss mindestens 6 Zeichen lang sein' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'E-Mail-Adresse wird bereits verwendet' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      isActive: isActive !== undefined ? isActive : true,
    });

    // Return user without password
    const userResponse = await User.findById(user._id).select('-password');

    // Audit log - User creation
    await AuditLogger.logCreate(
      request.user?.userId || 'unknown',
      'User',
      user._id.toString(),
      AuditLogger.sanitizeData(user.toObject()),
      request,
      `Utworzono nowego użytkownika: ${firstName} ${lastName} (${email})`
    );

    return NextResponse.json({
      success: true,
      message: 'Benutzer erfolgreich erstellt',
      user: userResponse,
    }, { status: 201 });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
});
