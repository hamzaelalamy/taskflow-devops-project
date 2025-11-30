-- TaskFlow Database Initialization Script
-- PostgreSQL Database Setup

-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS welcome_messages CASCADE;

-- Create welcome messages table
CREATE TABLE welcome_messages (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for welcome messages
INSERT INTO welcome_messages (message) VALUES
('🎉 Welcome to TaskFlow! Database connection successful from Private EC2 instance.'),
('✅ Your AWS DevOps CI/CD pipeline is working perfectly!'),
('🚀 Infrastructure deployed via CloudFormation with VPC, Public and Private Subnets');

-- Create projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample projects
INSERT INTO projects (name, description) VALUES
('Personal', 'Personal tasks and reminders'),
('Work', 'Work-related tasks and projects'),
('Home', 'Home improvement and maintenance'),
('AWS DevOps', 'TaskFlow CI/CD project tasks');

-- Create tasks table with project relationship
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample tasks (now with project_id)
INSERT INTO tasks (title, description, status, project_id) VALUES
('Setup AWS Infrastructure', 'Configure VPC, Subnets, Security Groups', 'completed', 4),
('Deploy WebApp', 'Deploy React + Express application on EC2', 'completed', 4),
('Configure CloudWatch', 'Setup monitoring and alerts', 'in_progress', 4),
('Test CI/CD Pipeline', 'Validate GitHub Actions workflow', 'completed', 4),
('Buy groceries', 'Milk, eggs, bread, and vegetables', 'pending', 1),
('Review pull requests', 'Check team member PRs and provide feedback', 'in_progress', 2),
('Fix leaking faucet', 'Kitchen sink is dripping', 'pending', 3),
('Plan weekend trip', 'Research destinations and book accommodation', 'pending', 1);

-- Create indexes for better performance
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_projects_created_at ON projects(created_at);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions to taskflow_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO taskflow_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO taskflow_user;
GRANT USAGE ON SCHEMA public TO taskflow_user;

-- Display confirmation
SELECT 'Database initialized successfully!' as status;
SELECT COUNT(*) as message_count FROM welcome_messages;
SELECT COUNT(*) as project_count FROM projects;
SELECT COUNT(*) as task_count FROM tasks;

-- Display sample data
SELECT '=== PROJECTS ===' as info;
SELECT id, name, description FROM projects ORDER BY id;

SELECT '=== TASKS ===' as info;
SELECT id, title, status, project_id FROM tasks ORDER BY id;