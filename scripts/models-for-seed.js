import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// User Schema for seeding
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'hr', 'employee', 'client'], default: 'employee' },
  companyName: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Add pre-hook for insertMany
userSchema.pre('insertMany', async function(next, docs) {
  if (Array.isArray(docs)) {
    for (let doc of docs) {
      if (doc.password) {
        doc.password = await bcrypt.hash(doc.password, 12);
      }
    }
  }
  next();
});

// Client Schema for seeding
const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  nordicClientNumber: { type: String, required: true, unique: true },
  clientReferenceNumber: { type: String },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'Germany' }
  },
  industry: { type: String, required: true },
  hourlyRateMultiplier: { 
    type: Number, 
    required: true, 
    min: 0.8, 
    max: 1.2, 
    default: 1.0 
  },
  taxNumber: String,
  description: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Hash password before saving for clients
clientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Add pre-hook for insertMany
clientSchema.pre('insertMany', async function(next, docs) {
  if (Array.isArray(docs) && docs.length) {
    const hashedDocs = await Promise.all(
      docs.map(async (doc) => {
        if (doc.password) {
          doc.password = await bcrypt.hash(doc.password, 12);
        }
        return doc;
      })
    );
    docs.splice(0, docs.length, ...hashedDocs);
  }
  next();
});

// Employee Schema for seeding
const employeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  employeeId: { type: String, required: true, unique: true },
  qualifications: [String],
  skills: [String],
  experience: String,
  availability: {
    monday: { available: { type: Boolean, default: true }, hours: String },
    tuesday: { available: { type: Boolean, default: true }, hours: String },
    wednesday: { available: { type: Boolean, default: true }, hours: String },
    thursday: { available: { type: Boolean, default: true }, hours: String },
    friday: { available: { type: Boolean, default: true }, hours: String },
    saturday: { available: { type: Boolean, default: false }, hours: String },
    sunday: { available: { type: Boolean, default: false }, hours: String }
  },
  hourlyRate: { type: Number, required: true },
  bankDetails: {
    accountNumber: String,
    bankCode: String,
    bankName: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String
  },
  documents: [{
    name: String,
    type: String,
    uploadDate: { type: Date, default: Date.now },
    url: String
  }],
  status: { type: String, enum: ['available', 'assigned', 'inactive'], default: 'available' }
}, { timestamps: true });

// Assignment Schema for seeding
const assignmentSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  position: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  workLocation: { type: String, required: true },
  hourlyRate: { type: Number, required: true },
  maxHours: { type: Number, required: true },
  description: String,
  requirements: [String],
  status: { type: String, enum: ['pending', 'active', 'completed', 'cancelled', 'paused'], default: 'pending' }
}, { timestamps: true });

// Audit Schema for seeding
const auditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'], required: true },
  resource: { type: String, required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  changes: {
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed },
    field: String
  },
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now },
  details: String
}, { timestamps: false });

// Message Schema for seeding
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'file'], default: 'text' },
  isRead: { type: Boolean, default: false },
  readAt: Date,
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    mimeType: String
  }]
}, { timestamps: true });

// Schedule Schema for seeding
const scheduleSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  endTime: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  weeklyHours: { type: Number, required: true },
  status: { type: String, enum: ['planned', 'confirmed', 'active', 'completed', 'cancelled'], default: 'confirmed' },
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Client = mongoose.model('Client', clientSchema);
const Employee = mongoose.model('Employee', employeeSchema);
const Assignment = mongoose.model('Assignment', assignmentSchema);
const Audit = mongoose.model('Audit', auditSchema);
const Message = mongoose.model('Message', messageSchema);
const Schedule = mongoose.model('Schedule', scheduleSchema);

export { User, Client, Employee, Assignment, Audit, Message, Schedule };
