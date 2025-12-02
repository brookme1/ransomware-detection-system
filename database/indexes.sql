-- ============================================================
-- Ransomware Detection System - Database Indexes
-- ============================================================
-- Description: Additional indexes for query optimization and
--              performance tuning
-- Purpose: Improve query performance for common operations
-- ============================================================

USE ransomware_db;

-- ============================================================
-- ANALYZE EXISTING INDEXES
-- ============================================================

-- Show current indexes on scans table
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    CARDINALITY,
    INDEX_TYPE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'ransomware_db'
  AND TABLE_NAME = 'scans'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;


-- ============================================================
-- COMPOSITE INDEXES for Complex Queries
-- ============================================================

-- Composite index: prediction + timestamp (for filtered time-based queries)
-- Use case: "Get all malicious scans from last week"
CREATE INDEX IF NOT EXISTS idx_prediction_timestamp 
ON scans(prediction, timestamp DESC)
COMMENT 'Optimizes queries filtering by prediction and time';

-- Composite index: risk_level + confidence (for threat analysis)
-- Use case: "Find high-risk scans with high confidence"
CREATE INDEX IF NOT EXISTS idx_risk_confidence 
ON scans(risk_level, confidence DESC)
COMMENT 'Optimizes queries for risk-based analysis';

-- Composite index: file_type + prediction (for file type analysis)
-- Use case: "Count malicious .exe files"
CREATE INDEX IF NOT EXISTS idx_filetype_prediction 
ON scans(file_type, prediction)
COMMENT 'Optimizes queries analyzing specific file types';

-- Composite index: client_ip + timestamp (for IP activity tracking)
-- Use case: "Show scan history for specific IP"
CREATE INDEX IF NOT EXISTS idx_client_timestamp 
ON scans(client_ip, timestamp DESC)
COMMENT 'Optimizes queries tracking client activity';

-- Composite index: alert_sent + prediction (for alert management)
-- Use case: "Find malicious scans that need alerts"
CREATE INDEX IF NOT EXISTS idx_alert_prediction 
ON scans(alert_sent, prediction, timestamp DESC)
COMMENT 'Optimizes queries for alert processing';


-- ============================================================
-- COVERING INDEXES (Include additional columns)
-- ============================================================

-- Covering index for dashboard queries
-- Includes most commonly selected columns to avoid table lookups
CREATE INDEX IF NOT EXISTS idx_dashboard_covering 
ON scans(timestamp DESC, prediction, file_name, confidence, risk_level)
COMMENT 'Covering index for dashboard queries';


-- ============================================================
-- FULLTEXT INDEXES for Search Functionality
-- ============================================================

-- Fulltext index on file_name for advanced searching
-- Use case: "Search for files containing 'ransomware' in name"
CREATE FULLTEXT INDEX IF NOT EXISTS idx_filename_fulltext 
ON scans(file_name)
COMMENT 'Enables full-text search on filenames';

-- Note: MySQL requires MyISAM or InnoDB (5.6+) for FULLTEXT indexes
-- If you get an error, the table might need conversion or your MySQL version doesn't support it


-- ============================================================
-- INDEXES for known_hashes Table
-- ============================================================

-- Composite index: ransomware_family + severity
CREATE INDEX IF NOT EXISTS idx_family_severity 
ON known_hashes(ransomware_family, severity)
COMMENT 'Optimizes queries filtering by family and severity';

-- Index on source for tracking hash origins
CREATE INDEX IF NOT EXISTS idx_hash_source 
ON known_hashes(source)
COMMENT 'Track hash sources';


-- ============================================================
-- INDEXES for alert_logs Table
-- ============================================================

-- Composite index: alert_status + timestamp
CREATE INDEX IF NOT EXISTS idx_alert_status_time 
ON alert_logs(alert_status, timestamp DESC)
COMMENT 'Optimizes queries for alert status tracking';

-- Composite index: alert_type + alert_status
CREATE INDEX IF NOT EXISTS idx_alert_type_status 
ON alert_logs(alert_type, alert_status)
COMMENT 'Optimizes queries analyzing alert types';


-- ============================================================
-- PARTIAL INDEXES (MySQL 8.0+)
-- ============================================================

