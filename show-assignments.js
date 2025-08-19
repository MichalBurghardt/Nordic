import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Import models for seeding - Client and Employee needed for populate operations
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Assignment, Client, Employee } from './scripts/models-for-seed.js';

const showAllAssignments = async () => {
  try {
    console.log('🔍 Pobieranie wszystkich umów z bazy danych...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const assignments = await Assignment.find()
      .populate('clientId', 'name contactEmail industry')
      .populate('employeeId', 'firstName lastName email nationality skills')
      .sort({ createdAt: -1 });
    
    console.log(`📋 Znaleziono ${assignments.length} umów:\n`);
    
    assignments.forEach((assignment, index) => {
      console.log(`${index + 1}. 📑 UMOWA ID: ${assignment._id}`);
      console.log(`   👤 Pracownik: ${assignment.employeeId?.firstName} ${assignment.employeeId?.lastName} (${assignment.employeeId?.nationality})`);
      console.log(`   🏢 Klient: ${assignment.clientId?.name} (${assignment.clientId?.industry})`);
      console.log(`   💼 Stanowisko: ${assignment.position}`);
      console.log(`   📍 Miejsce pracy: ${assignment.workLocation}`);
      console.log(`   📅 Okres: ${assignment.startDate.toISOString().split('T')[0]} → ${assignment.endDate.toISOString().split('T')[0]}`);
      console.log(`   💰 Stawka: €${assignment.hourlyRate}/h`);
      console.log(`   ⏰ Max godziny: ${assignment.maxHours}h/tydzień`);
      console.log(`   🚦 Status: ${assignment.status}`);
      if (assignment.requirements?.length > 0) {
        console.log(`   🔧 Wymagania: ${assignment.requirements.join(', ')}`);
      }
      if (assignment.description) {
        console.log(`   📝 Opis: ${assignment.description}`);
      }
      console.log(`   🕐 Utworzono: ${assignment.createdAt.toISOString().split('T')[0]}`);
      console.log('   ' + '─'.repeat(60));
      console.log('');
    });
    
    // Statystyki
    const statusCounts = {};
    const positionCounts = {};
    const industryCounts = {};
    
    assignments.forEach(assignment => {
      statusCounts[assignment.status] = (statusCounts[assignment.status] || 0) + 1;
      positionCounts[assignment.position] = (positionCounts[assignment.position] || 0) + 1;
      if (assignment.clientId?.industry) {
        industryCounts[assignment.clientId.industry] = (industryCounts[assignment.clientId.industry] || 0) + 1;
      }
    });
    
    console.log('📊 STATYSTYKI UMÓW:');
    console.log('\n🚦 Status umów:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} umów`);
    });
    
    console.log('\n💼 Stanowiska:');
    Object.entries(positionCounts).forEach(([position, count]) => {
      console.log(`   ${position}: ${count} umów`);
    });
    
    console.log('\n🏭 Branże:');
    Object.entries(industryCounts).forEach(([industry, count]) => {
      console.log(`   ${industry}: ${count} umów`);
    });
    
    const totalHourlyRate = assignments.reduce((sum, a) => sum + a.hourlyRate, 0);
    const avgHourlyRate = totalHourlyRate / assignments.length;
    
    console.log(`\n💰 Średnia stawka godzinowa: €${avgHourlyRate.toFixed(2)}/h`);
    
    await mongoose.disconnect();
    console.log('\n✅ Zakończono');
    
  } catch (error) {
    console.error('❌ Błąd:', error);
    process.exit(1);
  }
};

showAllAssignments();
