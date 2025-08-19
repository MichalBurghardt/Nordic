import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Define schemas
const ClientSchema = new mongoose.Schema({
  name: String,
  nordicClientNumber: String
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String
}, { timestamps: true });

const EmployeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  employeeId: String
}, { timestamps: true });

const AssignmentSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  position: String,
  status: String
}, { timestamps: true });

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
mongoose.models.User || mongoose.model('User', UserSchema);
const Client = mongoose.models.Client || mongoose.model('Client', ClientSchema);
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);

async function checkClientAssignments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find NC-0001 client
    const client = await Client.findOne({ nordicClientNumber: 'NC-0001' });
    if (!client) {
      console.log('❌ Client NC-0001 not found');
      return;
    }

    console.log(`📋 Client: ${client.nordicClientNumber} - ${client.name}`);

    // Find assignments for this client
    const assignments = await Assignment.find({ clientId: client._id })
      .populate({
        path: 'employeeId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('clientId', 'name nordicClientNumber');

    console.log(`\n📊 Found ${assignments.length} assignments for ${client.nordicClientNumber}:`);
    
    assignments.forEach((assignment, index) => {
      const empName = assignment.employeeId?.userId 
        ? `${assignment.employeeId.userId.firstName} ${assignment.employeeId.userId.lastName}`
        : 'Unknown Employee';
      console.log(`   ${index + 1}. ${empName} - ${assignment.position} - ${assignment.status}`);
    });

    // Show first 5 clients with assignments
    console.log('\n📋 First 5 clients with assignments:');
    const clientsWithAssignments = await Assignment.find()
      .populate('clientId', 'name nordicClientNumber')
      .populate({
        path: 'employeeId',
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .sort({ 'clientId.nordicClientNumber': 1 })
      .limit(5);

    clientsWithAssignments.forEach((assignment, index) => {
      const empName = assignment.employeeId?.userId 
        ? `${assignment.employeeId.userId.firstName} ${assignment.employeeId.userId.lastName}`
        : 'Unknown Employee';
      console.log(`   ${index + 1}. ${assignment.clientId.nordicClientNumber}: ${empName} → ${assignment.clientId.name} (${assignment.status})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkClientAssignments();
