import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Import models for seeding
import { User, Employee } from './models-for-seed.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 MongoDB connected for seeding employees...');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed employees - COMPLETE RESET to 180 employees
const seedEmployees = async () => {
  try {
    console.log('👷 Starting COMPLETE employee reset and seeding...');
    console.log('🗑️ This will remove ALL existing employees and create 180 new ones');

    // COMPLETE RESET - Remove all existing employees and their users
    const existingEmployeeCount = await Employee.countDocuments();
    const existingEmployeeUserCount = await User.countDocuments({ role: 'employee' });
    
    console.log(`📊 Found ${existingEmployeeCount} existing employees and ${existingEmployeeUserCount} employee users`);
    
    // Delete all employees and their user accounts
    await Employee.deleteMany({});
    await User.deleteMany({ role: 'employee' });
    console.log('✅ Cleared ALL existing employees and employee users');

    // Get HR users to assign as employee managers
    const hrUsers = await User.find({ role: 'hr' });
    if (hrUsers.length === 0) {
      throw new Error('No HR users found. Please run 1-seed-users.js first.');
    }
    
    console.log(`📊 Found ${hrUsers.length} HR users to assign as managers`);

    // COMPLETE Employee data - 180 employees with unique names from European countries
    const employeeData = [
      // Polish employees (60)
      { firstName: 'Piotr', lastName: 'Kowalski', nationality: 'Polish', city: 'Warsaw' },
      { firstName: 'Anna', lastName: 'Nowak', nationality: 'Polish', city: 'Krakow' },
      { firstName: 'Jan', lastName: 'Wiśniewski', nationality: 'Polish', city: 'Lodz' },
      { firstName: 'Maria', lastName: 'Wójcik', nationality: 'Polish', city: 'Wroclaw' },
      { firstName: 'Tomasz', lastName: 'Kowalczyk', nationality: 'Polish', city: 'Poznan' },
      { firstName: 'Katarzyna', lastName: 'Kamińska', nationality: 'Polish', city: 'Gdansk' },
      { firstName: 'Krzysztof', lastName: 'Lewandowski', nationality: 'Polish', city: 'Szczecin' },
      { firstName: 'Magdalena', lastName: 'Zielińska', nationality: 'Polish', city: 'Bydgoszcz' },
      { firstName: 'Andrzej', lastName: 'Szymański', nationality: 'Polish', city: 'Lublin' },
      { firstName: 'Agnieszka', lastName: 'Woźniak', nationality: 'Polish', city: 'Katowice' },
      { firstName: 'Marcin', lastName: 'Dąbrowski', nationality: 'Polish', city: 'Białystok' },
      { firstName: 'Joanna', lastName: 'Kozłowska', nationality: 'Polish', city: 'Gdynia' },
      { firstName: 'Michał', lastName: 'Jankowski', nationality: 'Polish', city: 'Częstochowa' },
      { firstName: 'Ewa', lastName: 'Mazur', nationality: 'Polish', city: 'Radom' },
      { firstName: 'Robert', lastName: 'Kwiatkowski', nationality: 'Polish', city: 'Sosnowiec' },
      { firstName: 'Monika', lastName: 'Krawczyk', nationality: 'Polish', city: 'Torun' },
      { firstName: 'Paweł', lastName: 'Kaczmarek', nationality: 'Polish', city: 'Kielce' },
      { firstName: 'Beata', lastName: 'Piotrowska', nationality: 'Polish', city: 'Gliwice' },
      { firstName: 'Dariusz', lastName: 'Grabowski', nationality: 'Polish', city: 'Zabrze' },
      { firstName: 'Grażyna', lastName: 'Nowakowska', nationality: 'Polish', city: 'Bytom' },
      { firstName: 'Bartosz', lastName: 'Jankowski', nationality: 'Polish', city: 'Opole' },
      { firstName: 'Aleksandra', lastName: 'Adamska', nationality: 'Polish', city: 'Elblag' },
      { firstName: 'Łukasz', lastName: 'Mazurek', nationality: 'Polish', city: 'Płock' },
      { firstName: 'Natalia', lastName: 'Sikora', nationality: 'Polish', city: 'Ruda' },
      { firstName: 'Krzysztof', lastName: 'Baran', nationality: 'Polish', city: 'Tychy' },
      { firstName: 'Justyna', lastName: 'Kubiak', nationality: 'Polish', city: 'Gorzów' },
      { firstName: 'Sebastian', lastName: 'Czarnecki', nationality: 'Polish', city: 'Ełk' },
      { firstName: 'Karolina', lastName: 'Pawlak', nationality: 'Polish', city: 'Mielec' },
      { firstName: 'Mateusz', lastName: 'Michalski', nationality: 'Polish', city: 'Nowy Sącz' },
      { firstName: 'Dorota', lastName: 'Krawczyk', nationality: 'Polish', city: 'Jelenia Góra' },
      { firstName: 'Adrian', lastName: 'Król', nationality: 'Polish', city: 'Konin' },
      { firstName: 'Beata', lastName: 'Wróbel', nationality: 'Polish', city: 'Inowrocław' },
      { firstName: 'Rafał', lastName: 'Kozłowski', nationality: 'Polish', city: 'Starachowice' },
      { firstName: 'Ewa', lastName: 'Jaworska', nationality: 'Polish', city: 'Grudziądz' },
      { firstName: 'Damian', lastName: 'Zawadzki', nationality: 'Polish', city: 'Będzin' },
      { firstName: 'Sylwia', lastName: 'Witkowska', nationality: 'Polish', city: 'Suwałki' },
      { firstName: 'Grzegorz', lastName: 'Walczak', nationality: 'Polish', city: 'Skierniewice' },
      { firstName: 'Izabela', lastName: 'Stepień', nationality: 'Polish', city: 'Ostrowiec' },
      { firstName: 'Mariusz', lastName: 'Ostrowski', nationality: 'Polish', city: 'Puławy' },
      { firstName: 'Patrycja', lastName: 'Bąk', nationality: 'Polish', city: 'Gniezno' },
      { firstName: 'Wojciech', lastName: 'Sadowski', nationality: 'Polish', city: 'Świętochłowice' },
      { firstName: 'Edyta', lastName: 'Czajka', nationality: 'Polish', city: 'Jastrzębie' },
      { firstName: 'Dawid', lastName: 'Wysocki', nationality: 'Polish', city: 'Żory' },
      { firstName: 'Renata', lastName: 'Kania', nationality: 'Polish', city: 'Siedlce' },
      { firstName: 'Jakub', lastName: 'Urbański', nationality: 'Polish', city: 'Mysłowice' },
      { firstName: 'Elżbieta', lastName: 'Kołodziej', nationality: 'Polish', city: 'Siemianowice' },
      { firstName: 'Sławomir', lastName: 'Borkowski', nationality: 'Polish', city: 'Piotrków' },
      { firstName: 'Halina', lastName: 'Czerwińska', nationality: 'Polish', city: 'Legnica' },
      { firstName: 'Artur', lastName: 'Sobczak', nationality: 'Polish', city: 'Wałbrzych' },
      { firstName: 'Danuta', lastName: 'Głowacka', nationality: 'Polish', city: 'Chorzów' },
      { firstName: 'Zenon', lastName: 'Kowal', nationality: 'Polish', city: 'Tarnów' },
      { firstName: 'Bożena', lastName: 'Sokołowska', nationality: 'Polish', city: 'Koszalin' },
      { firstName: 'Ryszard', lastName: 'Laskowski', nationality: 'Polish', city: 'Legionowo' },
      { firstName: 'Teresa', lastName: 'Majewska', nationality: 'Polish', city: 'Leszno' },
      { firstName: 'Maciej', lastName: 'Chmielewski', nationality: 'Polish', city: 'Tomaszów' },
      { firstName: 'Urszula', lastName: 'Przybylska', nationality: 'Polish', city: 'Przemyśl' },
      { firstName: 'Leszek', lastName: 'Marciniak', nationality: 'Polish', city: 'Stalowa Wola' },
      { firstName: 'Joanna', lastName: 'Wilk', nationality: 'Polish', city: 'Zamość' },
      { firstName: 'Mariusz', lastName: 'Rutkowski', nationality: 'Polish', city: 'Pruszków' },
      { firstName: 'Małgorzata', lastName: 'Kołodziejczyk', nationality: 'Polish', city: 'Piła' },
      { firstName: 'Stanisław', lastName: 'Górski', nationality: 'Polish', city: 'Ostrów' },

      // German employees (60)
      { firstName: 'Hans', lastName: 'Müller', nationality: 'German', city: 'Berlin' },
      { firstName: 'Petra', lastName: 'Schmidt', nationality: 'German', city: 'Munich' },
      { firstName: 'Klaus', lastName: 'Schneider', nationality: 'German', city: 'Hamburg' },
      { firstName: 'Sabine', lastName: 'Fischer', nationality: 'German', city: 'Cologne' },
      { firstName: 'Wolfgang', lastName: 'Weber', nationality: 'German', city: 'Frankfurt' },
      { firstName: 'Ingrid', lastName: 'Meyer', nationality: 'German', city: 'Stuttgart' },
      { firstName: 'Dieter', lastName: 'Wagner', nationality: 'German', city: 'Düsseldorf' },
      { firstName: 'Helga', lastName: 'Becker', nationality: 'German', city: 'Dortmund' },
      { firstName: 'Günter', lastName: 'Schulz', nationality: 'German', city: 'Essen' },
      { firstName: 'Ursula', lastName: 'Hoffmann', nationality: 'German', city: 'Leipzig' },
      { firstName: 'Manfred', lastName: 'Schäfer', nationality: 'German', city: 'Bremen' },
      { firstName: 'Christa', lastName: 'Koch', nationality: 'German', city: 'Dresden' },
      { firstName: 'Horst', lastName: 'Richter', nationality: 'German', city: 'Hanover' },
      { firstName: 'Renate', lastName: 'Klein', nationality: 'German', city: 'Nuremberg' },
      { firstName: 'Heinz', lastName: 'Wolf', nationality: 'German', city: 'Duisburg' },
      { firstName: 'Thomas', lastName: 'Richters', nationality: 'German', city: 'Bochum' },
      { firstName: 'Sabine', lastName: 'Kleins', nationality: 'German', city: 'Wuppertal' },
      { firstName: 'Michael', lastName: 'Wolfs', nationality: 'German', city: 'Bielefeld' },
      { firstName: 'Andrea', lastName: 'Schröder', nationality: 'German', city: 'Bonn' },
      { firstName: 'Frank', lastName: 'Neumann', nationality: 'German', city: 'Münster' },
      { firstName: 'Claudia', lastName: 'Schwarz', nationality: 'German', city: 'Karlsruhe' },
      { firstName: 'Jürgen', lastName: 'Zimmermann', nationality: 'German', city: 'Mannheim' },
      { firstName: 'Monika', lastName: 'Braun', nationality: 'German', city: 'Augsburg' },
      { firstName: 'Stefan', lastName: 'Hartmann', nationality: 'German', city: 'Wiesbaden' },
      { firstName: 'Birgit', lastName: 'Lange', nationality: 'German', city: 'Gelsenkirchen' },
      { firstName: 'Markus', lastName: 'Schmitt', nationality: 'German', city: 'Mönchengladbach' },
      { firstName: 'Karin', lastName: 'Zimmerer', nationality: 'German', city: 'Braunschweig' },
      { firstName: 'Oliver', lastName: 'Köhler', nationality: 'German', city: 'Chemnitz' },
      { firstName: 'Silke', lastName: 'Mayer', nationality: 'German', city: 'Kiel' },
      { firstName: 'Thorsten', lastName: 'König', nationality: 'German', city: 'Aachen' },
      { firstName: 'Ute', lastName: 'Huber', nationality: 'German', city: 'Halle' },
      { firstName: 'Rainer', lastName: 'Herrmann', nationality: 'German', city: 'Magdeburg' },
      { firstName: 'Gisela', lastName: 'Krüger', nationality: 'German', city: 'Freiburg' },
      { firstName: 'Uwe', lastName: 'Martin', nationality: 'German', city: 'Krefeld' },
      { firstName: 'Brigitte', lastName: 'Lehmann', nationality: 'German', city: 'Lübeck' },
      { firstName: 'Bernd', lastName: 'Albrecht', nationality: 'German', city: 'Oberhausen' },
      { firstName: 'Doris', lastName: 'Günther', nationality: 'German', city: 'Erfurt' },
      { firstName: 'Lothar', lastName: 'Peters', nationality: 'German', city: 'Mainz' },
      { firstName: 'Margot', lastName: 'Krause', nationality: 'German', city: 'Rostock' },
      { firstName: 'Karl-Heinz', lastName: 'Jung', nationality: 'German', city: 'Kassel' },
      { firstName: 'Elfriede', lastName: 'Hahn', nationality: 'German', city: 'Hagen' },
      { firstName: 'Erich', lastName: 'Gross', nationality: 'German', city: 'Hamm' },
      { firstName: 'Waltraud', lastName: 'Roth', nationality: 'German', city: 'Saarbrücken' },
      { firstName: 'Joachim', lastName: 'Franke', nationality: 'German', city: 'Mülheim' },
      { firstName: 'Rosemarie', lastName: 'Schubert', nationality: 'German', city: 'Potsdam' },
      { firstName: 'Werner', lastName: 'Sommer', nationality: 'German', city: 'Ludwigshafen' },
      { firstName: 'Hannelore', lastName: 'Engel', nationality: 'German', city: 'Leverkusen' },
      { firstName: 'Siegfried', lastName: 'Zimmermanns', nationality: 'German', city: 'Oldenburg' },
      { firstName: 'Anneliese', lastName: 'Vogel', nationality: 'German', city: 'Osnabrück' },
      { firstName: 'Gerhard', lastName: 'Stein', nationality: 'German', city: 'Solingen' },
      { firstName: 'Lieselotte', lastName: 'Jacob', nationality: 'German', city: 'Heidelberg' },
      { firstName: 'Kurt', lastName: 'Keller', nationality: 'German', city: 'Darmstadt' },
      { firstName: 'Christa', lastName: 'Kühn', nationality: 'German', city: 'Paderborn' },
      { firstName: 'Helmut', lastName: 'Weiss', nationality: 'German', city: 'Regensburg' },
      { firstName: 'Gertrud', lastName: 'Simon', nationality: 'German', city: 'Ingolstadt' },
      { firstName: 'Rudolf', lastName: 'Fuchs', nationality: 'German', city: 'Würzburg' },
      { firstName: 'Irmgard', lastName: 'Busch', nationality: 'German', city: 'Fürth' },
      { firstName: 'Fritz', lastName: 'Schuster', nationality: 'German', city: 'Ulm' },
      { firstName: 'Hedwig', lastName: 'Nowaks', nationality: 'German', city: 'Heilbronn' },
      { firstName: 'Walter', lastName: 'Seidel', nationality: 'German', city: 'Pforzheim' },
      { firstName: 'Ilse', lastName: 'Kramer', nationality: 'German', city: 'Wolfsburg' },
      { firstName: 'Alfred', lastName: 'Brandt', nationality: 'German', city: 'Göttingen' },

      // Czech employees (30)
      { firstName: 'Petr', lastName: 'Novák', nationality: 'Czech', city: 'Prague' },
      { firstName: 'Jana', lastName: 'Svobodová', nationality: 'Czech', city: 'Brno' },
      { firstName: 'Tomáš', lastName: 'Novotný', nationality: 'Czech', city: 'Ostrava' },
      { firstName: 'Marie', lastName: 'Černá', nationality: 'Czech', city: 'Plzen' },
      { firstName: 'Pavel', lastName: 'Procházka', nationality: 'Czech', city: 'Liberec' },
      { firstName: 'Hana', lastName: 'Krejčí', nationality: 'Czech', city: 'Olomouc' },
      { firstName: 'Martin', lastName: 'Horák', nationality: 'Czech', city: 'Ústí' },
      { firstName: 'Věra', lastName: 'Marešová', nationality: 'Czech', city: 'Hradec' },
      { firstName: 'David', lastName: 'Pospíšil', nationality: 'Czech', city: 'Pardubice' },
      { firstName: 'Eva', lastName: 'Pokorná', nationality: 'Czech', city: 'Havířov' },
      { firstName: 'Lukáš', lastName: 'Horáček', nationality: 'Czech', city: 'Kladno' },
      { firstName: 'Alena', lastName: 'Němcová', nationality: 'Czech', city: 'Most' },
      { firstName: 'Michal', lastName: 'Pokorný', nationality: 'Czech', city: 'Karviná' },
      { firstName: 'Hana', lastName: 'Doležalová', nationality: 'Czech', city: 'Opava' },
      { firstName: 'Jiří', lastName: 'Fiala', nationality: 'Czech', city: 'Frýdek' },
      { firstName: 'Zuzana', lastName: 'Kratochvílová', nationality: 'Czech', city: 'Děčín' },
      { firstName: 'Václav', lastName: 'Čermák', nationality: 'Czech', city: 'Chomutov' },
      { firstName: 'Lenka', lastName: 'Dvořáková', nationality: 'Czech', city: 'Teplice' },
      { firstName: 'Ondřej', lastName: 'Veselý', nationality: 'Czech', city: 'Třinec' },
      { firstName: 'Barbora', lastName: 'Kratochvílová', nationality: 'Czech', city: 'Tabor' },
      { firstName: 'Marek', lastName: 'Beneš', nationality: 'Czech', city: 'Zlín' },
      { firstName: 'Klára', lastName: 'Bartošová', nationality: 'Czech', city: 'Přerov' },
      { firstName: 'Jakub', lastName: 'Kadlec', nationality: 'Czech', city: 'Prostějov' },
      { firstName: 'Tereza', lastName: 'Růžičková', nationality: 'Czech', city: 'Jablonec' },
      { firstName: 'Filip', lastName: 'Kopecký', nationality: 'Czech', city: 'Mladá Boleslav' },
      { firstName: 'Simona', lastName: 'Hrubá', nationality: 'Czech', city: 'Česká Lípa' },
      { firstName: 'Adam', lastName: 'Blažek', nationality: 'Czech', city: 'Jihlava' },
      { firstName: 'Monika', lastName: 'Konečná', nationality: 'Czech', city: 'Trutnov' },
      { firstName: 'Daniel', lastName: 'Machala', nationality: 'Czech', city: 'Uherské Hradiště' },
      { firstName: 'Petra', lastName: 'Holubová', nationality: 'Czech', city: 'Kolín' },

      // Lithuanian employees (30)
      { firstName: 'Jonas', lastName: 'Petrauskas', nationality: 'Lithuanian', city: 'Vilnius' },
      { firstName: 'Rūta', lastName: 'Kazlauskas', nationality: 'Lithuanian', city: 'Kaunas' },
      { firstName: 'Vytautas', lastName: 'Jankauskas', nationality: 'Lithuanian', city: 'Klaipėda' },
      { firstName: 'Vida', lastName: 'Stankevičius', nationality: 'Lithuanian', city: 'Šiauliai' },
      { firstName: 'Mindaugas', lastName: 'Butkus', nationality: 'Lithuanian', city: 'Panevėžys' },
      { firstName: 'Daiva', lastName: 'Paulauskas', nationality: 'Lithuanian', city: 'Alytus' },
      { firstName: 'Gintaras', lastName: 'Žukauskas', nationality: 'Lithuanian', city: 'Marijampolė' },
      { firstName: 'Audronė', lastName: 'Balčiūnas', nationality: 'Lithuanian', city: 'Mažeikiai' },
      { firstName: 'Saulius', lastName: 'Lukošius', nationality: 'Lithuanian', city: 'Jonava' },
      { firstName: 'Irena', lastName: 'Navickas', nationality: 'Lithuanian', city: 'Utena' },
      { firstName: 'Arūnas', lastName: 'Grigas', nationality: 'Lithuanian', city: 'Kėdainiai' },
      { firstName: 'Nijolė', lastName: 'Ramanauskas', nationality: 'Lithuanian', city: 'Telšiai' },
      { firstName: 'Rolandas', lastName: 'Mikutis', nationality: 'Lithuanian', city: 'Visaginas' },
      { firstName: 'Jolanta', lastName: 'Brazauskas', nationality: 'Lithuanian', city: 'Tauragė' },
      { firstName: 'Rimantas', lastName: 'Šimkus', nationality: 'Lithuanian', city: 'Ukmergė' },
      { firstName: 'Dalia', lastName: 'Kavaliauskas', nationality: 'Lithuanian', city: 'Plungė' },
      { firstName: 'Algirdas', lastName: 'Stonkus', nationality: 'Lithuanian', city: 'Kretinga' },
      { firstName: 'Laima', lastName: 'Mockus', nationality: 'Lithuanian', city: 'Šilutė' },
      { firstName: 'Kęstutis', lastName: 'Bartkus', nationality: 'Lithuanian', city: 'Radviliškis' },
      { firstName: 'Regina', lastName: 'Adamkus', nationality: 'Lithuanian', city: 'Druskininkai' },
      { firstName: 'Antanas', lastName: 'Rimkus', nationality: 'Lithuanian', city: 'Palanga' },
      { firstName: 'Vaida', lastName: 'Gudaitis', nationality: 'Lithuanian', city: 'Biržai' },
      { firstName: 'Darius', lastName: 'Matijošaitis', nationality: 'Lithuanian', city: 'Kupiškis' },
      { firstName: 'Eglė', lastName: 'Sabonis', nationality: 'Lithuanian', city: 'Rokiškis' },
      { firstName: 'Linas', lastName: 'Kurtinaitis', nationality: 'Lithuanian', city: 'Pasvalys' },
      { firstName: 'Asta', lastName: 'Juška', nationality: 'Lithuanian', city: 'Pakruojis' },
      { firstName: 'Giedrius', lastName: 'Songaila', nationality: 'Lithuanian', city: 'Anykščiai' },
      { firstName: 'Virginija', lastName: 'Kleiza', nationality: 'Lithuanian', city: 'Molėtai' },
      { firstName: 'Donatas', lastName: 'Motiejūnas', nationality: 'Lithuanian', city: 'Ignalina' },
      { firstName: 'Silvija', lastName: 'Valančiūnas', nationality: 'Lithuanian', city: 'Zarasai' }
    ];

    console.log(`🔄 Creating 180 employees across 4 nationalities...`);

    const employees = [];
    const employeeUsers = [];

    // Skills and sectors for variety
    const skills = ['Lagerarbeiter', 'Maschinenbedienung', 'Montage', 'Qualitätskontrolle', 'Verpackung', 'Transport', 'Reinigung', 'Wartung'];
    const sectors = ['Logistik', 'Produktion', 'Automotive', 'Lebensmittel', 'Elektronik', 'Pharma', 'Textil', 'Metall'];
    const germanLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

    for (let i = 0; i < employeeData.length; i++) {
      const emp = employeeData[i];
      
      // Create user account for employee
      const employeeUser = new User({
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: `${emp.firstName.toLowerCase()}.${emp.lastName.toLowerCase()}.emp${i + 1}@nordic.com`,
        password: 'employee123', // Will be hashed by the model
        role: 'employee',
        isActive: true
      });

      await employeeUser.save();
      employeeUsers.push(employeeUser);

      // Create employee profile
      const employee = new Employee({
        userId: employeeUser._id,
        employeeId: `EMP${String(i + 1).padStart(3, '0')}`, // Add required employeeId
        employeeNumber: `EMP${String(i + 1).padStart(3, '0')}`,
        nationality: emp.nationality,
        germanLevel: germanLevels[Math.floor(Math.random() * germanLevels.length)],
        skills: [
          skills[Math.floor(Math.random() * skills.length)],
          skills[Math.floor(Math.random() * skills.length)]
        ].filter((skill, index, arr) => arr.indexOf(skill) === index), // Remove duplicates
        preferredSector: sectors[Math.floor(Math.random() * sectors.length)],
        location: emp.city,
        isAvailable: true,
        hourlyRate: Math.floor(Math.random() * 8) + 12, // 12-19 EUR/hour
        contractType: Math.random() > 0.7 ? 'Festanstellung' : 'Zeitarbeit',
        startDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random start date within last year
        assignedBy: hrUsers[Math.floor(Math.random() * hrUsers.length)]._id,
        notes: `Employee from ${emp.city}, ${emp.nationality}`
      });

      await employee.save();
      employees.push(employee);
    }

    console.log(`✅ Successfully created ${employeeUsers.length} employee user accounts`);
    console.log(`✅ Successfully created ${employees.length} employee profiles`);
    
    // Summary statistics
    const nationalityStats = {};
    employees.forEach(emp => {
      nationalityStats[emp.nationality] = (nationalityStats[emp.nationality] || 0) + 1;
    });

    console.log('📊 Employee distribution by nationality:');
    Object.entries(nationalityStats).forEach(([nationality, count]) => {
      console.log(`   ${nationality}: ${count} employees`);
    });

    console.log('🎯 Ready for assignments! You now have 180 employees for 30 clients.');
    console.log('📈 This should allow for 60 clients to get 3 employees each.');

  } catch (error) {
    console.error('❌ Error seeding employees:', error);
  }
};

// Run the seeding
const run = async () => {
  await connectDB();
  await seedEmployees();
  await mongoose.connection.close();
  console.log('🔚 Disconnected from MongoDB');
};

run().catch(console.error);
