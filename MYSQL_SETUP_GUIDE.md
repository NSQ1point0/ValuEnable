# 🗄️ MySQL Database Setup Guide

## 🚀 Quick Start (Recommended: Docker)

### Prerequisites
- Install Docker Desktop for Windows from https://docker.com

### 1. Start MySQL with Docker
```bash
# Navigate to project root
cd D:\PA projects\ValuEnable

# Start MySQL container
docker-compose -f docker-compose.dev.yml up mysql
```

This will:
- ✅ Download MySQL 8.0 image
- ✅ Create database `benefit_illustration`
- ✅ Set root password: `password123`
- ✅ Run on port 3306
- ✅ Include phpMyAdmin on port 8080

### 2. Verify MySQL is Running
```bash
# Check if container is running
docker ps

# You should see: benefit_illustration_mysql
```

### 3. Access Database
- **phpMyAdmin**: http://localhost:8080
- **Username**: root
- **Password**: password123

---

## 🔧 Alternative: XAMPP Setup

### 1. Download XAMPP
1. Go to https://www.apachefriends.org/download.html
2. Download XAMPP for Windows
3. Install to default location (`C:\xampp`)

### 2. Start MySQL
1. Open XAMPP Control Panel
2. Click "Start" next to MySQL
3. MySQL will run on port 3306

### 3. Create Database
1. Click "Admin" next to MySQL (opens phpMyAdmin)
2. Create new database: `benefit_illustration`

---

## 🏢 Alternative: Official MySQL Installer

### 1. Download MySQL
1. Go to https://dev.mysql.com/downloads/installer/
2. Download MySQL Installer for Windows
3. Choose "Developer Default" setup

### 2. Installation
1. Install MySQL Server 8.0
2. Set root password: `password123`
3. Install MySQL Workbench (GUI tool)

### 3. Create Database
```sql
-- Using MySQL Workbench or command line
CREATE DATABASE benefit_illustration;
```

---

## ⚙️ Application Configuration

### Update .env File
```env
# Database Configuration (already set correctly)
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password123
DB_NAME=benefit_illustration
```

### Initialize Database Schema
```bash
cd backend

# Method 1: Run database sync
npm run db:sync

# Method 2: Run full setup (sync + seed test users)
npm run setup:complete
```

---

## 🧪 Test Database Connection

### 1. Test Connection Script
```bash
cd backend
node -e "
const { testConnection } = require('./config/database');
testConnection().then(() => {
  console.log('✅ Database connection successful!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Database connection failed:', err.message);
  process.exit(1);
});
"
```

### 2. Expected Output
```
✅ Database connection has been established successfully.
✅ Database connection successful!
```

---

## 🚀 Complete Startup Sequence

### 1. Start MySQL (Choose one method above)

**Using Docker:**
```bash
docker-compose -f docker-compose.dev.yml up mysql -d
```

**Using XAMPP:**
- Open XAMPP Control Panel
- Start MySQL service

### 2. Initialize Database
```bash
cd backend
npm run setup:complete
```

### 3. Start Backend
```bash
npm run dev
```

### 4. Start Frontend
```bash
cd ../frontend
npm start
```

### 5. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5002
- **Database Admin**: http://localhost:8080 (if using Docker)

---

## 🔐 Login Credentials

Once everything is running, use these test accounts:

### Test Users (Pre-seeded)
1. **Email**: `john.doe@example.com` | **Password**: `TestUser123!`
2. **Email**: `jane.smith@example.com` | **Password**: `TestUser456!`
3. **Email**: `admin@valueenable.com` | **Password**: `Admin789!`

### Sample Policy Data (Matches Spreadsheet)
```
DOB: 1999-12-12
Sum Assured: 1200000
Modal Premium: 80000
Premium Frequency: Yearly
Policy Term: 18
Premium Paying Term: 10
```

---

## 🛠️ Troubleshooting

### Issue 1: MySQL Connection Refused
```bash
# Check if MySQL is running
docker ps  # For Docker
# or check XAMPP Control Panel

# Test connection
telnet localhost 3306
```

### Issue 2: Database Doesn't Exist
```sql
-- Connect to MySQL and create database
mysql -u root -p
CREATE DATABASE benefit_illustration;
```

### Issue 3: Authentication Issues
```sql
-- If you get authentication errors
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password123';
FLUSH PRIVILEGES;
```

### Issue 4: Port Conflicts
```bash
# Check what's using port 3306
netstat -ano | findstr :3306

# If port is busy, change in .env:
DB_PORT=3307
```

---

## 🎯 Quick Docker Command Reference

```bash
# Start MySQL only
docker-compose -f docker-compose.dev.yml up mysql -d

# Start with phpMyAdmin
docker-compose -f docker-compose.dev.yml up mysql phpmyadmin -d

# Stop services
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs mysql

# Connect to MySQL directly
docker exec -it benefit_illustration_mysql mysql -u root -p
```

---

## ✅ Verification Checklist

- [ ] MySQL is running on port 3306
- [ ] Database `benefit_illustration` exists
- [ ] Backend connects successfully (`npm run db:sync`)
- [ ] Test users are created (`npm run seed:db`)
- [ ] Backend starts without errors (`npm run dev`)
- [ ] Frontend connects to backend (`npm start`)
- [ ] Can login with test credentials
- [ ] Can calculate policy with sample data

---

## 🎉 Success Indicators

When everything is working correctly, you should see:

### Backend Console:
```
[dotenv] injecting env from .env
Database connection has been established successfully.
Database synced successfully
Server is running on port 5002
```

### Frontend:
- Login page loads at http://localhost:3000
- Can login with test credentials
- Dashboard shows after login
- Policy calculator works with validation

### Database:
- Tables created: `users`, `policies`, `illustrations`
- Test users created with encrypted sensitive data
- phpMyAdmin accessible at http://localhost:8080

**That's it! Your MySQL database is now connected and ready to use with the Benefit Illustration Module.**
