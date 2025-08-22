import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  userId: mongoose.Types.ObjectId;
  employeeId: string;
  qualifications: string[];
  skills: string[];
  experience: string;
  availability: {
    monday: { available: boolean; hours?: string };
    tuesday: { available: boolean; hours?: string };
    wednesday: { available: boolean; hours?: string };
    thursday: { available: boolean; hours?: string };
    friday: { available: boolean; hours?: string };
    saturday: { available: boolean; hours?: string };
    sunday: { available: boolean; hours?: string };
  };
  hourlyRate: number;
  bankDetails?: {
    accountNumber: string;
    bankCode: string;
    bankName: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  documents: {
    name: string;
    type: string;
    uploadDate: Date;
    url: string;
  }[];
  status: 'available' | 'assigned' | 'inactive' | 'awaiting_assignment' | 'on_leave' | 'comp_time' | 'sick_leave' | 'with_assignments';
  statusUpdatedAt?: Date;
  statusReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  qualifications: [{
    type: String,
    trim: true,
  }],
  skills: [{
    type: String,
    trim: true,
  }],
  experience: {
    type: String,
    trim: true,
  },
  availability: {
    monday: {
      available: { type: Boolean, default: false },
      hours: String,
    },
    tuesday: {
      available: { type: Boolean, default: false },
      hours: String,
    },
    wednesday: {
      available: { type: Boolean, default: false },
      hours: String,
    },
    thursday: {
      available: { type: Boolean, default: false },
      hours: String,
    },
    friday: {
      available: { type: Boolean, default: false },
      hours: String,
    },
    saturday: {
      available: { type: Boolean, default: false },
      hours: String,
    },
    sunday: {
      available: { type: Boolean, default: false },
      hours: String,
    },
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: 0,
  },
  bankDetails: {
    accountNumber: String,
    bankCode: String,
    bankName: String,
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String,
  },
  documents: [{
    name: String,
    type: String,
    uploadDate: { type: Date, default: Date.now },
    url: String,
  }],
  status: {
    type: String,
    enum: ['available', 'assigned', 'inactive', 'awaiting_assignment', 'on_leave', 'comp_time', 'sick_leave', 'with_assignments'],
    default: 'available',
  },
  statusUpdatedAt: {
    type: Date,
  },
  statusReason: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Indeksy
EmployeeSchema.index({ status: 1 });
EmployeeSchema.index({ skills: 1 });

export default mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);
