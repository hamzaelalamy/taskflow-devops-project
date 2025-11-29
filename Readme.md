# 📋 TaskFlow - AWS DevOps CI/CD Project

## 🎯 Project Overview

**TaskFlow** is a full-stack task management application demonstrating modern DevOps practices on AWS. It features a React frontend, Express.js backend, PostgreSQL database, and complete CI/CD automation with GitHub Actions.

### Key Features

- **📝 Task Management**: Create, update, complete, and delete tasks
- **📁 Project Organization**: Group tasks into projects with progress tracking
- **📊 Real-time Statistics**: Dashboard with task completion metrics
- **🔄 Activity Logging**: Track all system activities
- **🎨 Modern UI**: Beautiful, responsive React interface
- **🔐 Secure Architecture**: Public/private subnet separation
- **📈 Monitoring**: CloudWatch logs and metrics
- **🚨 Alerting**: SNS email notifications
- **🤖 Automated Deployment**: Complete CI/CD pipeline

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
                 ┌──────────────┐
                 │   Internet   │
                 │   Gateway    │
                 └──────┬───────┘
                        │
       ┌────────────────┴────────────────────────┐
       │         VPC (10.0.0.0/16)               │
       │                                          │
       │  ┌────────────────────────────────────┐ │
       │  │  Public Subnet (10.0.1.0/24)      │ │
       │  │                                    │ │
       │  │  ┌──────────────────────────────┐ │ │
       │  │  │  EC2 - WebApp (t2.small)     │ │ │
       │  │  │  - Nginx (Port 80)           │◄┼─┼── HTTP Traffic
       │  │  │  - React Frontend (Static)   │ │ │
       │  │  │  - Express API (Port 3000)   │ │ │
       │  │  │  - PM2 Process Manager       │ │ │
       │  │  │  - CloudWatch Agent          │ │ │
       │  │  └─────────────┬────────────────┘ │ │
       │  └────────────────┼──────────────────┘ │
       │                   │                     │
       │                   │ PostgreSQL :5432    │
       │                   ▼                     │
       │  ┌────────────────────────────────────┐ │
       │  │  Private Subnet (10.0.2.0/24)     │ │
       │  │                                    │ │
       │  │  ┌──────────────────────────────┐ │ │
       │  │  │  EC2 - Database (t2.micro)   │ │ │
       │  │  │  - PostgreSQL 14             │ │ │
       │  │  │  - No Public IP              │ │ │
       │  │  │  - Only accessible from VPC  │ │ │
       │  │  └──────────────────────────────┘ │ │
       │  └────────────────────────────────────┘ │
       └─────────────────────────────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │   CloudWatch     │
              │   - EC2 Metrics  │
              │   - App Logs     │
              │   - Nginx Logs   │
              │   - Alarms       │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │   SNS Topic      │
              │   - CPU Alerts   │
              │   - Memory Alerts│
              └──────────────────┘
```

## 📦 Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **CSS3** - Custom styling with gradients and animations
- **Fetch API** - RESTful API communication

### Backend
- **Node.js 18** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **PM2** - Process manager for Node.js

### Infrastructure
- **AWS EC2** - Virtual servers
- **AWS VPC** - Network isolation
- **AWS CloudWatch** - Monitoring and logging
- **AWS SNS** - Email notifications
- **CloudFormation** - Infrastructure as Code
- **Nginx** - Reverse proxy and static file serving

### DevOps
- **GitHub Actions** - CI/CD automation
- **Git** - Version control

## 📁 Project Structure

```
taskflow-devops-project/
│
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD pipeline
│
├── client/                         # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js                 # Main application component
│   │   ├── App.css                # Application styles
│   │   └── index.js               # Entry point
│   └── package.json
│
├── server/                         # Express Backend
│   ├── index.js                   # API server
│   ├── .env.example               # Environment variables template
│   └── package.json
│
├── db/
│   └── init.sql                   # Database schema and seed data
│
├── infrastructure.yml              # CloudFormation template
├── package.json                    # Root package file
└── README.md                       # This file
```

## 🚀 Quick Start

### Prerequisites

1. **AWS Account** with appropriate permissions
2. **GitHub Account**
3. **Node.js 18+** installed locally (for development)
4. **AWS CLI** installed and configured
5. **EC2 Key Pair** created in your AWS region

### Step 1: Clone and Setup Repository

```bash
# Create your GitHub repository
# Then clone it locally
git clone https://github.com/YOUR-USERNAME/taskflow-devops-project.git
cd taskflow-devops-project

# Create directory structure
mkdir -p .github/workflows client/src client/public server db

