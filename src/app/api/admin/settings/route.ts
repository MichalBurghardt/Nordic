import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SystemSettings from '@/models/SystemSettings';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth';
import { AuditLogger } from '@/lib/auditLogger';

// GET - Pobierz ustawienia systemowe
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = requireAuth(['admin'])(async (_request: AuthenticatedRequest) => {
  try {
    await dbConnect();
    
    const settings = await SystemSettings.findOne();
    
    if (!settings) {
      // Jeśli nie ma ustawień, zwróć domyślne
      const defaultSettings = {
        company: {
          name: 'Nordic Zeitarbeit GmbH',
          address: 'Hauptstraße 123, 10115 Berlin',
          phone: '+49 30 12345678',
          email: 'kontakt@nordic-zeitarbeit.de',
          website: 'www.nordic-zeitarbeit.de',
          taxId: 'DE123456789',
        },
        notifications: {
          emailAlerts: true,
          smsAlerts: false,
          assignmentReminders: true,
          paymentReminders: true,
        },
        security: {
          passwordMinLength: 8,
          requireTwoFactor: false,
          sessionTimeout: 30,
          maxLoginAttempts: 5,
        },
        system: {
          defaultHourlyRate: 15.0,
          defaultCurrency: 'EUR',
          timezone: 'Europe/Berlin',
          dateFormat: 'DD.MM.YYYY',
          autoBackup: true,
          maintenanceMode: false,
        },
      };
      
      return NextResponse.json({ 
        success: true, 
        settings: defaultSettings 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      settings: settings.toObject() 
    });

  } catch (error) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch system settings' },
      { status: 500 }
    );
  }
});

// POST - Zapisz ustawienia systemowe
export const POST = requireAuth(['admin'])(async (request: AuthenticatedRequest) => {
  try {
    await dbConnect();
    
    const data = await request.json();
    
    // Usuń niewykorzystane zmienne
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { colors: _colors, fonts: _fonts, ...systemData } = data;
    
    let settings = await SystemSettings.findOne();
    const isUpdate = !!settings;
    
    if (settings) {
      // Aktualizuj istniejące ustawienia
      Object.assign(settings, systemData);
      settings.updatedBy = request.user!.userId;
      await settings.save();
    } else {
      // Utwórz nowe ustawienia
      settings = new SystemSettings({
        ...systemData,
        updatedBy: request.user!.userId
      });
      await settings.save();
    }

    // Loguj zmianę w audit log
    await AuditLogger.logUpdate(
      request.user!.userId,
      'SystemSettings',
      settings._id.toString(),
      {}, // oldData
      systemData, // newData  
      request,
      `${isUpdate ? 'Zaktualizował' : 'Utworzył'} ustawienia systemowe - Sekcje: ${Object.keys(systemData).join(', ')}`
    );

    return NextResponse.json({ 
      success: true, 
      message: 'System settings saved successfully',
      settings: settings.toObject()
    });

  } catch (error) {
    console.error('Error saving system settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save system settings' },
      { status: 500 }
    );
  }
});
