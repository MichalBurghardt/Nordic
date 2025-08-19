import mongoose, { Schema, Document } from 'mongoose';

export interface ISchedule extends Document {
  employeeId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  assignmentId?: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  startTime: string; // Format: "08:00"
  endTime: string;   // Format: "16:00"
  weeklyHours: number;
  status: 'planned' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'sick-leave' | 'vacation' | 'client-break';
  notes?: string;
  createdBy: mongoose.Types.ObjectId; // HR lub Client user ID
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema: Schema = new Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  assignmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Assignment',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  weeklyHours: {
    type: Number,
    required: true,
    min: 1,
    max: 60,
  },
  status: {
    type: String,
    enum: ['planned', 'confirmed', 'active', 'completed', 'cancelled', 'sick-leave', 'vacation', 'client-break'],
    default: 'planned',
  },
  notes: {
    type: String,
    maxlength: 500,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indeksy dla wydajności
ScheduleSchema.index({ employeeId: 1, startDate: 1 });
ScheduleSchema.index({ clientId: 1, startDate: 1 });
ScheduleSchema.index({ startDate: 1, endDate: 1 });
ScheduleSchema.index({ status: 1 });

// Walidacja dat
ScheduleSchema.pre('save', function(next) {
  if (this.endDate && this.startDate && this.endDate <= this.startDate) {
    next(new Error('Data końcowa musi być późniejsza niż data początkowa'));
  }
  next();
});

export default mongoose.models.Schedule || mongoose.model<ISchedule>('Schedule', ScheduleSchema);
