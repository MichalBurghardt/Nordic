import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - pobierz konkretnego klienta
export async function GET(
  request: AuthenticatedRequest,
  { params }: RouteParams
) {
  return requireAuth(['admin', 'hr'])(async () => {
    try {
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
        client,
      });

    } catch (error) {
      console.error('Get client error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

// PATCH - aktualizuj klienta
export async function PATCH(
  request: AuthenticatedRequest,
  { params }: RouteParams
) {
  return requireAuth(['admin', 'hr'])(async () => {
    try {
      await dbConnect();
      const { id } = await params;

      const updates = await request.json();
      const allowedUpdates = [
        'companyName',
        'contactPerson',
        'email',
        'phone',
        'address',
        'industry',
        'paymentTerms',
        'hourlyRate',
        'notes',
        'status',
      ];

      const updateData: Record<string, unknown> = {};
      for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
          updateData[key] = updates[key];
        }
      }

      const client = await Client.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!client) {
        return NextResponse.json(
          { error: 'Klient nie został znaleziony' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Klient został zaktualizowany',
        client,
      });

    } catch (error) {
      console.error('Update client error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}
