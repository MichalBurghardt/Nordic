import { NextResponse } from 'next/server';
import { initializeAutoBackup } from '@/lib/backup';

// Flaga globalna do śledzenia czy service jest już uruchomiony
let isServiceInitialized = false;

export async function GET() {
  try {
    if (isServiceInitialized) {
      return NextResponse.json({ 
        success: true, 
        message: 'Backup service is already running',
        status: 'running'
      });
    }

    // Uruchom backup service
    await initializeAutoBackup();
    isServiceInitialized = true;

    return NextResponse.json({
      success: true,
      message: 'Auto backup service initialized successfully',
      status: 'initialized'
    });

  } catch (error) {
    console.error('❌ Failed to initialize backup service:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initialize backup service',
        status: 'error'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  // Restart backup service
  try {
    isServiceInitialized = false;
    await initializeAutoBackup();
    isServiceInitialized = true;

    return NextResponse.json({
      success: true,
      message: 'Auto backup service restarted successfully',
      status: 'restarted'
    });

  } catch (error) {
    console.error('❌ Failed to restart backup service:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to restart backup service',
        status: 'error'
      },
      { status: 500 }
    );
  }
}
