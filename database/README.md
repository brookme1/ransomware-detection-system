# Ransomware Detection System - Database Setup Guide

## 📋 Table of Contents

- [Overview](#overview)
- [Database Options](#database-options)
- [MySQL Setup](#mysql-setup)
- [MongoDB Setup](#mongodb-setup)
- [Configuration](#configuration)
- [Schema Details](#schema-details)
- [Sample Queries](#sample-queries)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)
- [Backup & Restore](#backup--restore)

---

## 🎯 Overview

The Ransomware Detection System supports both **MySQL** and **MongoDB** databases. Choose the database that best fits your infrastructure and requirements.

### Files Included

```
database/
├── schema.sql           # MySQL table creation script
├── indexes.sql          # MySQL performance indexes
├── seed_data.sql        # Sample data for testing
├── mongodb_schema.js    # MongoDB collection setup
└── README.md            # This file
```

---

## 🗄️ Database Options

### Option 1: MySQL (Recommended for SQL users)

**Pros:**
- ✅ Strong ACID compliance
- ✅ Excellent for structured data
- ✅ Advanced SQL query capabilities
- ✅ Mature ecosystem with GUI tools
- ✅ Built-in stored procedures and triggers

**Cons:**
- ❌ Vertical scaling primarily
- ❌ Less flexible schema changes
- ❌ Complex JSON queries

**Use MySQL if:**
- You prefer SQL and relational databases
- You need strong transactional guarantees
- Your team has MySQL expertise
- You use existing MySQL infrastructure

### Option 2: MongoDB (Recommended for NoSQL users)

**Pros:**
- ✅ Flexible schema (JSON documents)
- ✅ Horizontal scaling (sharding)
- ✅ Native JSON support
- ✅ Easy to scale
- ✅ Fast for read-heavy workloads

**Cons:**
- ❌ Weaker consistency guarantees (by default)
- ❌ More complex aggregation queries
- ❌ Larger storage footprint

**Use MongoDB if:**
- You prefer NoSQL and document databases
- You need horizontal scaling
- Your data structure may evolve
- You're building cloud-native applications

---

## 🐬 MySQL Setup

### Prerequisites

- MySQL 5.7+ or MariaDB 10.2+
- Root or admin access
- At least 100MB free disk space

### Step 1: Install MySQL

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### macOS
```bash
brew install mysql
brew services start mysql
```

#### Windows
Download and install from: https://dev.mysql.com/downloads/installer/

### Step 2: Secure MySQL Installation

```bash
sudo mysql_secure_installation
```

Follow prompts to:
- Set root password
- Remove anonymous users
- Disable remote root login
- Remove test database

### Step 3: Create Database and User

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE ransomware_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create application user (change password!)
CREATE USER 'ransomware_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';

# Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ransomware_db.* TO 'ransomware_user'@'localhost';
FLUSH PRIVILEGES;

# Exit
EXIT;
```

### Step 4: Run Schema Scripts

```bash
# Navigate to database folder
cd ransomware-detection-system/database/

# Create tables and schema
mysql -u root -p ransomware_db < schema.sql

# Create performance indexes
mysql -u root -p ransomware_db < indexes.sql

# (Optional) Insert sample data for testing
mysql -u root -p ransomware_db < seed_data.sql
```

### Step 5: Verify Installation

```bash
mysql -u root -p ransomware_db

# Show tables
SHOW TABLES;

# Check scans table structure
DESCRIBE scans;

# Count records (if seed data inserted)
SELECT COUNT(*) FROM scans;

# Exit
EXIT;
```

Expected output:
```
+---------------+
| Tables        |
+---------------+
| alert_logs    |
| known_hashes  |
| scans         |
| system_stats  |
+---------------+
```

---

## 🍃 MongoDB Setup

### Prerequisites

- MongoDB 4.4+ or MongoDB Atlas account
- mongosh (MongoDB Shell)
- At least 100MB free disk space

### Step 1: Install MongoDB

#### Ubuntu/Debian
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Windows
Download from: https://www.mongodb.com/try/download/community

### Step 2: Install MongoDB Shell (mongosh)

```bash
# Ubuntu/Debian
sudo apt install -y mongodb-mongosh

# macOS
brew install mongosh

# Or download from: https://www.mongodb.com/try/download/shell
```

### Step 3: Run MongoDB Schema Script

```bash
# Navigate to database folder
cd ransomware-detection-system/database/

# Run schema setup script
mongosh ransomware_db < mongodb_schema.js
```

Or run interactively:
```bash
mongosh

# Switch to database
use ransomware_db

# Load and execute script
load('mongodb_schema.js')
```

### Step 4: Verify Installation

```javascript
// Connect to database
mongosh ransomware_db

// Show collections
show collections

// Count documents
db.scans.countDocuments()

// View sample data
db.scans.find().limit(3).pretty()

// Check indexes
db.scans.getIndexes()

// Exit
exit
```

Expected output:
```
Collections:
- alert_logs
- known_hashes
- scans
- system_stats
```

---

## ⚙️ Configuration

### Backend Configuration

Edit `backend/.env` file:

#### For MySQL:
```env
DB_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=ransomware_user
MYSQL_PASSWORD=your_secure_password_here
MYSQL_DATABASE=ransomware_db
```

#### For MongoDB:
```env
DB_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DATABASE=ransomware_db
MONGODB_COLLECTION=scans
```

#### For MongoDB Atlas (Cloud):
```env
DB_TYPE=mongodb
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DATABASE=ransomware_db
```

### Test Database Connection

```bash
# From backend directory
cd ../backend/

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Test connection
python -c "from database import Database; db = Database(); db.connect(); print('✅ Connection successful!')"
```

---

## 📊 Schema Details

### Tables/Collections

#### 1. **scans** (Main table)
Stores all scan results and analysis data.

**Key Fields:**
- `id` - Unique identifier
- `file_name` - Original filename
- `file_hash` - SHA256 hash (unique)
- `file_type` - File extension
- `prediction` - Safe/Malicious
- `confidence` - Confidence score (0.0-1.0)
- `timestamp` - Scan timestamp

**Indexes:**
- `file_hash` (unique) - Fast duplicate detection
- `timestamp` (desc) - Recent scans first
- `prediction` - Filter by status
- Compound indexes for complex queries

#### 2. **known_hashes**
Database of known ransomware signatures.

**Key Fields:**
- `hash_value` - SHA256 hash (unique)
- `ransomware_family` - e.g., WannaCry, Locky
- `severity` - Threat level
- `source` - Hash source

#### 3. **alert_logs**
Audit trail for all alerts sent.

**Key Fields:**
- `scan_id` - Reference to scan
- `alert_type` - webhook/email
- `alert_status` - sent/failed
- `timestamp` - When sent

#### 4. **system_stats**
Daily aggregated statistics.

**Key Fields:**
- `date` - Statistics date
- `total_scans` - Daily scan count
- `malicious_count` - Threats detected
- `detection_rate` - Percentage

---

## 🔍 Sample Queries

### MySQL Queries

```sql
-- Get recent malicious scans
SELECT file_name, confidence, risk_level, timestamp 
FROM scans 
WHERE prediction = 'Malicious' 
ORDER BY timestamp DESC 
LIMIT 10;

-- Count scans by prediction
SELECT prediction, COUNT(*) as count 
FROM scans 
GROUP BY prediction;

-- Get statistics by file type
SELECT * FROM scans_by_file_type;

-- Find scans by specific IP
SELECT file_name, prediction, timestamp 
FROM scans 
WHERE client_ip = '192.168.1.100'
ORDER BY timestamp DESC;

-- Get recent malicious scans (last 24 hours)
SELECT * FROM recent_malicious_scans;

-- Check if hash is known ransomware
SELECT * FROM known_hashes 
WHERE hash_value = 'your_hash_here';

-- Get daily summary
SELECT * FROM daily_scan_summary 
ORDER BY scan_date DESC 
LIMIT 7;

-- Overall statistics
CALL get_scan_statistics();

-- Clean old scans (older than 90 days)
CALL clean_old_scans(90);
```

### MongoDB Queries

```javascript
// Get recent malicious scans
db.scans.find({ prediction: "Malicious" })
  .sort({ timestamp: -1 })
  .limit(10)

// Count scans by prediction
db.scans.aggregate([
  { $group: { 
      _id: "$prediction", 
      count: { $sum: 1 },
      avg_confidence: { $avg: "$confidence" }
    }
  }
])

// Search by filename (full-text search)
db.scans.find({ $text: { $search: "invoice" } })

// Find high-confidence malicious files
db.scans.find({
  prediction: "Malicious",
  confidence: { $gte: 0.9 }
}).sort({ confidence: -1 })

// Get scans from last 24 hours
db.scans.find({
  timestamp: { 
    $gte: new Date(Date.now() - 86400000).toISOString() 
  }
}).sort({ timestamp: -1 })

// Check if hash exists
db.known_hashes.findOne({
  hash_value: "your_hash_here"
})

// Statistics by file type
db.scans.aggregate([
  {
    $group: {
      _id: "$file_type",
      count: { $sum: 1 },
      malicious: {
        $sum: { $cond: [{ $eq: ["$prediction", "Malicious"] }, 1, 0] }
      },
      avg_confidence: { $avg: "$confidence" }
    }
  }
])

// Get alert history for scan
db.alert_logs.find({ scan_id: "scan_object_id" })
  .sort({ timestamp: -1 })
```

---

## 🔧 Maintenance

### MySQL Maintenance

#### Weekly Tasks
```sql
-- Analyze tables for query optimization
ANALYZE TABLE scans;
ANALYZE TABLE known_hashes;
ANALYZE TABLE alert_logs;

-- Check table integrity
CHECK TABLE scans;
```

#### Monthly Tasks
```sql
-- Optimize tables (defragment)
OPTIMIZE TABLE scans;
OPTIMIZE TABLE known_hashes;
OPTIMIZE TABLE alert_logs;

-- Or use stored procedure
CALL optimize_tables();
```

#### Monitor Performance
```sql
-- Check slow queries
SELECT * FROM slow_queries;

-- Check index usage
SELECT * FROM index_usage_stats;

-- Show table sizes
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)"
FROM information_schema.TABLES
WHERE table_schema = 'ransomware_db'
ORDER BY (data_length + index_length) DESC;
```

### MongoDB Maintenance

#### Weekly Tasks
```javascript
// Get database statistics
db.stats()

// Get collection statistics
db.scans.stats()

// Check index usage
db.scans.aggregate([
  { $indexStats: {} }
])
```

#### Monthly Tasks
```javascript
// Compact collections (reduce disk space)
db.runCommand({ compact: "scans" })
db.runCommand({ compact: "known_hashes" })

// Rebuild indexes
db.scans.reIndex()
```

#### Monitor Performance
```javascript
// Check current operations
db.currentOp()

// Enable profiling (log slow queries)
db.setProfilingLevel(1, { slowms: 100 })

// View profiling data
db.system.profile.find().limit(10).sort({ ts: -1 })
```

---

## 🛠️ Troubleshooting

### Common MySQL Issues

#### Issue: "Access denied for user"
```bash
# Solution: Reset password
sudo mysql
ALTER USER 'ransomware_user'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

#### Issue: "Can't connect to MySQL server"
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL if stopped
sudo systemctl start mysql

# Check port
sudo netstat -tlnp | grep 3306
```

#### Issue: "Table doesn't exist"
```bash
# Re-run schema
mysql -u root -p ransomware_db < database/schema.sql
```

### Common MongoDB Issues

#### Issue: "Connection refused"
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB if stopped
sudo systemctl start mongod

# Check port
sudo netstat -tlnp | grep 27017
```

#### Issue: "Collection validation failed"
```javascript
// Disable validation temporarily
db.runCommand({
  collMod: "scans",
  validator: {},
  validationLevel: "off"
})
```

#### Issue: "Database not found"
```javascript
// Create database explicitly
use ransomware_db

// Re-run schema
load('database/mongodb_schema.js')
```

---

## 💾 Backup & Restore

### MySQL Backup

#### Full Database Backup
```bash
# Backup all data
mysqldump -u root -p ransomware_db > backup_$(date +%Y%m%d).sql

# Backup schema only (no data)
mysqldump -u root -p --no-data ransomware_db > schema_backup.sql

# Backup specific table
mysqldump -u root -p ransomware_db scans > scans_backup.sql
```

#### Restore from Backup
```bash
# Restore full backup
mysql -u root -p ransomware_db < backup_20250101.sql

# Restore to new database
mysql -u root -p -e "CREATE DATABASE ransomware_db_restore"
mysql -u root -p ransomware_db_restore < backup_20250101.sql
```

#### Automated Daily Backup (Linux)
```bash
# Create backup script
cat > /usr/local/bin/backup_ransomware_db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/ransomware_db"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
mysqldump -u root -p'your_password' ransomware_db | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup_ransomware_db.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup_ransomware_db.sh") | crontab -
```

### MongoDB Backup

#### Full Database Backup
```bash
# Backup all collections
mongodump --db ransomware_db --out /backups/mongodb/$(date +%Y%m%d)

# Backup specific collection
mongodump --db ransomware_db --collection scans --out /backups/mongodb/
```

#### Restore from Backup
```bash
# Restore full database
mongorestore --db ransomware_db /backups/mongodb/20250101/ransomware_db/

# Restore specific collection
mongorestore --db ransomware_db --collection scans /backups/mongodb/ransomware_db/scans.bson
```

#### Automated Daily Backup (Linux)
```bash
# Create backup script
cat > /usr/local/bin/backup_mongodb.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db ransomware_db --out $BACKUP_DIR/$DATE
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz -C $BACKUP_DIR $DATE
rm -rf $BACKUP_DIR/$DATE
# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup_mongodb.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup_mongodb.sh") | crontab -
```

---

## 📈 Performance Tips

### MySQL Performance

1. **Adjust Buffer Pool Size** (50-70% of available RAM)
```ini
# /etc/mysql/my.cnf
[mysqld]
innodb_buffer_pool_size = 2G
innodb_log_file_size = 256M
max_connections = 200
```

2. **Enable Query Cache** (MySQL 5.7 only)
```sql
SET GLOBAL query_cache_size = 268435456; -- 256MB
SET GLOBAL query_cache_type = 1;
```

3. **Monitor Slow Queries**
```ini
# /etc/mysql/my.cnf
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow-queries.log
long_query_time = 2
```

### MongoDB Performance

1. **Adjust WiredTiger Cache**
```yaml
# /etc/mongod.conf
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 2
```

2. **Use Projection** (select specific fields)
```javascript
// Bad: Returns all fields
db.scans.find({ prediction: "Malicious" })

// Good: Returns only needed fields
db.scans.find(
  { prediction: "Malicious" },
  { file_name: 1, confidence: 1, timestamp: 1 }
)
```

3. **Use Covered Queries** (query uses index only)
```javascript
// Ensure query uses existing index
db.scans.find(
  { prediction: "Malicious" },
  { _id: 0, prediction: 1, timestamp: 1 }
).hint({ prediction: 1, timestamp: -1 })
```

---

## 📚 Additional Resources

### MySQL
- Official Documentation: https://dev.mysql.com/doc/
- MySQL Workbench (GUI): https://www.mysql.com/products/workbench/
- Performance Tuning: https://dev.mysql.com/doc/refman/8.0/en/optimization.html

### MongoDB
- Official Documentation: https://docs.mongodb.com/
- MongoDB Compass (GUI): https://www.mongodb.com/products/compass
- MongoDB University (Free): https://university.mongodb.com/

---

## 🆘 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review database logs:
   - MySQL: `/var/log/mysql/error.log`
   - MongoDB: `/var/log/mongodb/mongod.log`
3. Verify configuration in `backend/.env`
4. Test connection: `python backend/database.py`

---

## ✅ Next Steps

After database setup:

1. ✅ Database configured and running
2. ➡️ **Start backend server**: `cd backend && python main.py`
3. ➡️ **Test API**: Visit `http://localhost:8000/docs`
4. ➡️ **Set up frontend**: Create React dashboard

---

**🎉 Database setup complete! Your ransomware detection system is ready to store and analyze scan results.**