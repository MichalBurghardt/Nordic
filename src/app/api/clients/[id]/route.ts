import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { AuditLogger } from '@/lib/auditLogger';

// GET - pobierz pojedynczego klienta
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Sprawdź autoryzację
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Wymagana autoryzacja' }, { status: 401 });
    }
    
    const user = verifyToken(token);
    if (!user || !['admin', 'hr'].includes(user.role)) {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
    }

    await dbConnect();
    
    const { id } = await params;
    const client = await Client.findById(id);
    
    if (!client) {
      return NextResponse.json(
        { error: 'Klient nie został znaleziony' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: client,
    });

  } catch (error) {
    console.error('Get client error:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}

// PUT - aktualizuj klienta
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Sprawdź autoryzację
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Wymagana autoryzacja' }, { status: 401 });
    }
    
    const user = verifyToken(token);
    if (!user || !['admin', 'hr'].includes(user.role)) {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    
    const data = await request.json();
    const {
      name,
      contactPerson,
      email,
      phoneNumber,
      address,
      industry,
      taxNumber,
      description,
      isActive,
    } = data;

    // Walidacja
    if (!name || !contactPerson || !email || !phoneNumber || !address || !industry) {
      return NextResponse.json(
        { error: 'Wymagane pola: nazwa firmy, osoba kontaktowa, email, telefon, adres, branża' },
        { status: 400 }
      );
    }

    // Sprawdź czy klient istnieje
    const existingClient = await Client.findById(id);
    if (!existingClient) {
      return NextResponse.json(
        { error: 'Klient nie został znaleziony' },
        { status: 404 }
      );
    }

    // Sprawdź czy nazwa firmy lub email już istnieją (ale nie u tego samego klienta)
    const duplicateClient = await Client.findOne({
      _id: { $ne: id },
      $or: [
        { email: email.toLowerCase() },
        { name: name.trim() },
      ],
    });

    if (duplicateClient) {
      return NextResponse.json(
        { error: 'Klient z tą nazwą firmy lub emailem już istnieje' },
        { status: 409 }
      );
    }

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        contactPerson: contactPerson.trim(),
        email: email.toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        address,
        industry: industry.trim(),
        taxNumber: taxNumber?.trim(),
        description: description?.trim(),
        isActive: isActive !== undefined ? isActive : existingClient.isActive,
      },
      { new: true, runValidators: true }
    );

    // Loguj aktualizację klienta
    await AuditLogger.logUpdate(
      user.userId,
      'Client',
      id,
      AuditLogger.sanitizeData(existingClient.toObject()),
      AuditLogger.sanitizeData(updatedClient!.toObject()),
      request,
      `Zaktualizowano klienta: ${updatedClient!.name}`
    );

    return NextResponse.json({
      success: true,
      message: 'Klient został zaktualizowany pomyślnie',
      data: updatedClient,
    });

  } catch (error) {
    console.error('Update client error:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}

// PATCH - aktualizuj status klienta
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Sprawdź autoryzację
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Wymagana autoryzacja' }, { status: 401 });
    }
    
    const user = verifyToken(token);
    if (!user || !['admin', 'hr'].includes(user.role)) {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    
    const { isActive } = await request.json();

    const client = await Client.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!client) {
      return NextResponse.json(
        { error: 'Klient nie został znaleziony' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Status klienta został ${isActive ? 'aktywowany' : 'deaktywowany'}`,
      data: client,
    });

  } catch (error) {
    console.error('Update client status error:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}

// DELETE - usuń klienta
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Sprawdź autoryzację
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Wymagana autoryzacja' }, { status: 401 });
    }
    
    const user = verifyToken(token);
    if (!user || !['admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    
    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      return NextResponse.json(
        { error: 'Klient nie został znaleziony' },
        { status: 404 }
      );
    }

    // Loguj usunięcie klienta
    await AuditLogger.logDelete(
      user.userId,
      'Client',
      id,
      AuditLogger.sanitizeData(client.toObject()),
      request,
      `Usunięto klienta: ${client.name}`
    );

    return NextResponse.json({
      success: true,
      message: 'Klient został usunięty pomyślnie',
    });

  } catch (error) {
    console.error('Delete client error:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}
