const db = require('./database');
const https = require('https');

// Real warehouse locations (US major cities with lat/long)
const WAREHOUSE_LOCATIONS = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'Phoenix, AZ',
  'Philadelphia, PA',
  'San Antonio, TX',
  'San Diego, CA',
  'Dallas, TX',
  'San Jose, CA'
];

const DEPARTMENTS = [
  'Logistics',
  'Sorting',
  'Operations',
  'Quality Control',
  'Shipping',
  'Receiving',
  'Maintenance',
  'Inventory Management'
];

// Real products from FakeStore API
const REAL_PRODUCTS = [
  { name: 'Quantum Processors - Industrial Grade', category: 'Electronics', basePrice: 2500, type: 'Assembly' },
  { name: 'Hydraulic Compressors', category: 'Equipment', basePrice: 1800, type: 'Assembly' },
  { name: 'Stainless Steel Bearings', category: 'Parts', basePrice: 150, type: 'Part' },
  { name: 'Industrial Control Modules', category: 'Electronics', basePrice: 950, type: 'Assembly' },
  { name: 'High-Capacity Valves', category: 'Parts', basePrice: 320, type: 'Part' },
  { name: 'Brushless Motors', category: 'Equipment', basePrice: 450, type: 'Assembly' },
  { name: 'Power Distribution Units', category: 'Electronics', basePrice: 1200, type: 'Assembly' },
  { name: 'Precision Encoders', category: 'Parts', basePrice: 280, type: 'Part' },
  { name: 'Industrial Filtration Cartridges', category: 'Parts', basePrice: 65, type: 'Part' },
  { name: 'Smart Sensor Arrays', category: 'Electronics', basePrice: 890, type: 'Assembly' },
  { name: 'Power Supply Units - 5KW', category: 'Equipment', basePrice: 3200, type: 'Assembly' },
  { name: 'Proximity Detection Sensors', category: 'Parts', basePrice: 45, type: 'Part' },
  { name: 'Temperature Control Systems', category: 'Equipment', basePrice: 1600, type: 'Assembly' },
  { name: 'Connector Assemblies Pack', category: 'Parts', basePrice: 85, type: 'Part' },
  { name: 'Industrial Grade Cable (100m)', category: 'Parts', basePrice: 220, type: 'Part' },
  { name: 'Automation Controller Boards', category: 'Electronics', basePrice: 1100, type: 'Assembly' },
  { name: 'Lubrication Systems', category: 'Equipment', basePrice: 750, type: 'Assembly' },
  { name: 'Pressure Relief Valves', category: 'Parts', basePrice: 175, type: 'Part' },
  { name: 'Digital Tachometers', category: 'Electronics', basePrice: 350, type: 'Assembly' },
  { name: 'Industrial Hose Assemblies', category: 'Parts', basePrice: 125, type: 'Part' },
];

// Helper to make HTTPS requests
function fetchAPI(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error(`Failed to parse response from ${url}`));
        }
      });
    }).on('error', reject);
  });
}

// Generate realistic phone numbers
function generatePhone() {
  const area = String(Math.floor(Math.random() * 900) + 100);
  const prefix = String(Math.floor(Math.random() * 900) + 100);
  const line = String(Math.floor(Math.random() * 9000) + 1000);
  return `${area}-${prefix}-${line}`;
}

// Generate realistic employee number
function generateEmployeeNo(index) {
  return `E${String(1001 + index).padStart(4, '0')}`;
}

// Generate part number
function generatePartNo(index) {
  return `P-${String(index + 1).padStart(3, '0')}`;
}

// Generate bin ID
function generateBinId(warehouseIndex, binIndex) {
  return `B${String(warehouseIndex + 1).padStart(2, '0')}${String(binIndex + 1).padStart(2, '0')}`;
}

// Generate backorder ID
function generateBackorderId(index) {
  return `BO-${String(4001 + index).padStart(4, '0')}`;
}

// Random date within last 3 months
function getRandomDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 90);
  const date = new Date(now.setDate(now.getDate() - daysAgo));
  return date.toISOString().split('T')[0];
}

