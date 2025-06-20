const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// MySQL connection pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // your MySQL password
  database: 'terraflow', // your database name
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  idleTimeout: 300000,
  multipleStatements: true
});

// Test the connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL connection error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.');
    }
  } else {
    console.log('Connected to MySQL as id', connection.threadId);
    connection.release();
  }
});

// Handle connection events
db.on('connection', function (connection) {
  console.log('DB Connection established as id ' + connection.threadId);
});

db.on('error', function(err) {
  console.error('Database error:', err);
  if(err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Lost connection to database. Reconnecting...');
  } else {
    throw err;
  }
});

// Registration route
app.post('/api/register', async (req, res) => {
  const data = req.body;
  console.log('Registration request received:', data);

  if (!data.role || !data.fullName || !data.email || !data.password) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  if (!data.termsAccepted) {
    return res.status(400).json({ success: false, message: 'Terms must be accepted' });
  }

  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    let mobile = null;
    let address = null;
    let businessName = null;
    let businessDoc = null;

    if (data.role === 'customer') {
      if (!data.mobile || !data.address) {
        return res.status(400).json({ success: false, message: 'Missing customer details (mobile, address)' });
      }
      mobile = data.mobile;
      address = data.address;
    } else if (data.role === 'supplier') {
      if (!data.businessName || !data.contactNo || !data.businessAddress) {
        return res.status(400).json({ success: false, message: 'Missing supplier details (business name, contact no, business address)' });
      }
      businessName = data.businessName;
      mobile = data.contactNo;
      address = data.businessAddress;
      businessDoc = data.businessDocument || null;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be customer or supplier' });
    }

    const sql = `
      INSERT INTO users (role, full_name, email, password_hash, mobile, address, business_name, business_document)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.role,
      data.fullName,
      data.email,
      hashedPassword,
      mobile,
      address,
      businessName,
      businessDoc
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Database error:', err);

        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        if (err.code === 'ER_NO_SUCH_TABLE') {
          return res.status(500).json({ success: false, message: 'Users table not found. Please check database setup.' });
        }

        return res.status(500).json({ success: false, message: 'Database error: ' + err.message });
      }

      console.log('Registration successful for:', data.email);
      return res.status(200).json({
        success: true,
        message: 'Registration successful',
        userId: result.insertId
      });
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    // Hardcoded admin login check (takes precedence over database)
    if (email === 'admin@terraflow.com' && password === 'admin123') {
      return res.json({
        success: true,
        message: 'Admin login successful',
        user: {
          id: 1,
          email: 'admin@terraflow.com',
          role: 'admin',
          full_name: 'System Administrator',
        }
      });
    }

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const user = results[0];
      
      // Compare password with hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      // Login successful
      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Seed demo users route
app.post('/api/seed-demo-users', async (req, res) => {
  console.log('Seeding demo users...');
  
  try {
    const demoUsers = [
      {
        role: 'admin',
        full_name: 'Admin User',
        email: 'admin@terraflow.com',
        password: 'admin123',
        mobile: '1234567890',
        address: 'Admin Office'
      },
      {
        role: 'customer',
        full_name: 'John Customer',
        email: 'customer@example.com',
        password: 'customer123',
        mobile: '9876543210',
        address: '123 Customer Street'
      },
      {
        role: 'supplier',
        full_name: 'Supplier Company',
        email: 'supplier@example.com',
        password: 'supplier123',
        mobile: '5555555555',
        address: '456 Supplier Avenue',
        business_name: 'Clay Supplier Co.'
      }
    ];

    for (const user of demoUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Check if user already exists
      const checkSql = 'SELECT id FROM users WHERE email = ?';
      const existingUser = await new Promise((resolve, reject) => {
        db.query(checkSql, [user.email], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      if (existingUser.length === 0) {
        const sql = `INSERT INTO users (role, full_name, email, password_hash, mobile, address, business_name)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        const values = [
          user.role,
          user.full_name,
          user.email,
          hashedPassword,
          user.mobile,
          user.address,
          user.business_name || null
        ];

        await new Promise((resolve, reject) => {
          db.query(sql, values, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
        
        console.log(`Demo user created: ${user.email}`);
      } else {
        console.log(`Demo user already exists: ${user.email}`);
      }
    }
    
    console.log('Demo users seeding completed');
    res.status(200).json({ 
      success: true, 
      message: 'Demo users seeded successfully',
      credentials: [
        { email: 'admin@terraflow.com', password: 'admin123', role: 'admin' },
        { email: 'customer@example.com', password: 'customer123', role: 'customer' },
        { email: 'supplier@example.com', password: 'supplier123', role: 'supplier' }
      ]
    });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error seeding demo users: ' + error.message 
    });
  }
});

