const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

// Load .env from the current directory explicitly
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Log environment variables at startup (for debugging)
console.log('========================================');
console.log('🔍 Environment Configuration Check');
console.log('========================================');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('PORT:', PORT);
console.log('DB_HOST:', process.env.DB_HOST || '❌ MISSING');
console.log('DB_PORT:', process.env.DB_PORT || '❌ MISSING');
console.log('DB_NAME:', process.env.DB_NAME || '❌ MISSING');
console.log('DB_USER:', process.env.DB_USER || '❌ MISSING');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ SET' : '❌ MISSING');
console.log('========================================');

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ ERROR: Missing required environment variables:');
  missingEnvVars.forEach(varName => console.error(`  - ${varName}`));
  console.error('\n💡 Make sure .env file exists in:', __dirname);
  console.error('💡 Or set environment variables directly\n');
  // Don't exit in production, just warn
  if (process.env.NODE_ENV === 'production') {
    console.error('⚠️  Continuing anyway in production mode, but database will likely fail...\n');
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool - REMOVED fallbacks to force proper configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test database connection on startup with detailed logging
pool.connect((err, client, release) => {
  if (err) {
    console.error('========================================');
    console.error('❌ DATABASE CONNECTION FAILED');
    console.error('========================================');
    console.error('Error:', err.message);
    console.error('Code:', err.code);
    console.error('\n💡 Troubleshooting:');
    console.error('  1. Check if database server is running');
    console.error('  2. Verify DB_HOST is correct:', process.env.DB_HOST);
    console.error('  3. Verify network connectivity to database');
    console.error('  4. Check security group rules allow port 5432');
    console.error('  5. Verify database credentials are correct');
    console.error('========================================\n');
  } else {
    console.log('========================================');
    console.log('✅ DATABASE CONNECTED SUCCESSFULLY');
    console.log('========================================');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('Database:', process.env.DB_NAME);
    console.log('User:', process.env.DB_USER);
    console.log('========================================\n');
    release();
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Hello World! WebApp is running on AWS EC2 (Public Subnet)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      host: process.env.DB_HOST,
      configured: !!process.env.DB_HOST
    }
  });
});

// Get message from database
app.get('/api/message', async (req, res) => {
  try {
    const result = await pool.query('SELECT message FROM welcome_messages WHERE id = 1');
    
    if (result.rows.length > 0) {
      res.json({
        success: true,
        message: result.rows[0].message,
        source: 'PostgreSQL Database (Private EC2)'
      });
    } else {
      res.json({
        success: true,
        message: 'Database is connected but no message found',
        source: 'PostgreSQL Database (Private EC2)'
      });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message from database',
      error: error.message
    });
  }
});

// Get all messages
app.get('/api/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM welcome_messages ORDER BY id');
    res.json({
      success: true,
      count: result.rows.length,
      messages: result.rows
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add a new message (optional - for testing)
app.post('/api/message', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }
    
    const result = await pool.query(
      'INSERT INTO welcome_messages (message) VALUES ($1) RETURNING *',
      [message]
    );
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Database status endpoint
app.get('/api/db-status', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as version');
    res.json({
      status: 'connected',
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      timestamp: result.rows[0].current_time,
      version: result.rows[0].version
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    availableRoutes: [
      'GET /api/health',
      'GET /api/message',
      'GET /api/messages',
      'POST /api/message',
      'GET /api/db-status'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('========================================');
  console.log('🚀 SERVER STARTED');
  console.log('========================================');
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  console.log('========================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});