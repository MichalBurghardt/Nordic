import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Connection URL
const MONGODB_URI = 'mongodb://localhost:27017/nordic';

// Client Schema
const ClientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  industry: {
    type: String,
    required: true,
    trim: true,
  },
  nordicClientNumber: {
    type: String,
    required: true,
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
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// User Schema
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
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
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

async function createTestClient() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Client = mongoose.model('Client', ClientSchema);
    const User = mongoose.model('User', UserSchema);

    // Hash password
    const hashedPassword = await bcrypt.hash('testpassword123', 12);

    // Create client company
    const testClient = new Client({
      name: 'Test Company GmbH',
      contactPerson: 'Max Mustermann',
      email: 'test@testcompany.de',
      password: hashedPassword,
      phoneNumber: '+49 30 12345678',
      industry: 'Software Development',
      nordicClientNumber: 'NC-TEST-001',
      clientReferenceNumber: 'REF-2024-001',
      hourlyRateMultiplier: 1.1,
      address: {
        street: 'Teststraße 123',
        city: 'Berlin',
        postalCode: '10115',
        country: 'Germany',
      },
      isActive: true,
    });

    // Create client user
    const testUser = new User({
      email: 'test@testcompany.de',
      password: hashedPassword,
      firstName: 'Max',
      lastName: 'Mustermann',
      role: 'client',
      phoneNumber: '+49 30 12345678',
      companyName: 'Test Company GmbH',
      address: {
        street: 'Teststraße 123',
        city: 'Berlin',
        postalCode: '10115',
        country: 'Germany',
      },
      isActive: true,
    });

    // Save both
    await testClient.save();
    console.log('Test client company created successfully');
    
    await testUser.save();
    console.log('Test client user created successfully');

    console.log('Test login credentials:');
    console.log('Email: test@testcompany.de');
    console.log('Password: testpassword123');

  } catch (error) {
    console.error('Error creating test client:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestClient();
