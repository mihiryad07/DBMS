const db = require('./database');

const MOCK_DATA = {
  dashboard: {
    backordersOverTime: [
      { name: 'Jan', count: 12 },
      { name: 'Feb', count: 19 },
      { name: 'Mar', count: 15 },
      { name: 'Apr', count: 28 },
      { name: 'May', count: 22 },
      { name: 'Jun', count: 18 },
    ],
  },
  employees: [
    { employee_no: 'E1001', name: 'Tony Smith', type: 'Manager', phone: '555-0101', department: 'Logistics' },
    { employee_no: 'E1002', name: 'Sarah Connor', type: 'Worker', phone: '555-0102', department: 'Sorting' },
    { employee_no: 'E1003', name: 'Mike Johnson', type: 'Worker', phone: '555-0103', department: 'Forklift' },
    { employee_no: 'E1004', name: 'Elena Rogers', type: 'Manager', phone: '555-0104', department: 'Inventory' },
    { employee_no: 'E1005', name: 'James Doe', type: 'Worker', phone: '555-0105', department: 'Logistics' },
    // Additional Managers
    { employee_no: 'E1006', name: 'David Chen', type: 'Manager', phone: '555-0106', department: 'Operations' },
    { employee_no: 'E1007', name: 'Maria Garcia', type: 'Manager', phone: '555-0107', department: 'Quality Control' },
    { employee_no: 'E1008', name: 'Robert Wilson', type: 'Manager', phone: '555-0108', department: 'Shipping' },
    { employee_no: 'E1009', name: 'Lisa Thompson', type: 'Manager', phone: '555-0109', department: 'Receiving' },
    { employee_no: 'E1010', name: 'Kevin Brown', type: 'Manager', phone: '555-0110', department: 'Maintenance' },
    // Additional Workers
    { employee_no: 'E1011', name: 'Jennifer Davis', type: 'Worker', phone: '555-0111', department: 'Sorting' },
    { employee_no: 'E1012', name: 'Christopher Miller', type: 'Worker', phone: '555-0112', department: 'Forklift' },
    { employee_no: 'E1013', name: 'Amanda Martinez', type: 'Worker', phone: '555-0113', department: 'Logistics' },
    { employee_no: 'E1014', name: 'Daniel Anderson', type: 'Worker', phone: '555-0114', department: 'Operations' },
    { employee_no: 'E1015', name: 'Michelle Taylor', type: 'Worker', phone: '555-0115', department: 'Quality Control' },
    { employee_no: 'E1016', name: 'Jason Thomas', type: 'Worker', phone: '555-0116', department: 'Shipping' },
    { employee_no: 'E1017', name: 'Stephanie Jackson', type: 'Worker', phone: '555-0117', department: 'Receiving' },
    { employee_no: 'E1018', name: 'Andrew White', type: 'Worker', phone: '555-0118', department: 'Maintenance' },
    { employee_no: 'E1019', name: 'Rachel Harris', type: 'Worker', phone: '555-0119', department: 'Inventory' },
    { employee_no: 'E1020', name: 'Brian Clark', type: 'Worker', phone: '555-0120', department: 'Operations' },
    { employee_no: 'E1021', name: 'Nicole Lewis', type: 'Worker', phone: '555-0121', department: 'Sorting' },
    { employee_no: 'E1022', name: 'Timothy Robinson', type: 'Worker', phone: '555-0122', department: 'Forklift' },
    { employee_no: 'E1023', name: 'Heather Walker', type: 'Worker', phone: '555-0123', department: 'Logistics' },
    { employee_no: 'E1024', name: 'Justin Hall', type: 'Worker', phone: '555-0124', department: 'Quality Control' },
    { employee_no: 'E1025', name: 'Melissa Young', type: 'Worker', phone: '555-0125', department: 'Shipping' },
  ],
  warehouses: [
    { id: 'WH01', location: 'New York', manager: 'Tony Smith' },
    { id: 'WH02', location: 'Los Angeles', manager: 'Elena Rogers' },
    { id: 'WH03', location: 'Chicago', manager: 'David Chen' },
    { id: 'WH04', location: 'Houston', manager: 'Maria Garcia' },
    { id: 'WH05', location: 'Phoenix', manager: 'Robert Wilson' },
    { id: 'WH06', location: 'Philadelphia', manager: 'Lisa Thompson' },
    { id: 'WH07', location: 'San Antonio', manager: 'Kevin Brown' },
  ],
  bins: [
    { bin_id: 'B101', warehouse: 'WH01', capacity: 100, remaining: 20 },
    { bin_id: 'B102', warehouse: 'WH01', capacity: 150, remaining: 150 },
    { bin_id: 'B103', warehouse: 'WH01', capacity: 80, remaining: 45 },
    { bin_id: 'B201', warehouse: 'WH02', capacity: 200, remaining: 5 },
    { bin_id: 'B202', warehouse: 'WH02', capacity: 120, remaining: 85 },
    { bin_id: 'B301', warehouse: 'WH03', capacity: 50, remaining: 0 },
    { bin_id: 'B302', warehouse: 'WH03', capacity: 90, remaining: 60 },
    { bin_id: 'B401', warehouse: 'WH04', capacity: 180, remaining: 120 },
    { bin_id: 'B402', warehouse: 'WH04', capacity: 75, remaining: 25 },
    { bin_id: 'B501', warehouse: 'WH05', capacity: 110, remaining: 70 },
    { bin_id: 'B502', warehouse: 'WH05', capacity: 95, remaining: 95 },
    { bin_id: 'B601', warehouse: 'WH06', capacity: 130, remaining: 40 },
    { bin_id: 'B701', warehouse: 'WH07', capacity: 160, remaining: 100 },
    { bin_id: 'B702', warehouse: 'WH07', capacity: 85, remaining: 15 },
  ],
  parts: [
    { part_no: 'P-001', description: 'Hydraulic Valve', type: 'Part', price: 120.00, stock: 45 },
    { part_no: 'P-002', description: 'Engine Block Assy', type: 'Assembly', price: 4500.00, stock: 12 },
    { part_no: 'P-003', description: 'Transmission Belt', type: 'Part', price: 45.50, stock: 150 },
    { part_no: 'P-004', description: 'Control Module', type: 'Assembly', price: 850.00, stock: 5 },
    { part_no: 'P-005', description: 'Brake Pads', type: 'Part', price: 85.00, stock: 200 },
    { part_no: 'P-006', description: 'Fuel Pump Assy', type: 'Assembly', price: 320.00, stock: 18 },
    { part_no: 'P-007', description: 'Air Filter', type: 'Part', price: 25.00, stock: 300 },
    { part_no: 'P-008', description: 'Alternator Assy', type: 'Assembly', price: 280.00, stock: 22 },
    { part_no: 'P-009', description: 'Spark Plugs', type: 'Part', price: 8.50, stock: 500 },
    { part_no: 'P-010', description: 'Radiator Assy', type: 'Assembly', price: 195.00, stock: 15 },
    { part_no: 'P-011', description: 'Oil Filter', type: 'Part', price: 12.00, stock: 400 },
    { part_no: 'P-012', description: 'Transmission Assy', type: 'Assembly', price: 1200.00, stock: 8 },
  ],
  backorders: [
    { id: 'BO-1001', part_no: 'P-004', manager: 'Tony Smith', orderDate: '2023-11-01', status: 'Active', fulfilledDate: null },
    { id: 'BO-1002', part_no: 'P-001', manager: 'Elena Rogers', orderDate: '2023-10-15', status: 'Completed', fulfilledDate: '2023-10-20' },
    { id: 'BO-1003', part_no: 'P-002', manager: 'Tony Smith', orderDate: '2023-11-20', status: 'Active', fulfilledDate: null },
    { id: 'BO-1004', part_no: 'P-006', manager: 'David Chen', orderDate: '2023-11-25', status: 'Active', fulfilledDate: null },
    { id: 'BO-1005', part_no: 'P-008', manager: 'Maria Garcia', orderDate: '2023-11-10', status: 'Completed', fulfilledDate: '2023-11-15' },
    { id: 'BO-1006', part_no: 'P-010', manager: 'Robert Wilson', orderDate: '2023-11-28', status: 'Active', fulfilledDate: null },
    { id: 'BO-1007', part_no: 'P-012', manager: 'Lisa Thompson', orderDate: '2023-11-05', status: 'Completed', fulfilledDate: '2023-11-12' },
    { id: 'BO-1008', part_no: 'P-005', manager: 'Kevin Brown', orderDate: '2023-11-30', status: 'Active', fulfilledDate: null },
  ],
};

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
    MOCK_DATA.employees.forEach(e => insertEmployee.run(e.employee_no, e.name, e.type, e.phone, e.department));
    insertEmployee.finalize();

    const insertWarehouse = db.prepare(`INSERT INTO warehouses VALUES (?, ?, ?)`);
    MOCK_DATA.warehouses.forEach(w => insertWarehouse.run(w.id, w.location, w.manager));
    insertWarehouse.finalize();

    const insertBin = db.prepare(`INSERT INTO bins VALUES (?, ?, ?, ?)`);
    MOCK_DATA.bins.forEach(b => insertBin.run(b.bin_id, b.warehouse, b.capacity, b.remaining));
    insertBin.finalize();

    const insertPart = db.prepare(`INSERT INTO parts VALUES (?, ?, ?, ?, ?)`);
    MOCK_DATA.parts.forEach(p => insertPart.run(p.part_no, p.description, p.type, p.price, p.stock));
    insertPart.finalize();

    const insertBackorder = db.prepare(`INSERT INTO backorders VALUES (?, ?, ?, ?, ?, ?)`);
    MOCK_DATA.backorders.forEach(b => insertBackorder.run(b.id, b.part_no, b.manager, b.orderDate, b.status, b.fulfilledDate));
    insertBackorder.finalize();

    const insertBot = db.prepare(`INSERT INTO backordersOverTime VALUES (?, ?)`);
    MOCK_DATA.dashboard.backordersOverTime.forEach(b => insertBot.run(b.name, b.count));
    insertBot.finalize();

    console.log("Database initialized successfully!");
    db.close();
});
