-- ============================================================
-- Ransomware Detection System - MySQL Database Schema
-- ============================================================
-- Description: Creates all necessary tables for the ransomware
--              detection system with proper indexing and constraints
-- Database: MySQL 5.7+ / MariaDB 10.2+
-- ============================================================

-- Drop existing database if needed (CAUTION: This deletes all data!)
-- DROP DATABASE IF EXISTS ransomware_db;

-- Create database
CREATE DATABASE IF NOT EXISTS ransomware_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE ransomware_db;

-- ============================================================
-- Table: scans
-- Description: Main table storing all scan results
-- ============================================================

CREATE TABLE IF NOT EXISTS scans (
    -- Primary Key
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique scan record ID',
    
    -- File Information
    file_name VARCHAR(255) NOT NULL COMMENT 'Original filename',
    file_hash VARCHAR(64) NOT NULL UNIQUE COMMENT 'SHA256 hash (64 characters)',
    file_hash_md5 VARCHAR(32) COMMENT 'MD5 hash (32 characters)',
    file_type VARCHAR(10) NOT NULL COMMENT 'File extension (.exe, .dll, etc.)',
    file_size INT NOT NULL COMMENT 'File size in bytes',
    
    -- Detection Results
    prediction VARCHAR(20) NOT NULL COMMENT 'Prediction: Safe or Malicious',
    confidence FLOAT NOT NULL COMMENT 'Confidence score (0.0 - 1.0)',
    risk_level VARCHAR(20) COMMENT 'Risk level: low, medium, high, critical',
    detection_method VARCHAR(50) COMMENT 'Detection method: hash_signature, machine_learning, rule_based',
    
    -- Performance Metrics
    scan_duration FLOAT COMMENT 'Scan duration in seconds',
    
    -- Client Information
    client_ip VARCHAR(45) COMMENT 'Client IP address (IPv4 or IPv6)',
    
    -- Detection Details (JSON)
    detection_details JSON COMMENT 'Full detection analysis results',
    
    -- Alert Status
    alert_sent BOOLEAN DEFAULT FALSE COMMENT 'Whether alert was sent for this scan',
    alert_timestamp DATETIME COMMENT 'When alert was sent',
    
    -- Timestamps
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT 'Scan timestamp',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    
    -- Constraints
    CONSTRAINT chk_prediction CHECK (prediction IN ('Safe', 'Malicious', 'Unknown')),
    CONSTRAINT chk_confidence CHECK (confidence >= 0.0 AND confidence <= 1.0),
    CONSTRAINT chk_risk_level CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT chk_file_type CHECK (file_type IN ('.exe', '.dll', '.js', '.vbs', '.ps1', '.zip', '.py')),
    
    -- Indexes for fast queries
    INDEX idx_timestamp (timestamp DESC) COMMENT 'Index for time-based queries',
    INDEX idx_file_hash (file_hash) COMMENT 'Index for hash lookups',
    INDEX idx_prediction (prediction) COMMENT 'Index for filtering by prediction',
    INDEX idx_file_name (file_name) COMMENT 'Index for filename searches',
    INDEX idx_client_ip (client_ip) COMMENT 'Index for IP tracking',
    INDEX idx_alert_sent (alert_sent) COMMENT 'Index for alert filtering'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Main table for storing scan results';


-- ============================================================
-- Table: known_hashes
-- Description: Database of known ransomware hash signatures
-- ============================================================

CREATE TABLE IF NOT EXISTS known_hashes (
    -- Primary Key
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique hash record ID',
    
    -- Hash Information
    hash_value VARCHAR(64) NOT NULL UNIQUE COMMENT 'Hash value (SHA256)',
    hash_type VARCHAR(10) DEFAULT 'SHA256' COMMENT 'Hash algorithm type',
    
    -- Ransomware Information
    ransomware_family VARCHAR(100) COMMENT 'Ransomware family name (e.g., WannaCry, Locky)',
    description TEXT COMMENT 'Description of the ransomware',
    severity VARCHAR(20) DEFAULT 'high' COMMENT 'Threat severity level',
    
    -- Source Information
    source VARCHAR(255) COMMENT 'Source of the hash (e.g., VirusTotal, threat feed)',
    
    -- Metadata
    added_date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT 'When hash was added',
    
    -- Constraints
    CONSTRAINT chk_hash_type CHECK (hash_type IN ('SHA256', 'MD5', 'SHA1')),
    CONSTRAINT chk_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Indexes
    INDEX idx_hash_value (hash_value) COMMENT 'Fast hash lookup',
    INDEX idx_ransomware_family (ransomware_family) COMMENT 'Filter by ransomware family',
    INDEX idx_added_date (added_date DESC) COMMENT 'Recent additions'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Known ransomware hash database';


-- ============================================================
-- Table: alert_logs
-- Description: Audit trail for all alerts sent
-- ============================================================

CREATE TABLE IF NOT EXISTS alert_logs (
    -- Primary Key
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique alert log ID',
    
    -- Reference to scan
    scan_id INT NOT NULL COMMENT 'Reference to scans table',
    
    -- Alert Information
    alert_type VARCHAR(50) NOT NULL COMMENT 'Type of alert: webhook, email',
    alert_status VARCHAR(20) NOT NULL COMMENT 'Alert status: sent, failed',
    recipient VARCHAR(255) COMMENT 'Alert recipient (email or webhook URL)',
    error_message TEXT COMMENT 'Error message if alert failed',
    
    -- Metadata
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT 'When alert was sent',
    
    -- Constraints
    CONSTRAINT chk_alert_type CHECK (alert_type IN ('webhook', 'email', 'sms', 'slack')),
    CONSTRAINT chk_alert_status CHECK (alert_status IN ('sent', 'failed', 'pending')),
    
    -- Foreign Key
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_scan_id (scan_id) COMMENT 'Find alerts for specific scan',
    INDEX idx_timestamp (timestamp DESC) COMMENT 'Recent alerts',
    INDEX idx_alert_status (alert_status) COMMENT 'Filter by status'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Alert audit trail';


-- ============================================================
-- Table: system_stats
-- Description: System statistics and metrics (optional)
-- ============================================================

CREATE TABLE IF NOT EXISTS system_stats (
    -- Primary Key
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique stats ID',
    
    -- Statistics
    total_scans INT DEFAULT 0 COMMENT 'Total number of scans',
    malicious_count INT DEFAULT 0 COMMENT 'Number of malicious detections',
    safe_count INT DEFAULT 0 COMMENT 'Number of safe detections',
    average_scan_time FLOAT COMMENT 'Average scan duration in seconds',
    detection_rate FLOAT COMMENT 'Detection rate (malicious / total)',
    
    -- Metadata
    date DATE NOT NULL UNIQUE COMMENT 'Statistics date',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update time',
    
    -- Index
    INDEX idx_date (date DESC) COMMENT 'Time-based queries'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Daily system statistics';


-- ============================================================
-- Views for Common Queries
-- ============================================================

-- View: Recent malicious scans (last 24 hours)
CREATE OR REPLACE VIEW recent_malicious_scans AS
SELECT 
    id,
    file_name,
    file_hash,
    file_type,
    confidence,
    risk_level,
    client_ip,
    timestamp
FROM scans
WHERE 
    prediction = 'Malicious'
    AND timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY timestamp DESC;


-- View: Scan statistics by file type
CREATE OR REPLACE VIEW scans_by_file_type AS
SELECT 
    file_type,
    COUNT(*) as total_scans,
    SUM(CASE WHEN prediction = 'Malicious' THEN 1 ELSE 0 END) as malicious_count,
    SUM(CASE WHEN prediction = 'Safe' THEN 1 ELSE 0 END) as safe_count,
    ROUND(AVG(confidence) * 100, 2) as avg_confidence,
    ROUND(AVG(scan_duration), 3) as avg_scan_time
FROM scans
GROUP BY file_type
ORDER BY total_scans DESC;


-- View: Daily scan summary
CREATE OR REPLACE VIEW daily_scan_summary AS
SELECT 
    DATE(timestamp) as scan_date,
    COUNT(*) as total_scans,
    SUM(CASE WHEN prediction = 'Malicious' THEN 1 ELSE 0 END) as malicious_count,
    SUM(CASE WHEN prediction = 'Safe' THEN 1 ELSE 0 END) as safe_count,
    ROUND(AVG(scan_duration), 3) as avg_scan_time
FROM scans
GROUP BY DATE(timestamp)
ORDER BY scan_date DESC;


-- ============================================================
-- Stored Procedures (Optional but useful)
-- ============================================================

-- Procedure: Get scan statistics
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS get_scan_statistics()
BEGIN
    SELECT 
        COUNT(*) as total_scans,
        SUM(CASE WHEN prediction = 'Malicious' THEN 1 ELSE 0 END) as malicious_count,
        SUM(CASE WHEN prediction = 'Safe' THEN 1 ELSE 0 END) as safe_count,
        ROUND(AVG(confidence) * 100, 2) as avg_confidence,
        ROUND(AVG(scan_duration), 3) as avg_scan_time,
        MIN(timestamp) as first_scan,
        MAX(timestamp) as last_scan
    FROM scans;
END //

DELIMITER ;


-- Procedure: Clean old scan records (older than specified days)
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS clean_old_scans(IN days_to_keep INT)
BEGIN
    DELETE FROM scans 
    WHERE timestamp < DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
    
    SELECT ROW_COUNT() as deleted_records;
END //

DELIMITER ;


-- ============================================================
-- Triggers for automatic actions
-- ============================================================

-- Trigger: Update system stats after each scan insert
DELIMITER //

CREATE TRIGGER IF NOT EXISTS after_scan_insert
AFTER INSERT ON scans
FOR EACH ROW
BEGIN
    -- Update or insert daily stats
    INSERT INTO system_stats (
        date, 
        total_scans, 
        malicious_count, 
        safe_count
    )
    VALUES (
        CURDATE(),
        1,
        IF(NEW.prediction = 'Malicious', 1, 0),
        IF(NEW.prediction = 'Safe', 1, 0)
    )
    ON DUPLICATE KEY UPDATE
        total_scans = total_scans + 1,
        malicious_count = malicious_count + IF(NEW.prediction = 'Malicious', 1, 0),
        safe_count = safe_count + IF(NEW.prediction = 'Safe', 1, 0),
        updated_at = NOW();
END //

DELIMITER ;


-- ============================================================
-- Grant Permissions (adjust username as needed)
-- ============================================================

-- Create application user (change password!)
-- CREATE USER IF NOT EXISTS 'ransomware_user'@'localhost' 
-- IDENTIFIED BY 'change_this_password';

-- Grant permissions
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ransomware_db.* 
-- TO 'ransomware_user'@'localhost';

-- FLUSH PRIVILEGES;


-- ============================================================
-- Verification Queries
-- ============================================================

-- Show all tables
SHOW TABLES;

-- Describe main tables
DESCRIBE scans;
DESCRIBE known_hashes;
DESCRIBE alert_logs;

-- Show indexes
SHOW INDEX FROM scans;

-- Show views
SHOW FULL TABLES WHERE TABLE_TYPE LIKE 'VIEW';


-- ============================================================
-- Success Message
-- ============================================================

SELECT 
    '✅ Database schema created successfully!' as status,
    DATABASE() as database_name,
    NOW() as created_at;

-- End of schema.sql