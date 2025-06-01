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
  database: 'terraflow' // your DB name
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
  console.log('Registration request received:', req.body);
  
  const data = req.body;

  // Validate required fields
  if (!data.role || !data.fullName || !data.email || !data.password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields' 
    });
  }

  if (!data.termsAccepted) {
    return res.status(400).json({ 
      success: false, 
      message: 'Terms not accepted' 
    });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Validate role-specific required fields
    if (data.role === 'customer') {
      if (!data.mobile || !data.address) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing customer required fields (mobile, address)' 
        });
      }
    } else if (data.role === 'supplier') {
      if (!data.businessName || !data.contactNo || !data.businessAddress) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing supplier required fields (businessName, contactNo, businessAddress)' 
        });
      }
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role. Must be customer or supplier' 
      });
    }    // Prepare data for unified users table
    const userData = {
      role: data.role,
      full_name: data.fullName,
      email: data.email,
      password_hash: hashedPassword,
      mobile: data.mobile || data.contactNo || null,
      address: data.address || data.businessAddress || null,
      business_name: data.businessName || null,
      business_document: data.businessDocument || null
    };

    const sql = `INSERT INTO users (role, full_name, email, password_hash, mobile, address, business_name, business_document)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const values = [
      userData.role,
      userData.full_name,
      userData.email,
      userData.password_hash,
      userData.mobile,
      userData.address,
      userData.business_name,
      userData.business_document
    ];

    console.log('Executing SQL:', sql);
    console.log('With values:', values.map((v, i) => i === 3 ? '[PASSWORD HIDDEN]' : v));

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Database error:', err);
        
        // Handle duplicate email error
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ 
            success: false, 
            message: 'Email already exists' 
          });
        }
        
        // Handle table doesn't exist error
        if (err.code === 'ER_NO_SUCH_TABLE') {
          return res.status(500).json({ 
            success: false, 
            message: 'Database tables not found. Please run database setup.' 
          });
        }
        
        return res.status(500).json({ 
          success: false, 
          message: 'Database error: ' + err.message 
        });
      }
      
      console.log('Registration successful for:', data.email);
      res.status(200).json({ 
        success: true, 
        message: 'Registration successful',
        userId: result.insertId
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });  }
});

// Login route
app.post('/api/login', async (req, res) => {
  console.log('Login request received:', req.body);
  
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and password are required' 
    });
  }

  try {
    // Find user by email
    const sql = 'SELECT * FROM users WHERE email = ?';
    
    db.query(sql, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Database error: ' + err.message 
        });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
      
      const user = results[0];
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
      
      // Remove password from response and map full_name to username for frontend compatibility
      const { password_hash, ...userResponse } = user;
      userResponse.username = user.full_name; // Map full_name to username for frontend
      
      console.log('Login successful for:', email);
      res.status(200).json({ 
        success: true, 
        message: 'Login successful',
        user: userResponse
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
