import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully');
    
    // Test creating a simple document
    const TestSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const Test = mongoose.model('Test', TestSchema);
    
    const testDoc = await Test.create({ name: 'Test Document' });
    console.log('✅ Test document created:', testDoc._id);
    
    const count = await Test.countDocuments();
    console.log('✅ Document count:', count);
    
    // Clean up
    await Test.deleteMany({});
    console.log('✅ Test documents cleaned up');
    
    await mongoose.disconnect();
    console.log('✅ Disconnected');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testConnection();
