const express = require('express');
const router = express.Router();
const db = require('../db/database');

const queryDb = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const getDb = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    // In a real application, you would query the database to verify the user and hash the password.
    // For this demonstration, we are using a hardcoded admin login.
    if (username === 'admin' && password === 'password') {
        const token = 'mock-jwt-token-748923749823'; // Fake JWT token
        return res.json({ token, user: { id: 1, name: 'Admin', role: 'admin' } });
    }
    
    return res.status(401).json({ error: 'Invalid username or password. (Hint: admin / password)' });
});

router.get('/dashboard', async (req, res) => {
    try {
        const totalWarehousesResult = await getDb('SELECT COUNT(*) as count FROM warehouses');
        const totalEmployeesResult = await getDb('SELECT COUNT(*) as count FROM employees');
        const activeBackordersResult = await getDb("SELECT COUNT(*) as count FROM backorders WHERE status = 'Active'");
        const totalPartsResult = await getDb('SELECT sum(stock) as count FROM parts');

        const backordersOverTime = await queryDb('SELECT name, count FROM backordersOverTime');
        
        const partsPerWarehouse = await queryDb(`
            SELECT warehouse as name, sum(remaining) as parts 
            FROM bins 
            GROUP BY warehouse
        `);

        res.json({
            summaries: {
                totalWarehouses: totalWarehousesResult.count,
                totalEmployees: totalEmployeesResult.count,
                activeBackorders: activeBackordersResult.count,
                totalParts: totalPartsResult.count,
            },
            backordersOverTime,
            partsPerWarehouse
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/employees', async (req, res) => {
    const { type } = req.query;
    try {
        let query = 'SELECT * FROM employees';
        let params = [];
        if (type) {
            query += ' WHERE type = ?';
            params.push(type);
        }
        const employees = await queryDb(query, params);
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/employees', (req, res) => {
    const { employee_no, name, type, phone, department } = req.body;
    
    if (!employee_no || !name || !type || !phone || !department) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    
    const query = `INSERT INTO employees (employee_no, name, type, phone, department) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [employee_no, name, type, phone, department], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Employee added successfully', employee_no });
    });
});

router.delete('/employees/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM employees WHERE employee_no = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json({ message: 'Employee deleted successfully' });
    });
});

router.get('/warehouses', async (req, res) => {
    try {
        const rows = await queryDb('SELECT * FROM warehouses');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/warehouses', (req, res) => {
    const { id, location, manager } = req.body;

    if (!id || !location || !manager) {
        return res.status(400).json({ error: 'All fields are required: id, location, manager.' });
    }

    const query = `INSERT INTO warehouses (id, location, manager) VALUES (?, ?, ?)`;
    db.run(query, [id, location, manager], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Warehouse added successfully', id });
    });
});

router.delete('/warehouses/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM warehouses WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Warehouse not found' });
        }
        res.json({ message: 'Warehouse deleted successfully' });
    });
});

router.get('/bins', async (req, res) => {
    try {
        const rows = await queryDb('SELECT * FROM bins');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/parts', async (req, res) => {
    try {
        const rows = await queryDb('SELECT * FROM parts');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/parts', (req, res) => {
    const { part_no, description, type, price, stock } = req.body;
    if (!part_no || !description || !type || price === undefined || stock === undefined) {
        return res.status(400).json({ error: 'All part fields are required.' });
    }
    const query = `INSERT INTO parts (part_no, description, type, price, stock) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [part_no, description, type, price, stock], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Part added successfully', part_no });
    });
});

router.delete('/parts/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM parts WHERE part_no = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Part not found' });
        res.json({ message: 'Part deleted successfully' });
    });
});

