import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth';
import { AuditLogger } from '@/lib/auditLogger';

// GET - pobierz pojedynczego użytkownika
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = requireAuth(['admin'])(async () => {
    try {
      await dbConnect();
      
      const { id } = await params;
      const user = await User.findById(id).select('-password');
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user,
      });

    } catch (error) {
      console.error('Get user error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });

  return authCheck(request as AuthenticatedRequest);
}

// PATCH - aktualizuj użytkownika
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = requireAuth(['admin'])(async () => {
    try {
      await dbConnect();
      
      const data = await request.json();
      const { isActive, role, firstName, lastName, email } = data;

      const { id } = await params;
      
      // Pobierz istniejące dane do audit log
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const oldData = existingUser.toObject();

      const updateData: Record<string, unknown> = {};
      if (isActive !== undefined) updateData.isActive = isActive;
      if (role) updateData.role = role;
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (email) updateData.email = email;

      const user = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).select('-password');

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Określ typ zmiany dla audit log
      let actionDescription = '';
      if (isActive !== undefined) {
        actionDescription = isActive 
          ? `Aktiviert użytkownika: ${user.firstName} ${user.lastName} (${user.email})`
          : `Deaktiviert użytkownika: ${user.firstName} ${user.lastName} (${user.email})`;
      } else if (role) {
        actionDescription = `Zmieniono rolę użytkownika: ${user.firstName} ${user.lastName} na ${role}`;
      } else {
        actionDescription = `Zaktualizowano dane użytkownika: ${user.firstName} ${user.lastName}`;
      }

      // Audit log - User update
      await AuditLogger.logUpdate(
        (request as AuthenticatedRequest).user?.userId || 'unknown',
        'User',
        id,
        AuditLogger.sanitizeData(oldData),
        AuditLogger.sanitizeData(user.toObject()),
        request,
        actionDescription
      );

      return NextResponse.json({
        success: true,
        message: 'User updated successfully',
        user,
      });

    } catch (error) {
      console.error('Update user error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });

  return authCheck(request as AuthenticatedRequest);
}

// PUT - aktualizuj użytkownika (pełna aktualizacja)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = requireAuth(['admin'])(async () => {
    try {
      await dbConnect();
      
      const data = await request.json();
      const { firstName, lastName, email, role, isActive, password } = data;

      // Validate required fields
      if (!firstName || !lastName || !email || !role) {
        return NextResponse.json(
          { error: 'Alle Pflichtfelder müssen ausgefüllt werden' },
          { status: 400 }
        );
      }

      const { id } = await params;
      
      // Pobierz istniejące dane do audit log
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return NextResponse.json(
          { error: 'Benutzer nicht gefunden' },
          { status: 404 }
        );
      }

      // Check if email is already in use by another user
      const emailConflict = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      
      if (emailConflict) {
        return NextResponse.json(
          { error: 'E-Mail-Adresse wird bereits verwendet' },
          { status: 400 }
        );
      }

      const oldData = existingUser.toObject();

      const updateData: Record<string, unknown> = {
        firstName,
        lastName,
        email: email.toLowerCase(),
        role,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
      };

      // Hash password if provided
      if (password) {
        if (password.length < 6) {
          return NextResponse.json(
            { error: 'Passwort muss mindestens 6 Zeichen lang sein' },
            { status: 400 }
          );
        }
        updateData.password = await bcrypt.hash(password, 10);
      }

      const user = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).select('-password');

      if (!user) {
        return NextResponse.json(
          { error: 'Benutzer nicht gefunden' },
          { status: 404 }
        );
      }

      // Audit log - User update
      await AuditLogger.logUpdate(
        (request as AuthenticatedRequest).user?.userId || 'unknown',
        'User',
        id,
        AuditLogger.sanitizeData(oldData),
        AuditLogger.sanitizeData(user.toObject()),
        request,
        `Zaktualizowano użytkownika: ${firstName} ${lastName} (${email})`
      );

      return NextResponse.json({
        success: true,
        message: 'Benutzer erfolgreich aktualisiert',
        user,
      });

    } catch (error) {
      console.error('Update user error:', error);
      return NextResponse.json(
        { error: 'Interner Serverfehler' },
        { status: 500 }
      );
    }
  });

  return authCheck(request as AuthenticatedRequest);
}

// DELETE - usuń użytkownika
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = requireAuth(['admin'])(async () => {
    try {
      await dbConnect();
      
      const { id } = await params;
      
      // Sprawdź czy użytkownik istnieje
      const user = await User.findById(id).select('-password');
      if (!user) {
        return NextResponse.json(
          { error: 'Benutzer nicht gefunden' },
          { status: 404 }
        );
      }

      // Nie pozwól na usunięcie samego siebie
      const currentUserId = (request as AuthenticatedRequest).user?.userId;
      if (currentUserId === id) {
        return NextResponse.json(
          { error: 'Sie können sich selbst nicht löschen' },
          { status: 400 }
        );
      }

      // Usuń użytkownika
      await User.findByIdAndDelete(id);

      // Audit log - User deletion
      await AuditLogger.logDelete(
        currentUserId || 'unknown',
        'User',
        id,
        AuditLogger.sanitizeData(user.toObject()),
        request,
        `Usunięto użytkownika: ${user.firstName} ${user.lastName} (${user.email})`
      );

      return NextResponse.json({
        success: true,
        message: 'Benutzer erfolgreich gelöscht',
      });

    } catch (error) {
      console.error('Delete user error:', error);
      return NextResponse.json(
        { error: 'Interner Serverfehler' },
        { status: 500 }
      );
    }
  });

  return authCheck(request as AuthenticatedRequest);
}
