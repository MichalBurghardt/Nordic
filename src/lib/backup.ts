import BackupService from '@/services/BackupService';
import mongoose from 'mongoose';

// Funkcja inicjalizująca automatyczny backup
export async function initializeAutoBackup() {
  try {
    // Poczekaj na połączenie z bazą danych
    if (mongoose.connection.readyState !== 1) {
      console.log('⏳ Waiting for database connection before starting backup service...');
      await new Promise((resolve) => {
        const checkConnection = () => {
          if (mongoose.connection.readyState === 1) {
            resolve(void 0);
          } else {
            setTimeout(checkConnection, 1000);
          }
        };
        checkConnection();
      });
    }

    console.log('🔧 Initializing automatic backup service...');
    
    const backupService = BackupService.getInstance();
    
    // Uruchom automatyczny backup
    await backupService.startAutoBackup();
    
    console.log('✅ Automatic backup service initialized successfully');
    
    // Graceful shutdown - zatrzymaj backup service gdy aplikacja się zamyka
    const cleanup = () => {
      console.log('🔄 Shutting down backup service...');
      backupService.stopAutoBackup();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('beforeExit', cleanup);

  } catch (error) {
    console.error('❌ Failed to initialize auto backup service:', error);
  }
}

// Export również samego BackupService dla manual backupów
export { default as BackupService } from '@/services/BackupService';
