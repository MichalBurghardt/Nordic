import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  name: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  industry: string;
  hourlyRateMultiplier: number; // Mnożnik stawki godzinowej (0.8 - 1.2)
  taxNumber?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  address: {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
      default: 'Germany',
    },
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true,
  },
  hourlyRateMultiplier: {
    type: Number,
    required: [true, 'Hourly rate multiplier is required'],
    min: [0.8, 'Hourly rate multiplier must be at least 0.8 (80%)'],
    max: [1.2, 'Hourly rate multiplier cannot exceed 1.2 (120%)'],
    default: 1.0,
  },
  taxNumber: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indeksy
ClientSchema.index({ name: 1 });
ClientSchema.index({ industry: 1 });
ClientSchema.index({ isActive: 1 });

export default mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);
