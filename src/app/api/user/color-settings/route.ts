import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth';

// GET - pobierz ustawienia kolorów użytkownika
export async function GET(request: NextRequest) {
  const authCheck = requireAuth()(async () => {
    try {
      await dbConnect();
      
      const userId = (request as AuthenticatedRequest).user?.userId;
      const user = await User.findById(userId).select('colorSettings');
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        colorSettings: user.colorSettings || {
          colorScheme: {
            primary: '#3B82F6',
            secondary: '#10B981',
            accent: '#F59E0B',
          },
          darknessLevels: {
            light: 0.1,
            medium: 0.3,
            dark: 0.7,
          },
          customColors: {
            primary: '#3B82F6',
            secondary: '#10B981',
            accent: '#F59E0B',
            light: '#F8FAFC',
            dark: '#1E293B',
          },
        },
      });

    } catch (error) {
      console.error('Get color settings error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });

  return authCheck(request as AuthenticatedRequest);
}

// PUT - zaktualizuj ustawienia kolorów użytkownika
export async function PUT(request: NextRequest) {
  const authCheck = requireAuth()(async () => {
    try {
      await dbConnect();
      
      const userId = (request as AuthenticatedRequest).user?.userId;
      const { colorSettings } = await request.json();

      if (!colorSettings) {
        return NextResponse.json(
          { error: 'Color settings are required' },
          { status: 400 }
        );
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { colorSettings },
        { new: true }
      ).select('colorSettings');

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Color settings updated successfully',
        colorSettings: user.colorSettings,
      });

    } catch (error) {
      console.error('Update color settings error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });

  return authCheck(request as AuthenticatedRequest);
}
