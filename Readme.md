# 🎯 TaskFlow - Application de Gestion de Tâches DevOps

![AWS](https://img.shields.io/badge/AWS-Cloud-orange?logo=amazonaws)
![GitHub Actions](https://img.shields.io/badge/CI/CD-GitHub_Actions-2088FF?logo=githubactions)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)

> **Projet DevOps 2025** - Application web de gestion de tâches déployée automatiquement sur AWS avec infrastructure as code et pipeline CI/CD complet.

📦 **Repository:** [github.com/hamzaelalamy/taskflow-devops-project](https://github.com/hamzaelalamy/taskflow-devops-project)

---

## 📖 Description du Projet

**TaskFlow** est une application full-stack moderne permettant de créer, organiser et suivre des tâches en les regroupant par projets. Le projet démontre l'implémentation complète d'une infrastructure AWS avec les meilleures pratiques DevOps.

### Fonctionnalités

- ✅ **Gestion de Tâches** - Créer, modifier, compléter et supprimer des tâches
- 📁 **Organisation par Projets** - Regrouper les tâches avec suivi de progression
- 📊 **Dashboard** - Statistiques en temps réel (tâches totales, complétées, en attente)
- 🎨 **Interface Moderne** - React 18 avec design responsive
- 🔄 **API RESTful** - Backend Express.js avec PostgreSQL
- 📈 **Monitoring** - CloudWatch logs, métriques et alertes SNS

### Stack Technique

Frontend: React 18 + Vite
Backend: Node.js 20 + Express.js
Database: PostgreSQL 15
Serveur: Nginx + PM2
Cloud: AWS (EC2, VPC, CloudWatch, SNS)
IaC: CloudFormation
CI/CD: GitHub Actions

---

## 🏗️ Architecture AWS

### Diagramme d'Architecture

                      ┌─────────────┐
                      │  Internet   │
                      └──────┬──────┘
                             │
                    ┌────────▼────────┐
                    │ Internet Gateway│
                    └────────┬────────┘
                             │
    ┌────────────────────────┴────────────────────────┐
    │         VPC (vpc-0d4332ca74f57df1c)             │
    │              10.0.0.0/16                         │
    │                                                  │
    │  ┌────────────────────────────────────────┐    │
    │  │  Public Subnet (10.0.1.0/24)          │    │
    │  │                                        │    │
    │  │  ┌──────────────────────────────┐     │    │
    │  │  │  🖥️ EC2 WebApp (t3.micro)    │◄────┼────┼── HTTP
    │  │  │                               │     │    │   Port 80
    │  │  │  -  Nginx                      │     │    │
    │  │  │  -  React (Static)             │     │    │
    │  │  │  -  Express API                │     │    │
    │  │  │  -  PM2                        │     │    │
    │  │  │  -  CloudWatch Agent           │     │    │
    │  │  │                               │     │    │
    │  │  │  📍 3.222.153.54 (Elastic IP)│     │    │
    │  │  └──────────┬────────────────────┘     │    │
    │  │             │                          │    │
    │  │  ┌──────────▼────────────┐            │    │
    │  │  │  NAT Gateway           │            │    │
    │  │  │  98.95.59.30           │            │    │
    │  │  └────────────────────────┘            │    │
    │  └────────────────────────────────────────┘    │
    │             │                                   │
    │             │ PostgreSQL (5432)                 │
    │             ▼                                   │
    │  ┌────────────────────────────────────────┐    │
    │  │  Private Subnet (10.0.2.0/24)         │    │
    │  │                                        │    │
    │  │  ┌──────────────────────────────┐     │    │
    │  │  │  🗄️ EC2 Database (t3.micro)  │     │    │
    │  │  │                               │     │    │
    │  │  │  -  PostgreSQL 15              │     │    │
    │  │  │  -  No Public IP               │     │    │
    │  │  │  -  VPC Access Only            │     │    │
    │  │  │                               │     │    │
    │  │  │  📍 10.0.2.217 (Private)      │     │    │
    │  │  └───────────────────────────────┘     │    │
    │  └────────────────────────────────────────┘    │
    └─────────────────────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────┐
          │  CloudWatch      │
          │  -  Logs          │
          │  -  Metrics       │
          │  -  Alarms        │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │  SNS Topic       │
          │  📧 Email Alerts │
          └──────────────────┘

### Composants Déployés

| Composant | Configuration | Description |
|-----------|---------------|-------------|
| **VPC** | `vpc-0d4332ca74f57df1c` | Réseau privé (10.0.0.0/16) |
| **WebApp** | EC2 t3.micro | Nginx + React + Express (3.222.153.54) |
| **Database** | EC2 t3.micro | PostgreSQL 15 (10.0.2.217 - privé) |
| **NAT Gateway** | Elastic IP | Internet sortant pour subnet privé (98.95.59.30) |
| **CloudWatch** | Logs + Metrics | Monitoring et logs centralisés |
| **SNS** | Email | Alertes (CPU > 70%, Memory > 80%) |

### Flux de Données

User → Nginx (Port 80) → React (Static Files)
└→ Express API (Port 3000) → PostgreSQL (Port 5432)

text

---

## 🚀 Instructions de Déploiement

### Prérequis

- Compte AWS avec permissions EC2, VPC, CloudFormation, CloudWatch, SNS
- EC2 Key Pair créée (ex: `taskflow-key`)
- Compte GitHub

### Étape 1: Configuration

**1.1 Créer EC2 Key Pair**

aws ec2 create-key-pair
--key-name taskflow-key
--query 'KeyMaterial'
--output text > taskflow-key.pem

chmod 400 taskflow-key.pem

text

**1.2 Fork et Clone**

Fork le repository sur GitHub
Puis clone localement
git clone https://github.com/VOTRE-USERNAME/taskflow-devops-project.git
cd taskflow-devops-project

text

**1.3 Configurer les Secrets GitHub**

Aller dans: `Repository → Settings → Secrets and variables → Actions`

Créer **6 secrets**:

| Secret | Valeur |
|--------|--------|
| `AWS_ACCESS_KEY_ID` | Votre AWS Access Key |
| `AWS_SECRET_ACCESS_KEY` | Votre AWS Secret Key |
| `EC2_KEY_NAME` | `taskflow-key` |
| `EC2_SSH_KEY` | Contenu complet du fichier taskflow-key.pem |
| `SNS_EMAIL` | Votre email pour les alertes |
| `DB_PASSWORD` | Mot de passe PostgreSQL (8+ caractères) |

### Étape 2: Déployer

**Option A: Automatique (Push)**

git commit --allow-empty -m "Deploy to AWS"
git push origin main

text

**Option B: Manuel**

GitHub → Actions → "AWS CI/CD Pipeline" → Run workflow

### Étape 3: Suivre le Déploiement

- **Durée:** 15-20 minutes
- **GitHub Actions:** Suivre la progression dans l'onglet Actions
- **Phases:** CI (build/test) puis CD (deploy infrastructure + app)

### Étape 4: Accéder à l'Application

Après déploiement réussi, récupérer l'URL dans les logs GitHub Actions:

🌐 WebApp URL: http://3.222.153.54

text

**Vérifier:**

curl http://3.222.153.54/api/health

{"status":"healthy","database":"connected"}
text

### Étape 5: Confirmer SNS

- Vérifier votre email
- Cliquer sur "Confirm subscription" dans l'email AWS

---

## 🔄 Pipeline CI/CD

### Vue d'Ensemble
**Déclencheur:** Push sur la branche `main`

                ┌─────────────────────────┐
                │   🚀 PUSH TO MAIN       │
                └───────────┬─────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────┐
│           PHASE CI (3-5 minutes)                      │
├───────────────────────────────────────────────────────┤
│                                                       │
│  1. ✓ Checkout code                                  │
│  2. ✓ Setup Node.js 20                               │
│  3. ✓ Install backend dependencies                   │
│  4. ✓ Install frontend dependencies                  │
│  5. ✓ Build frontend (Vite)                          │
│  6. ✓ Validate CloudFormation template               │
│                                                       │
└───────────────────────┬───────────────────────────────┘
                        │
                  ✅ CI SUCCESS
                        │
                        ▼
┌───────────────────────────────────────────────────────┐
│          PHASE CD (15-20 minutes)                     │
├───────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │  1. Configure AWS Credentials (30s)         │    │
│  │     - AWS_ACCESS_KEY_ID                     │    │
│  │     - AWS_SECRET_ACCESS_KEY                 │    │
│  │     - Region: us-east-1                     │    │
│  └─────────────────┬───────────────────────────┘    │
│                    │                                 │
│                    ▼                                 │
│  ┌─────────────────────────────────────────────┐    │
│  │  2. Deploy CloudFormation Stack (10-12 min) │    │
│  │                                              │    │
│  │     📦 Infrastructure Created:               │    │
│  │     ├─ VPC (10.0.0.0/16)                    │    │
│  │     ├─ Public Subnet (10.0.1.0/24)          │    │
│  │     ├─ Private Subnet (10.0.2.0/24)         │    │
│  │     ├─ Internet Gateway                     │    │
│  │     ├─ NAT Gateway                          │    │
│  │     ├─ Security Groups                      │    │
│  │     ├─ EC2 WebApp (t3.micro)                │    │
│  │     ├─ EC2 Database (t3.micro)              │    │
│  │     ├─ Elastic IP                           │    │
│  │     ├─ CloudWatch Logs & Alarms             │    │
│  │     └─ SNS Topic                            │    │
│  └─────────────────┬───────────────────────────┘    │
│                    │                                 │
│                    ▼                                 │
│  ┌─────────────────────────────────────────────┐    │
│  │  3. Wait for Stack Complete (1-2 min)       │    │
│  │     ⏳ Polling until CREATE_COMPLETE         │    │
│  └─────────────────┬───────────────────────────┘    │
│                    │                                 │
│                    ▼                                 │
│  ┌─────────────────────────────────────────────┐    │
│  │  4. Get Stack Outputs (10s)                 │    │
│  │     📍 WebApp IP: 3.222.153.54              │    │
│  │     📍 Database IP: 10.0.2.217              │    │
│  │     📍 NAT Gateway IP: 98.95.59.30          │    │
│  │     🆔 VPC ID: vpc-0d4332ca74f57df1c         │    │
│  └─────────────────┬───────────────────────────┘    │
│                    │                                 │
│                    ▼                                 │
│  ┌─────────────────────────────────────────────┐    │
│  │  5. Deploy Application Code (2-3 min)       │    │
│  │                                              │    │
│  │     🔐 SSH to WebApp (3.222.153.54)         │    │
│  │     │                                        │    │
│  │     ├─ Clone repository → /opt/webapp       │    │
│  │     ├─ Create .env file                     │    │
│  │     │  └─ DB_HOST=10.0.2.217                │    │
│  │     │  └─ DB_PASSWORD=***                   │    │
│  │     ├─ npm install (backend)                │    │
│  │     ├─ npm install & build (frontend)       │    │
│  │     ├─ PM2 start backend                    │    │
│  │     │  └─ pm2 start index.js                │    │
│  │     └─ Restart Nginx                        │    │
│  └─────────────────┬───────────────────────────┘    │
│                    │                                 │
│                    ▼                                 │
│  ┌─────────────────────────────────────────────┐    │
│  │  6. Initialize Database (30s)               │    │
│  │                                              │    │
│  │     📤 Upload db/init.sql                    │    │
│  │     🗄️  Execute SQL script                   │    │
│  │     │                                        │    │
│  │     ├─ CREATE TABLE projects                │    │
│  │     ├─ CREATE TABLE tasks                   │    │
│  │     ├─ CREATE TABLE activity_log            │    │
│  │     └─ INSERT sample data                   │    │
│  └─────────────────┬───────────────────────────┘    │
│                    │                                 │
│                    ▼                                 │
│  ┌─────────────────────────────────────────────┐    │
│  │  7. Health Check (10s)                      │    │
│  │                                              │    │
│  │     curl http://3.222.153.54/api/health     │    │
│  │     Response: {"status":"healthy"}          │    │
│  └─────────────────┬───────────────────────────┘    │
│                    │                                 │
└────────────────────┼─────────────────────────────────┘
                     │
               ✅ CD SUCCESS
                     │
                     ▼
┌───────────────────────────────────────────────────────┐
│         🎉 APPLICATION DEPLOYED                       │
│                                                       │
│         🌐 http://3.222.153.54                        │
│                                                       │
│         📊 CloudWatch Monitoring Active               │
│         📧 SNS Alerts Configured                      │
│         ✅ All Services Running                        │
└───────────────────────────────────────────────────────┘
                     │
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌──────────────┐
│  CloudWatch   │         │  SNS Topic   │
│  📊 Logs      │         │  📧 Alerts   │
│  📈 Metrics   │         │              │
│  🚨 Alarms    │─────────▶│  Email:      │
└───────────────┘         │  user@email  │
                          └──────────────┘


### Workflow: `.github/workflows/deploy.yml`

**Déclencheurs:**
- `push` sur branch `main` → CI + CD complet
- `pull_request` vers `main` → CI uniquement
- `workflow_dispatch` → Déclenchement manuel

**Job 1: CI (build-and-test)**

Checkout repository

Setup Node.js 20

Install backend dependencies (npm ci)

Install frontend dependencies (npm ci)

Build frontend (npm run build → client/dist/)

Validate CloudFormation template

text

**Job 2: CD (deploy)** - Si CI réussi et branch = main

Configure AWS credentials (secrets)

Deploy CloudFormation stack:
Stack name: taskflow-cicd-project
Template: infrastructure.yml
Parameters: KeyName, EmailAddress, DBPassword
Capabilities: CAPABILITY_IAM

Wait for stack: CREATE_COMPLETE

Get outputs: WebAppIP, DBPrivateIP

Wait for EC2 instances: running

Deploy application:

SSH to WebApp instance

Clone repo in /opt/webapp

Create .env with DB credentials

Run deploy.sh script

Start backend with PM2

Initialize database:

Upload db/init.sql

Execute via psql

Health check: curl /api/health

Display deployment summary

text

### Suivi du Déploiement

**GitHub Actions:**
Repository → Actions → Workflow run en cours
├─ build-and-test ✓
└─ deploy ⏳
└─ Voir logs en temps réel

text

**En cas d'échec:**
- Consulter les logs détaillés dans GitHub Actions
- Vérifier les secrets configurés
- Vérifier les quotas AWS (Elastic IPs, VPCs)
- Re-run le workflow si nécessaire

---

## 📝 Utilisation

### Accéder à l'Application

🌐 **URL:** `http://3.222.153.54`

### Interface

**Dashboard** - Statistiques temps réel
- Total des tâches
- Tâches complétées
- Tâches en attente
- Nombre de projets

**Tasks** - Gestion des tâches
- Créer une tâche (titre, description, projet optionnel)
- Marquer comme complétée (checkbox)
- Filtrer: All / Pending / Completed
- Supprimer

**Projects** - Gestion des projets
- Créer un projet
- Voir progression (barre de progression automatique)
- Assigner des tâches

### API REST

**Base URL:** `http://3.222.153.54/api`

Health check
GET /api/health

Statistics
GET /api/stats

Tasks
GET /api/tasks
POST /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id

Projects
GET /api/projects
POST /api/projects
DELETE /api/projects/:id

Activity log
GET /api/activity

text

**Exemple:**

Créer une tâche
curl -X POST http://3.222.153.54/api/tasks
-H "Content-Type: application/json"
-d '{
"title": "Nouvelle tâche",
"description": "Description"
}'

Lister les tâches
curl http://3.222.153.54/api/tasks

text

### SSH

WebApp
ssh -i taskflow-key.pem ec2-user@3.222.153.54

Database (via WebApp)
ssh -i taskflow-key.pem
-J ec2-user@3.222.153.54
ec2-user@10.0.2.217

text

---

## 📊 Monitoring

### CloudWatch

**Logs:** `/aws/ec2/webapp`
- `nginx-access` - Requêtes HTTP
- `nginx-error` - Erreurs serveur
- `user-data` - Logs de démarrage

**Métriques:**
- CPU Utilization (AWS/EC2)
- Memory Used (WebApp/Performance)
- Network In/Out

**Alarmes:**
- High CPU (> 70%) → Email SNS
- High Memory (> 80%) → Email SNS

### Tester les Alertes

SSH to WebApp
ssh -i taskflow-key.pem ec2-user@3.222.153.54

Generate CPU load
yes > /dev/null &
yes > /dev/null &
yes > /dev/null &

Wait 5-10 minutes → Email alert received
Stop
killall yes

text

---

## 🗑️ Nettoyage

### Supprimer l'Infrastructure

Delete CloudFormation stack
aws cloudformation delete-stack
--stack-name taskflow-cicd-project

Wait for deletion
aws cloudformation wait stack-delete-complete
--stack-name taskflow-cicd-project

text

**Ou via Console AWS:**
CloudFormation → Stacks → taskflow-cicd-project → Delete

text

---

## 💰 Coûts Estimés

| Service | Coût/mois |
|---------|-----------|
| EC2 (2x t3.micro) | $15.18 |
| NAT Gateway | $32.85 |
| CloudWatch | $3.30 |
| Autres | $2.63 |
| **Total** | **~$54/mois** |

**Optimisation:** Utiliser NAT Instance au lieu de NAT Gateway (économie $25/mois)

---

## 📚 Documentation

- [AWS CloudFormation](https://docs.aws.amazon.com/cloudformation/)
- [GitHub Actions](https://docs.github.com/actions)
- [React Documentation](https://react.dev)
- [Express.js](https://expressjs.com)
- [PostgreSQL](https://postgresql.org/docs/)

---

## 👤 Auteur

**Hamza El Alamy**  
Formation DevOps 2025  
GitHub: [@hamzaelalamy](https://github.com/hamzaelalamy)

---

## ⭐ Fonctionnalités du Projet

✅ Application full-stack (React + Express + PostgreSQL)  
✅ Infrastructure AWS complète (VPC, EC2, CloudWatch, SNS)  
✅ Infrastructure as Code (CloudFormation)  
✅ Pipeline CI/CD automatisé (GitHub Actions)  
✅ Monitoring et alerting opérationnels  
✅ Isolation réseau (subnet privé pour database)  
✅ Documentation technique complète  

**🚀 Projet prêt pour démonstration et évaluation!**