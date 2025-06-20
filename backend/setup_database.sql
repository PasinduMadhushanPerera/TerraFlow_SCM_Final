-- Database setup for TerraFlow SCM
-- Run this in your MySQL database

USE terraflow;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
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
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
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
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create material_requests table
CREATE TABLE IF NOT EXISTS material_requests (
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
);

-- Create deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
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
);

-- Add is_active column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Insert sample products
INSERT IGNORE INTO products (name, description, price, category, stock_quantity, unit, minimum_stock) VALUES
('Red Clay', 'High-quality red clay for pottery', 25.00, 'Raw Materials', 500, 'kg', 100),
('White Clay', 'Premium white clay for fine pottery', 30.00, 'Raw Materials', 300, 'kg', 80),
('Glazing Material', 'Ceramic glazing compound', 45.00, 'Supplies', 150, 'liters', 30),
('Pottery Tools Set', 'Complete set of pottery tools', 75.00, 'Tools', 25, 'sets', 5),
('Kiln Bricks', 'Fire-resistant kiln bricks', 15.00, 'Equipment', 200, 'pieces', 50),
('Clay Pot Small', 'Handcrafted small clay pot', 12.00, 'Finished Products', 80, 'pieces', 20),
('Clay Pot Medium', 'Handcrafted medium clay pot', 18.00, 'Finished Products', 60, 'pieces', 15),
('Clay Pot Large', 'Handcrafted large clay pot', 25.00, 'Finished Products', 40, 'pieces', 10),
('Decorative Vase', 'Beautiful decorative clay vase', 35.00, 'Finished Products', 30, 'pieces', 8),
('Clay Plates Set', 'Set of 6 clay plates', 45.00, 'Finished Products', 25, 'sets', 5);

-- Insert sample orders
INSERT IGNORE INTO orders (customer_id, total_amount, status, order_date, delivery_address) VALUES
(2, 150.00, 'completed', '2024-06-01', '123 Customer Street'),
(2, 75.00, 'pending', '2024-06-07', '123 Customer Street'),
(2, 200.00, 'processing', '2024-06-05', '123 Customer Street');

-- Insert sample order items
INSERT IGNORE INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 5, 25.00, 125.00),
(1, 4, 1, 75.00, 75.00),
(2, 6, 3, 12.00, 36.00),
(2, 7, 2, 18.00, 36.00),
(3, 2, 4, 30.00, 120.00),
(3, 3, 2, 45.00, 90.00);

-- Insert sample material requests
INSERT IGNORE INTO material_requests (supplier_id, material_type, quantity, unit, required_date, description, status) VALUES
(3, 'Red Clay Raw', 1000, 'kg', '2024-06-15', 'High-quality red clay for pottery production', 'pending'),
(3, 'White Clay Raw', 500, 'kg', '2024-06-20', 'Premium white clay for fine pottery', 'approved'),
(3, 'Glazing Chemicals', 100, 'kg', '2024-06-18', 'Ceramic glazing materials', 'in_progress');

-- Insert sample deliveries
INSERT IGNORE INTO deliveries (supplier_id, material_request_id, material_type, quantity, unit, requested_date, delivery_date, status, tracking_number) VALUES
(3, 2, 'White Clay Raw', 500, 'kg', '2024-06-20', '2024-06-18', 'delivered', 'TF001234'),
(3, 3, 'Glazing Chemicals', 100, 'kg', '2024-06-18', NULL, 'in_transit', 'TF001235'),
(3, 1, 'Red Clay Raw', 1000, 'kg', '2024-06-15', NULL, 'pending', NULL);
