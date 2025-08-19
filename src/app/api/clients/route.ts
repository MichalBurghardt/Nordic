import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Client } from '@/models/User';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth';
import { AuditLogger } from '@/lib/auditLogger';

// GET - pobierz wszystkich klientów
export const GET = requireAuth(['admin', 'hr'])(async (request: AuthenticatedRequest) => {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');
    const industry = searchParams.get('industry');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const skip = (page - 1) * limit;
    
    // Buduj filter
    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { nordicClientNumber: { $regex: search, $options: 'i' } },
        { clientReferenceNumber: { $regex: search, $options: 'i' } },
      ];
    }
    if (isActive !== null && isActive !== '') {
      filter.isActive = isActive === 'true';
    }
    if (industry) {
      filter.industry = { $regex: industry, $options: 'i' };
    }

    // Buduj sortowanie
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const clients = await Client.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Client.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: clients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Get clients error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST - utwórz nowego klienta
export const POST = requireAuth(['admin', 'hr'])(async (request: AuthenticatedRequest) => {
  try {
    await dbConnect();
    
    const data = await request.json();
    const {
      name,
      contactPerson,
      email,
      phoneNumber,
      nordicClientNumber,
      clientReferenceNumber,
      address,
      industry,
      taxNumber,
      description,
    } = data;

    // Walidacja
    if (!name || !contactPerson || !email || !phoneNumber || !nordicClientNumber || !address || !industry) {
      return NextResponse.json(
        { error: 'Required fields: name, contactPerson, email, phoneNumber, nordicClientNumber, address, industry' },
        { status: 400 }
      );
    }

    // Sprawdź czy klient już istnieje
    const existingClient = await Client.findOne({
      $or: [
        { email: email.toLowerCase() },
        { name: name.trim() },
        { nordicClientNumber: nordicClientNumber.trim() },
      ],
    });

    if (existingClient) {
      return NextResponse.json(
        { error: 'Client with this name, email or Nordic client number already exists' },
        { status: 409 }
      );
    }

    const client = new Client({
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      email: email.toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      nordicClientNumber: nordicClientNumber.trim(),
      clientReferenceNumber: clientReferenceNumber?.trim(),
      address,
      industry: industry.trim(),
      taxNumber: taxNumber?.trim(),
      description: description?.trim(),
    });

    await client.save();

    // Loguj utworzenie klienta
    await AuditLogger.logCreate(
      request.user!.userId,
      'Client',
      client._id.toString(),
      AuditLogger.sanitizeData(client.toObject()),
      request,
      `Utworzono nowego klienta: ${client.name}`
    );

    return NextResponse.json({
      success: true,
      message: 'Client created successfully',
      data: client,
    }, { status: 201 });

  } catch (error) {
    console.error('Create client error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