# Copy all artifact files to their respective locations
# (infrastructure.yml, deploy.yml, App.js, etc.)
```

### Step 2: Local Development (Optional)

```bash
# Install all dependencies
npm run install:all

# Create server/.env file
cat > server/.env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskflow_db
DB_USER=taskflow_user
DB_PASSWORD=your_password
NODE_ENV=development
PORT=3000
EOF

# Start PostgreSQL locally (if you have it installed)
# Initialize the database with db/init.sql

# Start backend (in one terminal)
npm run dev:server

# Start frontend (in another terminal)
npm run dev:client

# Visit http://localhost:3000
```

### Step 3: Configure GitHub Secrets

Go to: **Repository → Settings → Secrets and variables → Actions**

Add these secrets:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `wJalrXUtnFEMI/...` |
| `EC2_KEY_NAME` | EC2 key pair name | `my-devops-key` |
| `SNS_EMAIL` | Your email for alerts | `your-email@example.com` |
| `DB_PASSWORD` | PostgreSQL password | `MySecurePass123!` |

### Step 4: Deploy to AWS

```bash
# Commit and push to trigger deployment
git add .
git commit -m "Initial deployment"
git push origin main

# Or manually trigger from GitHub Actions tab
```

### Step 5: Verify Deployment

1. **GitHub Actions**: Check the workflow run for success
2. **Email**: Confirm SNS subscription (check your inbox)
3. **WebApp**: Visit the URL from deployment summary
4. **CloudWatch**: Check logs and metrics in AWS Console

## 🎮 Using TaskFlow

### Creating Projects

1. Click the **Projects** tab
2. Fill in project name and description
3. Click **Create Project**
4. View project progress on the card

### Managing Tasks

1. Click the **Tasks** tab
2. Enter task title and description
3. Optionally assign to a project
4. Click **Create Task**
5. Check the checkbox to mark complete
6. Use filters to view All/Pending/Completed tasks
7. Delete tasks with the 🗑️ button

### Viewing Statistics

The dashboard shows:
- Total tasks created
- Completed tasks count
- Pending tasks count
- Total projects count

## 📊 Monitoring & Alerts

### CloudWatch Logs

Access logs at: **CloudWatch → Log groups → /aws/ec2/webapp**

Available log streams:
- `nginx-access` - HTTP requests
- `nginx-error` - Server errors

### CloudWatch Alarms

Configured alarms:
- **High CPU**: Alert when CPU > 70%
- **High Memory**: Alert when memory > 80%

### Testing Alerts

```bash
# SSH into WebApp instance
ssh -i your-key.pem ec2-user@<WebApp-IP>

# Generate CPU load
yes > /dev/null &
yes > /dev/null &
yes > /dev/null &

# Wait 5-10 minutes for alert email

# Kill load generation
killall yes
```

## 🔧 API Documentation

### Base URL
```
http://<webapp-ip>/api
```

### Endpoints

#### Health Check
```http
GET /api/health
```

#### Statistics
```http
GET /api/stats
```

#### Projects
```http
GET    /api/projects           # List all projects
GET    /api/projects/:id       # Get single project
POST   /api/projects           # Create project
PUT    /api/projects/:id       # Update project
DELETE /api/projects/:id       # Delete project
```

#### Tasks
```http
GET    /api/tasks              # List all tasks
GET    /api/tasks/:id          # Get single task
POST   /api/tasks              # Create task
PUT    /api/tasks/:id          # Update task
DELETE /api/tasks/:id          # Delete task
```

Query parameters for GET /api/tasks:
- `status` - Filter by status (pending/completed)
- `project_id` - Filter by project

#### Activity Log
```http
GET /api/activity              # Get activity log (last 50)
```

## 🧪 Testing

### Manual Testing

```bash
# Get WebApp URL
aws cloudformation describe-stacks \
  --stack-name taskflow-cicd-project \
  --query "Stacks[0].Outputs[?OutputKey=='WebAppURL'].OutputValue" \
  --output text

# Test API health
curl http://<webapp-ip>/api/health

# Create a task
curl -X POST http://<webapp-ip>/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"Testing API"}'

