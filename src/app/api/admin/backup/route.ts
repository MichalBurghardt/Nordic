import { NextResponse } from 'next/server';
import { BackupService } from '@/lib/backup';
import fs from 'fs/promises';
import path from 'path';

// Endpoint do tworzenia backupu
export async function POST() {
  try {
    // TODO: Dodaj sprawdzanie autoryzacji gdy będzie gotowe
    
    const backupService = BackupService.getInstance();
    const result = await backupService.createBackup(false); // manual backup

    if (result.success) {
      return NextResponse.json({
        success: true,
        backup: result.backup
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Manual backup creation failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}

// Endpoint do pobierania listy backupów
export async function GET() {
  try {
    // TODO: Dodaj sprawdzanie autoryzacji gdy będzie gotowe

    const backupDir = path.join(process.cwd(), 'backups');
    
    try {
      const files = await fs.readdir(backupDir);
      const backupFiles = files.filter(file => file.endsWith('.json'));
      
      const backups = await Promise.all(
        backupFiles.map(async (filename) => {
          const filePath = path.join(backupDir, filename);
          const stats = await fs.stat(filePath);
          
          // Określ typ backupu na podstawie nazwy pliku
          const isAuto = filename.includes('auto') || filename.match(/backup_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/);
          
          return {
            id: filename.replace('.json', ''),
            filename,
            size: stats.size,
            createdAt: stats.birthtime.toISOString(),
            type: isAuto ? 'auto' : 'manual',
            status: 'success'
          };
        })
      );

      // Sortuj od najnowszych
      backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return NextResponse.json({
        success: true,
        backups
      });

    } catch {
      // Jeśli folder nie istnieje, zwróć pustą listę
      return NextResponse.json({
        success: true,
        backups: []
      });
    }

  } catch (error) {
    console.error('❌ Failed to list backups:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list backups' },
      { status: 500 }
    );
  }
}
