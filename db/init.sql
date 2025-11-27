-- Database initialization script for AWS DevOps Project

CREATE DATABASE IF NOT EXISTS webapp_db;

USE webapp_db;

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO messages (message) VALUES
  ('Hello from the Database! AWS DevOps Project Working!'),
  ('WebApp successfully connected to private database'),
  ('React + Node.js + MySQL on AWS EC2'),
  ('Built with Vite ⚡ - Lightning Fast!');

CREATE USER IF NOT EXISTS 'webapp'@'%' IDENTIFIED BY 'MySecurePass123';
GRANT SELECT, INSERT, UPDATE ON webapp_db.* TO 'webapp'@'%';
FLUSH PRIVILEGES;

SELECT 'Database initialized successfully!' AS Status;
