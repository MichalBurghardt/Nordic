// Test MongoDB connection
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    return;
  }
  
  console.log('Testing MongoDB connection...');
  console.log('URI:', uri.replace(/:[^:@]*@/, ':***@')); // Hide password
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB successfully!');
    
    const db = client.db();
    console.log('📊 Database name:', db.databaseName);
    
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name));
    
    // Test a simple operation
    const result = await db.collection('test').findOne({});
    console.log('🔍 Test query result:', result || 'No documents found');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Name:', error.name);
    
    if (error.code === 8000) {
      console.log('\n💡 Authentication failed. Possible issues:');
      console.log('1. Username/password incorrect');
      console.log('2. User doesn\'t have access to this database');
      console.log('3. IP address not whitelisted in MongoDB Atlas');
      console.log('4. Connection string format incorrect');
    }
  } finally {
    await client.close();
  }
}

testConnection();