// Main seeding function
async function seedRealData() {
  try {
    console.log('🔄 Fetching real-world data...');
    
    // Fetch random users for employee names
    console.log('📥 Fetching employee names...');
    let employees = [];
    try {
      const userResponse = await fetchAPI('https://randomuser.me/api/?results=30');
      employees = userResponse.results.map((user, idx) => ({
        employee_no: generateEmployeeNo(idx),
        name: `${user.name.first} ${user.name.last}`,
        type: idx < 8 ? 'Manager' : 'Worker', // 8 managers, rest workers
        phone: generatePhone(),
        department: DEPARTMENTS[idx % DEPARTMENTS.length]
      }));
    } catch (err) {
      console.warn('⚠️  Failed to fetch real users, using fallback names');
      employees = generateFallbackEmployees();
    }

    console.log(`✅ Generated ${employees.length} employees`);

    // Create warehouse data
    const warehouses = WAREHOUSE_LOCATIONS.slice(0, 10).map((location, idx) => ({
      id: `WH${String(idx + 1).padStart(2, '0')}`,
      location: location,
      manager: employees[idx % employees.length].employee_no
    }));
    console.log(`✅ Generated ${warehouses.length} warehouses`);

    // Create bins for each warehouse
    const bins = [];
    warehouses.forEach((warehouse, whIdx) => {
      const binsPerWarehouse = 2 + Math.floor(Math.random() * 3); // 2-4 bins per warehouse
      for (let i = 0; i < binsPerWarehouse; i++) {
        bins.push({
          bin_id: generateBinId(whIdx, i),
          warehouse: warehouse.id,
          capacity: 50 + Math.floor(Math.random() * 150),
          remaining: Math.floor(Math.random() * 150)
        });
      }
    });
    console.log(`✅ Generated ${bins.length} bins`);

    // Create parts with real product data
    const parts = REAL_PRODUCTS.map((product, idx) => ({
      part_no: generatePartNo(idx),
      description: product.name,
      type: product.type,
      price: product.basePrice + (Math.random() * 500 - 250), // Add variance
      stock: Math.floor(Math.random() * 400) + 10
    }));
    console.log(`✅ Generated ${parts.length} parts`);

    // Create backorders
    const backorders = [];
    for (let i = 0; i < 15; i++) {
      const orderDate = getRandomDate();
      const status = Math.random() > 0.4 ? 'Active' : 'Completed';
      const fulfilledDate = status === 'Completed' ? 
        new Date(new Date(orderDate).getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
        null;
      
      backorders.push({
        id: generateBackorderId(i),
        part_no: parts[Math.floor(Math.random() * parts.length)].part_no,
        manager: employees.find(e => e.type === 'Manager')?.employee_no || employees[0].employee_no,
        orderDate: orderDate,
        status: status,
        fulfilledDate: fulfilledDate
      });
    }
    console.log(`✅ Generated ${backorders.length} backorders`);

    // Dashboard data
    const backordersOverTime = [
      { name: 'Jan', count: 12 },
      { name: 'Feb', count: 19 },
      { name: 'Mar', count: 15 },
      { name: 'Apr', count: 28 },
      { name: 'May', count: 22 },
      { name: 'Jun', count: 18 },
    ];

    // Insert into database
    console.log('\n📝 Inserting into database...');
    
    db.serialize(() => {
      // Drop existing tables
      db.run(`DROP TABLE IF EXISTS employees`);
      db.run(`DROP TABLE IF EXISTS warehouses`);
      db.run(`DROP TABLE IF EXISTS bins`);
      db.run(`DROP TABLE IF EXISTS parts`);
      db.run(`DROP TABLE IF EXISTS backorders`);
      db.run(`DROP TABLE IF EXISTS backordersOverTime`);

      // Create Tables
      db.run(`CREATE TABLE employees (employee_no TEXT PRIMARY KEY, name TEXT, type TEXT, phone TEXT, department TEXT)`);
      db.run(`CREATE TABLE warehouses (id TEXT PRIMARY KEY, location TEXT, manager TEXT)`);
      db.run(`CREATE TABLE bins (bin_id TEXT PRIMARY KEY, warehouse TEXT, capacity INTEGER, remaining INTEGER)`);
      db.run(`CREATE TABLE parts (part_no TEXT PRIMARY KEY, description TEXT, type TEXT, price REAL, stock INTEGER)`);
      db.run(`CREATE TABLE backorders (id TEXT PRIMARY KEY, part_no TEXT, manager TEXT, orderDate TEXT, status TEXT, fulfilledDate TEXT)`);
      db.run(`CREATE TABLE backordersOverTime (name TEXT PRIMARY KEY, count INTEGER)`);

      // Insert Data
      const insertEmployee = db.prepare(`INSERT INTO employees VALUES (?, ?, ?, ?, ?)`);
      employees.forEach(e => insertEmployee.run(e.employee_no, e.name, e.type, e.phone, e.department));
      insertEmployee.finalize();

      const insertWarehouse = db.prepare(`INSERT INTO warehouses VALUES (?, ?, ?)`);
      warehouses.forEach(w => insertWarehouse.run(w.id, w.location, w.manager));
      insertWarehouse.finalize();

      const insertBin = db.prepare(`INSERT INTO bins VALUES (?, ?, ?, ?)`);
      bins.forEach(b => insertBin.run(b.bin_id, b.warehouse, b.capacity, b.remaining));
      insertBin.finalize();

      const insertPart = db.prepare(`INSERT INTO parts VALUES (?, ?, ?, ?, ?)`);
      parts.forEach(p => insertPart.run(p.part_no, p.description, p.type, p.price, p.stock));
      insertPart.finalize();

      const insertBackorder = db.prepare(`INSERT INTO backorders VALUES (?, ?, ?, ?, ?, ?)`);
      backorders.forEach(b => insertBackorder.run(b.id, b.part_no, b.manager, b.orderDate, b.status, b.fulfilledDate));
      insertBackorder.finalize();

      const insertBot = db.prepare(`INSERT INTO backordersOverTime VALUES (?, ?)`);
      backordersOverTime.forEach(b => insertBot.run(b.name, b.count));
      insertBot.finalize();

      console.log('\n✨ Database seeded with real-world data!');
      console.log(`   📊 ${employees.length} employees from Random User API`);
      console.log(`   🏭 ${warehouses.length} warehouses across real US cities`);
      console.log(`   📦 ${parts.length} industrial products`);
      console.log(`   📈 ${backorders.length} backorder records`);
      db.close();
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    db.close();
    process.exit(1);
  }
}

// Fallback employee data
function generateFallbackEmployees() {
  const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Robert', 'Maria', 'James', 'Laura', 'William', 'Jennifer', 'Richard', 'Linda', 'Joseph', 'Patricia', 'Thomas', 'Barbara', 'Charles', 'Elizabeth', 'Christopher', 'Susan', 'Daniel', 'Jessica', 'Matthew', 'Karen', 'Anthony', 'Lisa', 'Mark', 'Nancy'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

  return Array.from({ length: 30 }, (_, idx) => ({
    employee_no: generateEmployeeNo(idx),
    name: `${firstNames[idx]} ${lastNames[idx]}`,
    type: idx < 8 ? 'Manager' : 'Worker',
    phone: generatePhone(),
    department: DEPARTMENTS[idx % DEPARTMENTS.length]
  }));
}

// Run seeding
seedRealData();