// Fix admin user route
app.post('/api/fix-admin-role', (req, res) => {
  console.log('Fixing admin user role...');
  
  const updateSql = 'UPDATE users SET role = ? WHERE email = ?';
  db.query(updateSql, ['admin', 'admin@terraflow.com'], (err, result) => {
    if (err) {
      console.error('Error updating admin role:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error updating admin role: ' + err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin user not found in database' 
      });
    }
    
    console.log('Admin user role updated successfully');
    res.status(200).json({ 
      success: true, 
      message: `Admin user role updated successfully. Affected rows: ${result.affectedRows}` 
    });
  });
});

// Admin Dashboard Analytics
app.get('/api/admin/dashboard-stats', (req, res) => {
  const queries = {
    totalUsers: 'SELECT COUNT(*) as count FROM users',
    totalCustomers: 'SELECT COUNT(*) as count FROM users WHERE role = "customer"',
    totalSuppliers: 'SELECT COUNT(*) as count FROM users WHERE role = "supplier"',
    totalProducts: 'SELECT COUNT(*) as count FROM products',
    totalOrders: 'SELECT COUNT(*) as count FROM orders',
    pendingOrders: 'SELECT COUNT(*) as count FROM orders WHERE status = "pending"',
    totalRevenue: 'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = "completed"'
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    db.query(query, (err, result) => {
      if (err) {
        console.error(`Error in ${key} query:`, err);
        results[key] = 0;
      } else {
        results[key] = result[0].count || result[0].total || 0;
      }
      
      completed++;
      if (completed === total) {
        res.json({ success: true, data: results });
      }
    });
  });
});

// User Management Endpoints
app.get('/api/admin/users', (req, res) => {
  const sql = 'SELECT id, role, full_name, email, mobile, address, business_name, created_at, is_active FROM users ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, data: results });
  });
});

app.put('/api/admin/users/:id/status', (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  
  const sql = 'UPDATE users SET is_active = ? WHERE id = ?';
  db.query(sql, [is_active, id], (err, result) => {
    if (err) {
      console.error('Error updating user status:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, message: 'User status updated successfully' });
  });
});

app.delete('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  
  const sql = 'DELETE FROM users WHERE id = ? AND role != "admin"';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found or cannot delete admin' });
    }
    
    res.json({ success: true, message: 'User deleted successfully' });
  });
});

// Product Management Endpoints
app.get('/api/admin/products', (req, res) => {
  const sql = 'SELECT * FROM products ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, data: results });
  });
});

