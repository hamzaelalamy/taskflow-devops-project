-- TaskFlow Database Initialization Script
-- PostgreSQL Database Setup

-- Drop table if exists
DROP TABLE IF EXISTS welcome_messages;

-- Create welcome messages table
CREATE TABLE welcome_messages (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO welcome_messages (message) VALUES
('🎉 Welcome to TaskFlow! Database connection successful from Private EC2 instance.'),
('✅ Your AWS DevOps CI/CD pipeline is working perfectly!'),
('🚀 Infrastructure deployed via CloudFormation with VPC, Public and Private Subnets');

-- Create additional table for task management (optional)
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample tasks
INSERT INTO tasks (title, description, status) VALUES
('Setup AWS Infrastructure', 'Configure VPC, Subnets, Security Groups', 'completed'),
('Deploy WebApp', 'Deploy React + Express application on EC2', 'completed'),
('Configure CloudWatch', 'Setup monitoring and alerts', 'in-progress'),
('Test CI/CD Pipeline', 'Validate GitHub Actions workflow', 'pending');

-- Grant permissions (already done in CloudFormation UserData but for completeness)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO taskflow_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO taskflow_user;

-- Display confirmation
SELECT 'Database initialized successfully!' as status;
SELECT COUNT(*) as message_count FROM welcome_messages;
SELECT COUNT(*) as task_count FROM tasks;