router.get('/backorders', async (req, res) => {
    try {
        const rows = await queryDb('SELECT * FROM backorders');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/backorders', (req, res) => {
    const { id, part_no, manager, orderDate, status, fulfilledDate } = req.body;
    if (!id || !part_no || !manager || !orderDate || !status) {
        return res.status(400).json({ error: 'Required fields missing for backorder.' });
    }
    const query = `INSERT INTO backorders (id, part_no, manager, orderDate, status, fulfilledDate) VALUES (?, ?, ?, ?, ?, ?)`;
    // fulfilledDate can be null if not completed
    db.run(query, [id, part_no, manager, orderDate, status, fulfilledDate || null], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Backorder added successfully', id });
    });
});

router.delete('/backorders/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM backorders WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Backorder not found' });
        res.json({ message: 'Backorder deleted successfully' });
    });
});

router.post('/query', async (req, res) => {
    const { queryId } = req.body;
    try {
        switch(queryId) {
            case 'q1':
                return res.json({
                    columns: ['Employee No'],
                    rows: (await queryDb(`
                        SELECT employee_no
                        FROM employees
                        WHERE type = 'Worker' AND department IN (
                            SELECT department FROM employees WHERE name LIKE '%Tony Tona%' AND type = 'Manager'
                        )
                    `)).map(r => Object.values(r))
                });
            case 'q2':
                return res.json({
                    columns: ['Employee No', 'Name'],
                    rows: (await queryDb(`
                        SELECT employee_no, name
                        FROM employees
                        ORDER BY name;
                    `)).map(r => Object.values(r))
                });
            case 'q3':
                return res.json({
                    columns: ['Employee No', 'Phone'],
                    rows: (await queryDb(`
                        SELECT employee_no, phone
                        FROM employees
                        WHERE type = 'Manager';
                    `)).map(r => Object.values(r))
                });
            case 'q4':
                return res.json({
                    columns: ['Part No'],
                    rows: (await queryDb(`
                        SELECT part_no
                        FROM parts
                        WHERE type = 'Assembly'
                        ORDER BY part_no;
                    `)).map(r => Object.values(r))
                });
            case 'q5':
                return res.json({
                    columns: ['Manager', 'Part No', 'Backorder Date', 'Status'],
                    rows: (await queryDb(`
                        SELECT manager, 
                               part_no, 
                               orderDate as backorder_date, 
                               status
                        FROM backorders
                        WHERE status = 'Active';
                    `)).map(r => Object.values(r))
                });
            case 'q6':
                return res.json({
                    columns: ['Manager', 'Part No', 'Backorder Date', 'Fulfilled Date'],
                    rows: (await queryDb(`
                        SELECT manager, 
                               part_no, 
                               orderDate as backorder_date,
                               CASE 
                                   WHEN status = 'Active' THEN '2000-01-01'
                                   ELSE fulfilledDate
                               END AS fulfilled_date
                        FROM backorders;
                    `)).map(r => Object.values(r))
                });
            case 'q7':
                return res.json({
                    columns: ['Bin No', 'Remaining Capacity'],
                    rows: (await queryDb(`
                        SELECT bin_id as bin_no,
                               remaining as remaining_capacity
                        FROM bins;
                    `)).map(r => Object.values(r))
                });
            case 'q8':
                return res.json({
                    columns: ['Manager Name', 'Team Size'],
                    rows: (await queryDb(`
                        SELECT m.name as manager_name, count(w.employee_no) as team_size
                        FROM employees m
                        LEFT JOIN employees w ON m.department = w.department AND w.type = 'Worker'
                        WHERE m.type = 'Manager'
                        GROUP BY m.employee_no
                        HAVING team_size = (
                            SELECT MIN(team_count)
                            FROM (
                                SELECT COUNT(w2.employee_no) as team_count
                                FROM employees m2
                                LEFT JOIN employees w2 ON m2.department = w2.department AND w2.type = 'Worker'
                                WHERE m2.type = 'Manager'
                                GROUP BY m2.employee_no
                            ) AS temp
                        );
                    `)).map(r => Object.values(r))
                });
            default:
                return res.status(400).json({ error: "Unknown Query" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
