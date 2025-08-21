import mongoose, { Schema, Document } from 'mongoose';

export interface ColorSettings {
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  darknessLevels: {
    light: number;
    medium: number;
    dark: number;
  };
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
    light: string;
    dark: string;
  };
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'hr' | 'employee' | 'client';
  phoneNumber?: string;
  companyName?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  colorSettings?: ColorSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'hr', 'employee', 'client'],
    default: 'employee',
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  companyName: {
    type: String,
    trim: true,
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: String,
  },
  colorSettings: {
    colorScheme: {
      primary: { type: String, default: '#3B82F6' },
      secondary: { type: String, default: '#10B981' },
      accent: { type: String, default: '#F59E0B' },
    },
    darknessLevels: {
      light: { type: Number, default: 0.1 },
      medium: { type: Number, default: 0.3 },
      dark: { type: Number, default: 0.7 },
    },
    customColors: {
      primary: { type: String, default: '#3B82F6' },
      secondary: { type: String, default: '#10B981' },
      accent: { type: String, default: '#F59E0B' },
      light: { type: String, default: '#F8FAFC' },
      dark: { type: String, default: '#1E293B' },
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indeksy dla lepszej wydajności
UserSchema.index({ role: 1 });

// Client Interface i Schema
export interface IClient extends Document {
  name: string;
  contactPerson: string;
  email: string;
  password: string;
  phoneNumber: string;
  industry: string;
  hourlyRateMultiplier: number;
  nordicClientNumber: string; // Nasz numer klienta
  clientReferenceNumber?: string; // Ich numer referencyjny
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
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
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true,
  },
  nordicClientNumber: {
    type: String,
    required: [true, 'Nordic client number is required'],
    unique: true,
    trim: true,
  },
  clientReferenceNumber: {
    type: String,
    trim: true,
  },
  hourlyRateMultiplier: {
    type: Number,
    default: 1.0,
    min: 0.5,
    max: 3.0,
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indeksy dla Client
ClientSchema.index({ name: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Client = mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);
