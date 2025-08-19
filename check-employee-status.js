import { config } from 'dotenv';
import mongoose from 'mongoose';

config({ path: '.env.local' });

await mongoose.connect(process.env.MONGODB_URI);

const Employee = mongoose.model('Employee', new mongoose.Schema({}));

const statuses = await Employee.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);

console.log('📊 Statusy employees w bazie:');
statuses.forEach(s => console.log(`- ${s._id}: ${s.count}`));

process.exit(0);
