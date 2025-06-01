const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // your MySQL password
  database: 'terraflow' // your database name
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    throw err;
  }
  console.log('Connected to MySQL');
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

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