-- Note: MySQL 8.0+ supports functional indexes
-- Uncomment if using MySQL 8.0 or higher

-- Index on recent scans only (last 30 days)
-- CREATE INDEX idx_recent_scans 
-- ON scans((CASE WHEN timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE NULL END), timestamp DESC);

-- Index on high-confidence malicious scans
-- CREATE INDEX idx_high_confidence_malicious
-- ON scans((CASE WHEN prediction = 'Malicious' AND confidence > 0.8 THEN 1 ELSE NULL END), timestamp DESC);


-- ============================================================
-- GENERATED COLUMNS with INDEXES (MySQL 5.7+)
-- ============================================================

-- Add generated column for scan date (without time)
ALTER TABLE scans 
ADD COLUMN IF NOT EXISTS scan_date DATE 
GENERATED ALWAYS AS (DATE(timestamp)) STORED
COMMENT 'Generated column: date part of timestamp';

-- Index on scan_date for daily aggregations
CREATE INDEX IF NOT EXISTS idx_scan_date 
ON scans(scan_date)
COMMENT 'Optimizes daily aggregation queries';

-- Add generated column for is_malicious (boolean)
ALTER TABLE scans 
ADD COLUMN IF NOT EXISTS is_malicious BOOLEAN 
GENERATED ALWAYS AS (prediction = 'Malicious') STORED
COMMENT 'Generated column: boolean malicious flag';

-- Index on is_malicious for fast filtering
CREATE INDEX IF NOT EXISTS idx_is_malicious 
ON scans(is_malicious, timestamp DESC)
COMMENT 'Fast malicious/safe filtering';


-- ============================================================
-- INDEX HINTS for Query Optimization
-- ============================================================

-- Document common query patterns with index hints
-- Example usage in application queries:

/*
-- Force use of specific index
SELECT * FROM scans 
USE INDEX (idx_prediction_timestamp)
WHERE prediction = 'Malicious' 
  AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY timestamp DESC;

-- Ignore specific index
SELECT * FROM scans 
IGNORE INDEX (idx_file_hash)
WHERE file_name LIKE '%virus%';

-- Force specific index
SELECT * FROM scans 
FORCE INDEX (idx_dashboard_covering)
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 DAY)
ORDER BY timestamp DESC;
*/


-- ============================================================
-- INDEX MAINTENANCE Procedures
-- ============================================================

