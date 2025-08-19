import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkEmployees() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const Employee = mongoose.model('Employee', new mongoose.Schema({
      userId: mongoose.Types.ObjectId,
      employeeId: String,
      status: String
    }));
    
    const count = await Employee.countDocuments();
    const activeCount = await Employee.countDocuments({ status: 'active' });
    
    console.log('Employee count:', count);
    console.log('Active employees:', activeCount);
    
    if (count > 0) {
      const sample = await Employee.findOne();
      console.log('Sample employee:', {
        id: sample.employeeId,
        status: sample.status,
        userId: sample.userId
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkEmployees();