app.post('/api/admin/products', (req, res) => {
  const { name, description, price, category, stock_quantity, unit, minimum_stock } = req.body;
  
  if (!name || !price || !category || !stock_quantity) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  const sql = `INSERT INTO products (name, description, price, category, stock_quantity, unit, minimum_stock, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;
  
  db.query(sql, [name, description, price, category, stock_quantity, unit || 'pieces', minimum_stock || 10], (err, result) => {
    if (err) {
      console.error('Error creating product:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    res.json({ success: true, message: 'Product created successfully', id: result.insertId });
  });
});

app.put('/api/admin/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, stock_quantity, unit, minimum_stock } = req.body;
  
  const sql = `UPDATE products SET name = ?, description = ?, price = ?, category = ?, 
               stock_quantity = ?, unit = ?, minimum_stock = ?, updated_at = NOW() WHERE id = ?`;
  
  db.query(sql, [name, description, price, category, stock_quantity, unit, minimum_stock, id], (err, result) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, message: 'Product updated successfully' });
  });
});

app.delete('/api/admin/products/:id', (req, res) => {
  const { id } = req.params;
  
  const sql = 'DELETE FROM products WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, message: 'Product deleted successfully' });
  });
});

// Order Management Endpoints
app.get('/api/admin/orders', (req, res) => {
  const sql = `SELECT o.*, u.full_name as customer_name, u.email as customer_email 
               FROM orders o 
               JOIN users u ON o.customer_id = u.id 
               ORDER BY o.created_at DESC`;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, data: results });
  });
});

app.put('/api/admin/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const validStatuses = ['pending', 'approved', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  
  const sql = 'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?';
  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error('Error updating order status:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({ success: true, message: 'Order status updated successfully' });
  });
});

// Supplier Management Endpoints
app.get('/api/admin/suppliers', (req, res) => {
  const sql = `SELECT u.*, 
               COUNT(DISTINCT mr.id) as material_requests,
               COUNT(DISTINCT d.id) as deliveries
               FROM users u 
               LEFT JOIN material_requests mr ON u.id = mr.supplier_id 
               LEFT JOIN deliveries d ON u.id = d.supplier_id 
               WHERE u.role = 'supplier' 
               GROUP BY u.id 
               ORDER BY u.created_at DESC`;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching suppliers:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, data: results });
  });
});

app.post('/api/admin/material-requests', (req, res) => {
  const { supplier_id, material_type, quantity, unit, required_date, description } = req.body;
  
  if (!supplier_id || !material_type || !quantity) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  const sql = `INSERT INTO material_requests (supplier_id, material_type, quantity, unit, required_date, description, status, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`;
  
  db.query(sql, [supplier_id, material_type, quantity, unit || 'kg', required_date, description], (err, result) => {
    if (err) {
      console.error('Error creating material request:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    res.json({ success: true, message: 'Material request created successfully', id: result.insertId });
  });
});

// Get material requests
app.get('/api/admin/material-requests', (req, res) => {
  const sql = `SELECT mr.*, u.full_name as supplier_name, u.business_name 
               FROM material_requests mr 
               JOIN users u ON mr.supplier_id = u.id 
               ORDER BY mr.created_at DESC`;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching material requests:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, data: results });
  });
});

// Reports Endpoints
app.get('/api/admin/reports/sales', (req, res) => {
  const { start_date, end_date } = req.query;
  
  let sql = `SELECT 
             DATE(o.created_at) as date,
             COUNT(o.id) as total_orders,
             SUM(o.total_amount) as total_revenue,
             AVG(o.total_amount) as avg_order_value
             FROM orders o 
             WHERE o.status = 'completed'`;
  
  const params = [];
  if (start_date && end_date) {
    sql += ' AND DATE(o.created_at) BETWEEN ? AND ?';
    params.push(start_date, end_date);
  }
  
  sql += ' GROUP BY DATE(o.created_at) ORDER BY date DESC LIMIT 30';
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching sales report:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, data: results });
  });
});

app.get('/api/admin/reports/inventory', (req, res) => {
  const sql = `SELECT 
               p.name,
               p.category,
               p.stock_quantity,
               p.minimum_stock,
               CASE 
                 WHEN p.stock_quantity <= p.minimum_stock THEN 'Low Stock'
                 WHEN p.stock_quantity <= p.minimum_stock * 2 THEN 'Medium Stock'
                 ELSE 'Good Stock'
               END as stock_status,
               p.price * p.stock_quantity as inventory_value
               FROM products p 
               ORDER BY p.stock_quantity ASC`;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching inventory report:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, data: results });
  });
});

app.get('/api/admin/reports/suppliers', (req, res) => {
  const sql = `SELECT 
               u.full_name as supplier_name,
               u.business_name,
               u.email,
               COUNT(DISTINCT mr.id) as total_requests,
               COUNT(DISTINCT CASE WHEN mr.status = 'completed' THEN mr.id END) as completed_requests,
               COUNT(DISTINCT d.id) as total_deliveries,
               AVG(CASE WHEN d.delivery_date IS NOT NULL THEN DATEDIFF(d.delivery_date, d.requested_date) END) as avg_delivery_days
               FROM users u 
               LEFT JOIN material_requests mr ON u.id = mr.supplier_id 
               LEFT JOIN deliveries d ON u.id = d.supplier_id 
               WHERE u.role = 'supplier' 
               GROUP BY u.id 
               ORDER BY completed_requests DESC`;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching supplier report:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, data: results });
  });
});

// Smart Production Recommendations
app.get('/api/admin/production-recommendations', (req, res) => {
  const sql = `SELECT 
               p.name as product_name,
               p.stock_quantity,
               p.minimum_stock,
               COALESCE(recent_sales.avg_weekly_sales, 0) as avg_weekly_sales,
               CASE 
                 WHEN p.stock_quantity <= p.minimum_stock THEN 'Urgent'
                 WHEN p.stock_quantity <= p.minimum_stock * 2 THEN 'Medium'
                 ELSE 'Low'
               END as priority,
               GREATEST(p.minimum_stock * 3 - p.stock_quantity, 0) as recommended_production
               FROM products p
               LEFT JOIN (
                 SELECT 
                   oi.product_id,
                   AVG(oi.quantity) as avg_weekly_sales
                 FROM order_items oi
                 JOIN orders o ON oi.order_id = o.id
                 WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 4 WEEK)
                 GROUP BY oi.product_id
               ) recent_sales ON p.id = recent_sales.product_id
               WHERE p.stock_quantity <= p.minimum_stock * 2
               ORDER BY 
                 CASE priority 
                   WHEN 'Urgent' THEN 1 
                   WHEN 'Medium' THEN 2 
                   ELSE 3 
                 END,
                 recommended_production DESC`;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching production recommendations:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, data: results });
  });
});

// Database setup endpoint
app.post('/api/setup-database', (req, res) => {
  console.log('Setting up database tables...');
  
  const tables = [
    `CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      category VARCHAR(100) NOT NULL,
      stock_quantity INT NOT NULL DEFAULT 0,
      unit VARCHAR(50) DEFAULT 'pieces',
      minimum_stock INT DEFAULT 10,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT NOT NULL,
      total_amount DECIMAL(10, 2) NOT NULL,
      status ENUM('pending', 'approved', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
      order_date DATE NOT NULL,
      delivery_address TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      unit_price DECIMAL(10, 2) NOT NULL,
      total_price DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS material_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      supplier_id INT NOT NULL,
      material_type VARCHAR(255) NOT NULL,
      quantity DECIMAL(10, 2) NOT NULL,
      unit VARCHAR(50) DEFAULT 'kg',
      required_date DATE,
      description TEXT,
      status ENUM('pending', 'approved', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
      requested_date DATE DEFAULT (CURRENT_DATE),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS deliveries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      supplier_id INT NOT NULL,
      material_request_id INT,
      material_type VARCHAR(255) NOT NULL,
      quantity DECIMAL(10, 2) NOT NULL,
      unit VARCHAR(50) DEFAULT 'kg',
      requested_date DATE NOT NULL,
      delivery_date DATE,
      status ENUM('pending', 'in_transit', 'delivered', 'cancelled') DEFAULT 'pending',
      tracking_number VARCHAR(100),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (material_request_id) REFERENCES material_requests(id) ON DELETE SET NULL
    )`
  ];

  let completed = 0;
  const total = tables.length;
  let hasError = false;

  tables.forEach((createTableSQL, index) => {
    db.query(createTableSQL, (err, result) => {
      if (err) {
        console.error(`Error creating table ${index + 1}:`, err);
        hasError = true;
      } else {
        console.log(`Table ${index + 1} created successfully`);
      }
      
      completed++;
      if (completed === total) {
        if (hasError) {
          res.status(500).json({ success: false, message: 'Some tables failed to create' });
        } else {
          // Add is_active column to users table
          db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE', (err) => {
            if (err && !err.message.includes('Duplicate column name')) {
              console.error('Error adding is_active column:', err);
            }
            
            // Insert sample data
            insertSampleData(res);
          });
        }
      }
    });
  });
});

function insertSampleData(res) {
  const sampleProducts = [
    ['Red Clay', 'High-quality red clay for pottery', 25.00, 'Raw Materials', 500, 'kg', 100],
    ['White Clay', 'Premium white clay for fine pottery', 30.00, 'Raw Materials', 300, 'kg', 80],
    ['Glazing Material', 'Ceramic glazing compound', 45.00, 'Supplies', 150, 'liters', 30],
    ['Pottery Tools Set', 'Complete set of pottery tools', 75.00, 'Tools', 25, 'sets', 5],
    ['Kiln Bricks', 'Fire-resistant kiln bricks', 15.00, 'Equipment', 200, 'pieces', 50],
    ['Clay Pot Small', 'Handcrafted small clay pot', 12.00, 'Finished Products', 80, 'pieces', 20],
    ['Clay Pot Medium', 'Handcrafted medium clay pot', 18.00, 'Finished Products', 60, 'pieces', 15],
    ['Clay Pot Large', 'Handcrafted large clay pot', 25.00, 'Finished Products', 40, 'pieces', 10],
    ['Decorative Vase', 'Beautiful decorative clay vase', 35.00, 'Finished Products', 30, 'pieces', 8],
    ['Clay Plates Set', 'Set of 6 clay plates', 45.00, 'Finished Products', 25, 'sets', 5]
  ];

  const productSQL = 'INSERT IGNORE INTO products (name, description, price, category, stock_quantity, unit, minimum_stock) VALUES ?';
  
  db.query(productSQL, [sampleProducts], (err) => {
    if (err) {
      console.error('Error inserting sample products:', err);
    } else {
      console.log('Sample products inserted successfully');
    }
    
    res.json({ 
      success: true, 
      message: 'Database setup completed successfully with sample data' 
    });
  });
}

// Database test endpoint
app.get('/api/test-db', (req, res) => {
  // First test basic connection
  db.query('SELECT 1 as test', (err, result) => {
    if (err) {
      console.error('Basic connection test failed:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Database connection failed',
        error: err.message 
      });
    }
    
    // Test if terraflow database exists
    db.query('SHOW DATABASES LIKE "terraflow"', (err, dbResult) => {
      if (err) {
        console.error('Database check failed:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to check database',
          error: err.message 
        });
      }
      
      // Check if users table exists
      db.query('SHOW TABLES LIKE "users"', (err, tableResult) => {
        if (err) {
          console.error('Table check failed:', err);
        }
        
        res.json({
          success: true,
          message: 'Database test completed',
          data: {
            connectionTest: 'OK',
            terraflowDatabaseExists: dbResult.length > 0,
            usersTableExists: tableResult ? tableResult.length > 0 : false
          }
        });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
