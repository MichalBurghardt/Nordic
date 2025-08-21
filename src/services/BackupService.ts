import mongoose from 'mongoose';
import SystemSettings from '@/models/SystemSettings';
import fs from 'fs/promises';
import path from 'path';

interface BackupData {
  timestamp: string;
  version: string;
  collections: { [key: string]: unknown[] };
}

class BackupService {
  private static instance: BackupService;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  private constructor() {}

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  async createBackup(isAutomatic = false): Promise<{ success: boolean; backup?: object; error?: string }> {
    try {
      console.log(`📦 ${isAutomatic ? 'Auto' : 'Manual'} backup started...`);

      // Sprawdź połączenie z bazą danych
      if (!mongoose.connection.db) {
        throw new Error('Database not connected');
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const prefix = isAutomatic ? 'auto' : 'manual';
      const filename = `backup_${timestamp}_${prefix}.json`;
      const backupPath = path.join(process.cwd(), 'backups', filename);

      // Sprawdź czy folder backups istnieje
      const backupDir = path.join(process.cwd(), 'backups');
      try {
        await fs.access(backupDir);
      } catch {
        await fs.mkdir(backupDir, { recursive: true });
      }

      // Pobierz wszystkie kolekcje z bazy danych
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      
      const backupData: BackupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        collections: {}
      };

      let totalDocuments = 0;

      // Eksportuj każdą kolekcję
      for (const collectionInfo of collections) {
        const collectionName = collectionInfo.name;
        try {
          const collection = db.collection(collectionName);
          const documents = await collection.find({}).toArray();
          backupData.collections[collectionName] = documents;
          totalDocuments += documents.length;
          console.log(`   ✅ ${collectionName}: ${documents.length} documents`);
        } catch (error) {
          console.error(`   ❌ Error exporting ${collectionName}:`, error);
          backupData.collections[collectionName] = [];
        }
      }

      // Zapisz backup do pliku
      await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
      
      // Oblicz rozmiar pliku
      const stats = await fs.stat(backupPath);
      const fileSizeKB = Math.round(stats.size / 1024);

      console.log(`📦 ${isAutomatic ? 'Auto' : 'Manual'} backup completed: ${filename} (${fileSizeKB} KB, ${totalDocuments} docs)`);

      return {
        success: true,
        backup: {
          filename,
          size: stats.size,
          sizeKB: fileSizeKB,
          path: backupPath,
          collections: Object.keys(backupData.collections).length,
          totalDocuments,
          timestamp: backupData.timestamp,
          type: isAutomatic ? 'auto' : 'manual'
        }
      };

    } catch (error) {
      console.error(`❌ ${isAutomatic ? 'Auto' : 'Manual'} backup failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async isAutoBackupEnabled(): Promise<boolean> {
    try {
      const settings = await SystemSettings.findOne();
      return settings?.system?.autoBackup || false;
    } catch (error) {
      console.error('❌ Error checking auto backup setting:', error);
      return false;
    }
  }

  async cleanOldBackups(maxAgeHours = 72): Promise<void> {
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      const files = await fs.readdir(backupDir);
      const backupFiles = files.filter(file => file.endsWith('.json') && file.includes('auto'));
      
      const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
      let deletedCount = 0;

      for (const filename of backupFiles) {
        const filePath = path.join(backupDir, filename);
        const stats = await fs.stat(filePath);
        
        if (stats.birthtime.getTime() < cutoffTime) {
          await fs.unlink(filePath);
          deletedCount++;
          console.log(`🗑️ Deleted old backup: ${filename}`);
        }
      }

      if (deletedCount > 0) {
        console.log(`🧹 Cleaned up ${deletedCount} old auto backups`);
      }

    } catch (error) {
      console.error('❌ Error cleaning old backups:', error);
    }
  }

  async startAutoBackup(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Auto backup is already running');
      return;
    }

    console.log('🚀 Starting auto backup service (every 5 minutes)...');
    this.isRunning = true;

    // Funkcja do wykonania backupu
    const runBackup = async () => {
      const isEnabled = await this.isAutoBackupEnabled();
      
      if (isEnabled) {
        await this.createBackup(true);
        
        // Wyczyść stare backupy co 10 uruchomień (co ~50 minut)
        if (Math.random() < 0.1) {
          await this.cleanOldBackups();
        }
      } else {
        console.log('⏸️ Auto backup is disabled in settings');
      }
    };

    // Uruchom pierwszy backup od razu
    await runBackup();

    // Ustaw interval na 5 minut (300,000 ms)
    this.intervalId = setInterval(runBackup, 5 * 60 * 1000);
    
    console.log('✅ Auto backup service started');
  }

  stopAutoBackup(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('🛑 Auto backup service stopped');
    }
  }

  isAutoBackupRunning(): boolean {
    return this.isRunning;
  }
}

export default BackupService;
