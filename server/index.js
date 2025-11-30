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

// ==========================================
// TASKS ENDPOINTS
// ==========================================

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.project_id,
        p.name as project_name,
        t.created_at,
        t.updated_at
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      ORDER BY t.created_at DESC
    `);
    
    res.json({
      success: true,
      count: result.rows.length,
      tasks: result.rows
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    
    // If table doesn't exist, return empty array
    if (error.code === '42P01') {
      return res.json({
        success: true,
        count: 0,
        tasks: [],
        message: 'Tasks table not yet created'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      tasks: []
    });
  }
});

// Get single task
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.project_id,
        p.name as project_name,
        t.created_at,
        t.updated_at
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, status, project_id } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    const result = await pool.query(`
      INSERT INTO tasks (title, description, status, project_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [title, description || '', status || 'pending', project_id || null]);
    
    res.status(201).json({
      success: true,
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating task:', error);
    
    // If table doesn't exist, provide helpful message
    if (error.code === '42P01') {
      return res.status(500).json({
        success: false,
        error: 'Tasks table not yet created. Please run database migrations.',
        hint: 'Run the init.sql script on your database'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, project_id } = req.body;
    
    const result = await pool.query(`
      UPDATE tasks
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        project_id = COALESCE($4, project_id),
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `, [title, description, status, project_id, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Task deleted successfully',
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==========================================
// PROJECTS ENDPOINTS
// ==========================================

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.created_at,
        p.updated_at,
        COUNT(t.id) as task_count
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    
    res.json({
      success: true,
      count: result.rows.length,
      projects: result.rows
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    
    // If table doesn't exist, return empty array
    if (error.code === '42P01') {
      return res.json({
        success: true,
        count: 0,
        projects: [],
        message: 'Projects table not yet created'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      projects: []
    });
  }
});

// Get single project
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const projectResult = await pool.query(`
      SELECT * FROM projects WHERE id = $1
    `, [id]);
    
    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    const tasksResult = await pool.query(`
      SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC
    `, [id]);
    
    res.json({
      success: true,
      project: {
        ...projectResult.rows[0],
        tasks: tasksResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new project
app.post('/api/projects', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required'
      });
    }
    
    const result = await pool.query(`
      INSERT INTO projects (name, description)
      VALUES ($1, $2)
      RETURNING *
    `, [name, description || '']);
    
    res.status(201).json({
      success: true,
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating project:', error);
    
    if (error.code === '42P01') {
      return res.status(500).json({
        success: false,
        error: 'Projects table not yet created. Please run database migrations.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update project
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const result = await pool.query(`
      UPDATE projects
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [name, description, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, delete all tasks associated with this project
    await pool.query('DELETE FROM tasks WHERE project_id = $1', [id]);
    
    // Then delete the project
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Project and associated tasks deleted successfully',
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get tasks statistics
app.get('/api/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_tasks,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tasks,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
        (SELECT COUNT(*) FROM projects) as total_projects
      FROM tasks
    `);
    
    res.json({
      success: true,
      stats: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.json({
      success: true,
      stats: {
        total_tasks: 0,
        pending_tasks: 0,
        in_progress_tasks: 0,
        completed_tasks: 0,
        total_projects: 0
      }
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
      'GET /api/db-status',
      'GET /api/tasks',
      'POST /api/tasks',
      'GET /api/tasks/:id',
      'PUT /api/tasks/:id',
      'DELETE /api/tasks/:id',
      'GET /api/projects',
      'POST /api/projects',
      'GET /api/projects/:id',
      'PUT /api/projects/:id',
      'DELETE /api/projects/:id',
      'GET /api/stats'
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