-- Procedure to analyze and optimize all tables
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS optimize_tables()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE table_name VARCHAR(255);
    DECLARE cur CURSOR FOR 
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = 'ransomware_db'
          AND TABLE_TYPE = 'BASE TABLE';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO table_name;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Analyze table
        SET @sql = CONCAT('ANALYZE TABLE ', table_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        -- Optimize table
        SET @sql = CONCAT('OPTIMIZE TABLE ', table_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
    END LOOP;
    
    CLOSE cur;
    
    SELECT 'All tables analyzed and optimized' as status;
END //

DELIMITER ;


-- Procedure to rebuild indexes
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS rebuild_indexes(IN table_name VARCHAR(255))
BEGIN
    -- Disable keys
    SET @sql = CONCAT('ALTER TABLE ', table_name, ' DISABLE KEYS');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    -- Enable keys (rebuilds indexes)
    SET @sql = CONCAT('ALTER TABLE ', table_name, ' ENABLE KEYS');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    SELECT CONCAT('Indexes rebuilt for table: ', table_name) as status;
END //

DELIMITER ;


-- ============================================================
-- INDEX USAGE STATISTICS
-- ============================================================

-- View to monitor index usage
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    t.TABLE_NAME,
    t.INDEX_NAME,
    t.CARDINALITY,
    s.rows_read,
    s.rows_inserted,
    s.rows_updated,
    s.rows_deleted
FROM INFORMATION_SCHEMA.STATISTICS t
LEFT JOIN (
    SELECT 
        object_schema,
        object_name,
        index_name,
        count_star as rows_read,
        count_insert as rows_inserted,
        count_update as rows_updated,
        count_delete as rows_deleted
    FROM performance_schema.table_io_waits_summary_by_index_usage
    WHERE object_schema = 'ransomware_db'
) s ON t.TABLE_NAME = s.object_name 
    AND t.INDEX_NAME = s.index_name
WHERE t.TABLE_SCHEMA = 'ransomware_db'
ORDER BY t.TABLE_NAME, t.INDEX_NAME;


-- ============================================================
-- QUERY PERFORMANCE ANALYSIS
-- ============================================================

-- View for slow queries (requires performance_schema enabled)
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    DIGEST_TEXT as query,
    COUNT_STAR as executions,
    AVG_TIMER_WAIT / 1000000000 as avg_time_ms,
    MAX_TIMER_WAIT / 1000000000 as max_time_ms,
    SUM_ROWS_EXAMINED as total_rows_examined,
    SUM_ROWS_SENT as total_rows_sent
FROM performance_schema.events_statements_summary_by_digest
WHERE SCHEMA_NAME = 'ransomware_db'
  AND AVG_TIMER_WAIT > 1000000000  -- Queries taking more than 1ms
ORDER BY AVG_TIMER_WAIT DESC
LIMIT 20;


-- ============================================================
-- INDEX RECOMMENDATIONS
-- ============================================================

-- Check for missing indexes on foreign keys
SELECT 
    CONCAT(table_name, '.', column_name) as foreign_key,
    CONCAT(referenced_table_name, '.', referenced_column_name) as references,
    constraint_name
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE referenced_table_schema = 'ransomware_db'
  AND referenced_table_name IS NOT NULL
ORDER BY table_name, column_name;


-- Check for duplicate or redundant indexes
SELECT 
    a.TABLE_NAME,
    a.INDEX_NAME as index1,
    b.INDEX_NAME as index2,
    a.COLUMN_NAME
FROM INFORMATION_SCHEMA.STATISTICS a
JOIN INFORMATION_SCHEMA.STATISTICS b 
    ON a.TABLE_SCHEMA = b.TABLE_SCHEMA
    AND a.TABLE_NAME = b.TABLE_NAME
    AND a.COLUMN_NAME = b.COLUMN_NAME
    AND a.SEQ_IN_INDEX = b.SEQ_IN_INDEX
    AND a.INDEX_NAME < b.INDEX_NAME
WHERE a.TABLE_SCHEMA = 'ransomware_db'
ORDER BY a.TABLE_NAME, a.COLUMN_NAME;


-- ============================================================
-- PERFORMANCE TUNING RECOMMENDATIONS
-- ============================================================

/*
PERFORMANCE TIPS:

1. ANALYZE TABLES regularly (weekly recommended):
   CALL optimize_tables();

2. Check index usage:
   SELECT * FROM index_usage_stats;

3. Monitor slow queries:
   SELECT * FROM slow_queries;

4. For very large tables (>1M rows), consider:
   - Partitioning by timestamp
   - Archiving old data
   - Using read replicas

5. Update table statistics:
   ANALYZE TABLE scans;

6. Check query execution plans:
   EXPLAIN SELECT * FROM scans WHERE prediction = 'Malicious';

7. Enable query cache (if not using MySQL 8.0+):
   SET GLOBAL query_cache_size = 268435456; -- 256MB

8. Adjust InnoDB buffer pool:
   SET GLOBAL innodb_buffer_pool_size = 2147483648; -- 2GB
*/


-- ============================================================
-- VERIFY INDEX CREATION
-- ============================================================

-- Show all indexes on scans table
SELECT 
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as columns,
    INDEX_TYPE,
    NON_UNIQUE,
    INDEX_COMMENT
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'ransomware_db'
  AND TABLE_NAME = 'scans'
GROUP BY INDEX_NAME, INDEX_TYPE, NON_UNIQUE, INDEX_COMMENT
ORDER BY INDEX_NAME;


-- Show index cardinality (data distribution)
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    CARDINALITY,
    SUB_PART,
    INDEX_TYPE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'ransomware_db'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;


-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================

SELECT 
    '✅ Indexes created and optimized successfully!' as status,
    COUNT(DISTINCT INDEX_NAME) as total_indexes,
    DATABASE() as database_name,
    NOW() as completed_at
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'ransomware_db'
  AND TABLE_NAME = 'scans';

-- End of indexes.sql