import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
  company: {
    name: { type: String, default: 'Nordic Zeitarbeit GmbH' },
    address: { type: String, default: 'Hauptstraße 123, 10115 Berlin' },
    phone: { type: String, default: '+49 30 12345678' },
    email: { type: String, default: 'kontakt@nordic-zeitarbeit.de' },
    website: { type: String, default: 'www.nordic-zeitarbeit.de' },
    taxId: { type: String, default: 'DE123456789' },
  },
  notifications: {
    emailAlerts: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false },
    assignmentReminders: { type: Boolean, default: true },
    paymentReminders: { type: Boolean, default: true },
  },
  security: {
    passwordMinLength: { type: Number, default: 8 },
    requireTwoFactor: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 30 },
    maxLoginAttempts: { type: Number, default: 5 },
  },
  system: {
    defaultHourlyRate: { type: Number, default: 15.0 },
    defaultCurrency: { type: String, default: 'EUR' },
    timezone: { type: String, default: 'Europe/Berlin' },
    dateFormat: { type: String, default: 'DD.MM.YYYY' },
    autoBackup: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
  },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

const SystemSettings = mongoose.models.SystemSettings || mongoose.model('SystemSettings', systemSettingsSchema);

export default SystemSettings;
