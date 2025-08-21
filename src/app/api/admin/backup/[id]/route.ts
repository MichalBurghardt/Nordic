import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Endpoint do usuwania backupu
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Dodaj sprawdzanie autoryzacji gdy będzie gotowe
    
    const { id } = await params;
    const backupId = id;
    const filename = `${backupId}.json`;
    const backupPath = path.join(process.cwd(), 'backups', filename);

    try {
      await fs.access(backupPath);
      await fs.unlink(backupPath);
      
      console.log(`🗑️ Backup deleted: ${filename}`);
      
      return NextResponse.json({
        success: true,
        message: `Backup ${filename} deleted successfully`
      });
      
    } catch (fileError) {
      console.log('File not found:', fileError);
      return NextResponse.json(
        { success: false, error: 'Backup file not found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('❌ Failed to delete backup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete backup' },
      { status: 500 }
    );
  }
}
