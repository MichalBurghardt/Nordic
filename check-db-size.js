import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkDatabaseSize() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📊 ROZMIAR BAZY DANYCH NORDIC:');
    
    // Najpierw sprawdź jakie kolekcje istnieją
    const allCollections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n🗂️ ISTNIEJĄCE KOLEKCJE:');
    allCollections.forEach(col => console.log(`   - ${col.name}`));
    
    const collections = allCollections.map(col => col.name);
    
    let totalSize = 0;
    let totalDocuments = 0;
    
    console.log('\n📊 SZCZEGÓŁY KOLEKCJI:');
    for (const collection of collections) {
      try {
        const count = await mongoose.connection.db.collection(collection).countDocuments();
        // Uproszczony sposób oszacowania rozmiaru
        const estimatedSizeKB = count * 2; // ~2KB per document average
        totalSize += estimatedSizeKB;
        totalDocuments += count;
        console.log(`   ${collection.padEnd(20)}: ${count.toString().padStart(4)} documents, ~${estimatedSizeKB.toString().padStart(4)} KB`);
      } catch (error) {
        console.log(`   ${collection.padEnd(20)}: error reading`);
      }
    }
    
    console.log(`\n📊 PODSUMOWANIE:`);
    console.log(`   Total documents: ${totalDocuments}`);
    console.log(`   Total size: ${totalSize} KB (${Math.round(totalSize/1024*100)/100} MB)`);
    
    // Oszacowanie rozmiaru jednego backupu
    const estimatedBackupSize = Math.round(totalSize * 1.2); // 20% overhead for JSON format
    console.log(`\n💾 OSZACOWANIE BACKUPU:`);
    console.log(`   Jeden backup: ~${estimatedBackupSize} KB (~${Math.round(estimatedBackupSize/1024*100)/100} MB)`);
    console.log(`   Backup co 5 min = 288 backupów/dzień`);
    console.log(`   Dzienny rozmiar: ~${Math.round(estimatedBackupSize * 288 / 1024)} MB`);
    console.log(`   Tygodniowy rozmiar: ~${Math.round(estimatedBackupSize * 288 * 7 / 1024 / 1024 * 100)/100} GB`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkDatabaseSize();