# Get all tasks
curl http://<webapp-ip>/api/tasks
```

### Automated Testing

The CI pipeline runs:
- Dependency installation
- Code linting
- Frontend build
- CloudFormation validation
- Security scans

## 📸 Screenshots Checklist

For project submission, capture:

1. **✅ GitHub Actions**
   - Successful CI pipeline
   - Successful CD pipeline
   - Deployment summary with URL

2. **✅ TaskFlow Application**
   - Dashboard with statistics
   - Task list with completed/pending tasks
   - Project view with progress bars
   - Creating new task
   - Creating new project

3. **✅ AWS Console - CloudFormation**
   - Stack status: CREATE_COMPLETE
   - Resources tab (all resources)
   - Outputs tab with URLs

4. **✅ AWS Console - EC2**
   - Both instances running
   - Security groups configured
   - Public/private subnet assignment

5. **✅ AWS Console - CloudWatch**
   - Log groups with logs
   - Nginx access logs
   - Metrics dashboard
   - Configured alarms

6. **✅ Email Notifications**
   - SNS subscription confirmation
   - High CPU alert (if triggered)

7. **✅ Architecture Diagram**
   - Network topology
   - Data flow
   - AWS services used

## 🔒 Security Best Practices

- ✅ Database in private subnet (no internet access)
- ✅ Security groups with least privilege
- ✅ No hardcoded credentials (using environment variables)
- ✅ HTTPS ready (configure SSL certificate for production)
- ✅ IAM roles instead of access keys on EC2
- ✅ Regular security updates via yum update

## 💰 Cost Optimization

This project uses:
- **2x t2.micro** or **t2.small** EC2 instances (~$10-20/month)
- **Minimal CloudWatch** usage (~$1/month)
- **Low SNS** usage (nearly free)
- **Free tier eligible** for new AWS accounts

**Total estimated cost**: ~$15-25/month

## 🗑️ Cleanup Instructions

### Via GitHub Actions (Recommended)
1. Go to **Actions** tab
2. Select "AWS CI/CD Pipeline - TaskFlow"
3. Click **Run workflow**
4. Wait for cleanup completion

### Via AWS CLI
```bash
# Delete CloudFormation stack
aws cloudformation delete-stack --stack-name taskflow-cicd-project

# Wait for deletion
aws cloudformation wait stack-delete-complete --stack-name taskflow-cicd-project

# Verify deletion
aws cloudformation list-stacks \
  --query "StackSummaries[?StackName=='taskflow-cicd-project']"
```

### Manual Cleanup (if needed)
1. Delete EC2 instances
2. Delete VPC (will delete subnets, route tables, IGW)
3. Delete Security Groups
4. Delete CloudWatch Log Groups
5. Delete SNS Topic

## 🐛 Troubleshooting

### Application Not Loading

```bash
# Check instance status
aws ec2 describe-instance-status \
  --instance-ids <instance-id>

# SSH and check services
ssh -i key.pem ec2-user@<webapp-ip>
sudo systemctl status nginx
pm2 list
pm2 logs taskflow-api
```

### Database Connection Error

```bash
# SSH to WebApp
ssh -i key.pem ec2-user@<webapp-ip>

# Test DB connection
psql -h <db-private-ip> -U taskflow_user -d taskflow_db

# Check environment variables
cat /opt/webapp/.env

# Check logs
pm2 logs taskflow-api
```

### CloudFormation Stack Failed

```bash
# View stack events
aws cloudformation describe-stack-events \
  --stack-name taskflow-cicd-project \
  --max-items 20

# Check specific resource
aws cloudformation describe-stack-resource \
  --stack-name taskflow-cicd-project \
  --logical-resource-id WebAppInstance
```

## 🎓 Learning Outcomes

This project demonstrates:

1. **AWS Cloud Infrastructure**
   - VPC design with public/private subnets
   - Security group configuration
   - EC2 instance management

2. **DevOps Practices**
   - Infrastructure as Code (CloudFormation)
   - CI/CD pipelines (GitHub Actions)
   - Automated testing and deployment

3. **Full-Stack Development**
   - React frontend development
   - RESTful API design with Express
   - PostgreSQL database management

4. **Monitoring & Operations**
   - CloudWatch logging and metrics
   - SNS alerting
   - Application health monitoring

5. **Security**
   - Network isolation
   - Least privilege access
   - Secrets management

## 📚 Additional Resources

- [AWS CloudFormation Documentation](https://docs.aws.amazon.com/cloudformation/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [AWS VPC Best Practices](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-best-practices.html)

## 👤 Author

**Your Name**
- GitHub: [@your-username](https://github.com/your-username)
- Email: your-email@example.com
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/your-profile)

## 📄 License

This project is created for educational purposes as part of an AWS DevOps course.

---

## ⭐ Bonus Features Implemented

- ✅ Modern React UI with animations
- ✅ Real-time statistics dashboard
- ✅ Project management with progress tracking
- ✅ Activity logging system
- ✅ Comprehensive API with filtering
- ✅ PM2 process management
- ✅ Nginx reverse proxy
- ✅ CloudWatch custom metrics
- ✅ Multiple CloudWatch alarms
- ✅ Comprehensive error handling
- ✅ Responsive design for mobile devices

**Ready to impress your evaluators! 🚀**