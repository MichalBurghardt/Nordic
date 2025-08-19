import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  clientId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  position: string;
  description: string;
  startDate: Date;
  endDate: Date;
  workLocation: string;
  hourlyRate: number;
  maxHours: number;
  actualHours?: number;
  requirements: string[];
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'paused';
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema: Schema = new Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
    trim: true,
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  workLocation: {
    type: String,
    required: [true, 'Work location is required'],
    trim: true,
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: 0,
  },
  maxHours: {
    type: Number,
    required: [true, 'Max hours is required'],
    min: 0,
  },
  actualHours: {
    type: Number,
    min: 0,
  },
  requirements: [{
    type: String,
    trim: true,
  }],
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled', 'paused'],
    default: 'pending',
  },
  notes: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indeksy
AssignmentSchema.index({ clientId: 1 });
AssignmentSchema.index({ employeeId: 1 });
AssignmentSchema.index({ status: 1 });
AssignmentSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);
