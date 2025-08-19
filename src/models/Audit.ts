import mongoose, { Schema, Document } from 'mongoose';

export interface IAudit extends Document {
  userId: mongoose.Types.ObjectId;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'PASSWORD_RESET' | 'EMAIL_VERIFY' | 'ACCESS_DENIED' | 'SYSTEM_ACTION';
  resource: string; // np. 'Client', 'Employee', 'Assignment', 'Schedule'
  resourceId?: mongoose.Types.ObjectId;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    field?: string;
    details?: Record<string, { before: unknown; after: unknown }>;
  };
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  details?: string;
}

const AuditSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'REGISTER', 'PASSWORD_RESET', 'EMAIL_VERIFY', 'ACCESS_DENIED', 'SYSTEM_ACTION'],
    required: true,
  },
  resource: {
    type: String,
    required: true,
    trim: true,
  },
  resourceId: {
    type: Schema.Types.ObjectId,
    required: false,
  },
  changes: {
    before: {
      type: Schema.Types.Mixed,
      required: false,
    },
    after: {
      type: Schema.Types.Mixed,
      required: false,
    },
    field: {
      type: String,
      required: false,
    },
    details: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  ipAddress: {
    type: String,
    required: false,
    trim: true,
  },
  userAgent: {
    type: String,
    required: false,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  details: {
    type: String,
    required: false,
    trim: true,
  },
}, {
  timestamps: false, // używamy własnego timestamp
});

// Indeksy dla wydajności
AuditSchema.index({ userId: 1, timestamp: -1 });
AuditSchema.index({ resource: 1, timestamp: -1 });
AuditSchema.index({ resourceId: 1, timestamp: -1 });
AuditSchema.index({ action: 1, timestamp: -1 });
AuditSchema.index({ timestamp: -1 });

export default mongoose.models.Audit || mongoose.model<IAudit>('Audit', AuditSchema);
