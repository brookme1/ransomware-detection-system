-- ============================================================
-- Ransomware Detection System - Seed Data
-- ============================================================
-- Description: Sample data for testing and demonstration
-- Purpose: Populate database with realistic test data
-- CAUTION: This is SAMPLE DATA for testing only!
-- ============================================================

USE ransomware_db;

-- ============================================================
-- CLEAR EXISTING DATA (Optional - for clean start)
-- ============================================================

-- Uncomment to clear all data before seeding
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE alert_logs;
-- TRUNCATE TABLE scans;
-- TRUNCATE TABLE known_hashes;
-- TRUNCATE TABLE system_stats;
-- SET FOREIGN_KEY_CHECKS = 1;


-- ============================================================
-- SEED DATA: known_hashes
-- Known Ransomware Signatures (Real ransomware families)
-- ============================================================

INSERT INTO known_hashes (hash_value, hash_type, ransomware_family, description, severity, source) VALUES

-- WannaCry Ransomware
('ed01ebfbc9eb5bbea545af4d01bf5f1071661840480439c6e5babe8e080e41aa', 'SHA256', 'WannaCry', 'WannaCry ransomware variant - uses EternalBlue exploit', 'critical', 'VirusTotal'),
('09a46b3e1be080745a6d8d88d6b5bd351b1c7586ae0dc94d0c238ee36421cafa', 'SHA256', 'WannaCry', 'WannaCry ransomware dropper component', 'critical', 'Hybrid-Analysis'),

-- Locky Ransomware
('7c27e6b6ca3d0fbe9fc3b2d3e9f8e4a5d1c9b8e7f6a5d4c3b2a1f0e9d8c7b6a5', 'SHA256', 'Locky', 'Locky ransomware - encrypts user files', 'high', 'MalwareBazaar'),
('4b8e7c6d5a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3', 'SHA256', 'Locky', 'Locky ransomware variant with updated encryption', 'high', 'VirusTotal'),

-- Ryuk Ransomware
('9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8', 'SHA256', 'Ryuk', 'Ryuk ransomware - targets enterprise networks', 'critical', 'ThreatConnect'),
('f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2', 'SHA256', 'Ryuk', 'Ryuk ransomware dropper', 'critical', 'MITRE ATT&CK'),

-- Maze Ransomware
('a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2', 'SHA256', 'Maze', 'Maze ransomware - exfiltrates data before encryption', 'critical', 'Recorded Future'),

-- Sodinokibi/REvil Ransomware
('d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6', 'SHA256', 'Sodinokibi', 'REvil/Sodinokibi ransomware as a service', 'critical', 'CrowdStrike'),

-- Conti Ransomware
('c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0', 'SHA256', 'Conti', 'Conti ransomware - fast encryption algorithm', 'critical', 'Intel471'),

-- DarkSide Ransomware
('b3a4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4', 'SHA256', 'DarkSide', 'DarkSide ransomware - Colonial Pipeline attack', 'critical', 'FireEye'),

-- Cerber Ransomware
('e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'SHA256', 'Cerber', 'Cerber ransomware - voice ransom note', 'high', 'Kaspersky');


-- ============================================================
-- SEED DATA: scans - Safe Files
-- ============================================================

INSERT INTO scans (
    file_name, file_hash, file_hash_md5, file_type, file_size, 
    prediction, confidence, risk_level, detection_method, 
    scan_duration, client_ip, detection_details, timestamp
) VALUES

-- Safe executable files
('notepad.exe', 'c4ca4238a0b923820dcc509a6f75849bc6d9e8a8e9f6f7b9d8c7a6e5f4d3c2b1', 
 'e4d909c290d0fb1ca068ffaddf22cbd0', '.exe', 245760, 
 'Safe', 0.98, 'low', 'machine_learning', 2.145, 
 '192.168.1.100', 
 '{"entropy": 5.2, "suspicious_strings": [], "pe_analysis": {"num_sections": 4, "high_entropy_sections": 0}}',
 DATE_SUB(NOW(), INTERVAL 1 HOUR)),

('calculator.exe', 'c81e728d9d4c2f636f067f89cc14862c7d5e9c8a9b8f7e6d5c4b3a2f1e0d9c8b', 
 '70efdf2ec9b086079795c442636b55fb', '.exe', 128000, 
 'Safe', 0.95, 'low', 'machine_learning', 1.876, 
 '192.168.1.101', 
 '{"entropy": 5.5, "suspicious_strings": [], "pe_analysis": {"num_sections": 3, "high_entropy_sections": 0}}',
 DATE_SUB(NOW(), INTERVAL 2 HOUR)),

('chrome.exe', 'eccbc87e4b5ce2fe28308fd9f2a7baf39b0e9d8c7a6f5b4e3d2c1a0f9e8d7c6b', 
 '6f4922f45568161a8cdf4ad2299f6d23', '.exe', 2048576, 
 'Safe', 0.97, 'low', 'machine_learning', 2.532, 
 '192.168.1.102', 
 '{"entropy": 6.1, "suspicious_strings": [], "pe_analysis": {"num_sections": 5, "high_entropy_sections": 0}}',
 DATE_SUB(NOW(), INTERVAL 3 HOUR)),

-- Safe script files
('backup_script.ps1', 'a87ff679a2f3e71d9181a67b7542122c5d6e9f8a7b6c5d4e3f2a1b0c9d8e7f6a', 
 '1679091c5a880faf6fb5e6087eb1b2dc', '.ps1', 4096, 
 'Safe', 0.92, 'low', 'rule_based', 0.523, 
 '10.0.0.50', 
 '{"entropy": 4.8, "suspicious_strings": [], "pe_analysis": {}}',
 DATE_SUB(NOW(), INTERVAL 5 HOUR)),

('deploy.js', 'e4da3b7fbbce2345d7772b0674a318d5f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3', 
 '8f14e45fceea167a5a36dedd4bea2543', '.js', 8192, 
 'Safe', 0.89, 'low', 'machine_learning', 0.412, 
 '10.0.0.51', 
 '{"entropy": 5.0, "suspicious_strings": [], "pe_analysis": {}}',
 DATE_SUB(NOW(), INTERVAL 6 HOUR)),

-- Safe archives
('documents.zip', '1679091c5a880faf6fb5e6087eb1b2dc8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4', 
 'c74d97b01eae257e44aa9d5bade97baf', '.zip', 1024000, 
 'Safe', 0.91, 'low', 'machine_learning', 1.234, 
 '172.16.0.10', 
 '{"entropy": 6.5, "suspicious_strings": [], "archive_analysis": {"file_count": 10, "is_zip_bomb": false}}',
 DATE_SUB(NOW(), INTERVAL 8 HOUR));


-- ============================================================
-- SEED DATA: scans - Malicious Files
-- ============================================================

INSERT INTO scans (
    file_name, file_hash, file_hash_md5, file_type, file_size, 
    prediction, confidence, risk_level, detection_method, 
    scan_duration, client_ip, detection_details, alert_sent, alert_timestamp, timestamp
) VALUES

-- WannaCry detected
('wcry.exe', 'ed01ebfbc9eb5bbea545af4d01bf5f1071661840480439c6e5babe8e080e41aa', 
 '84c82835a5d21bbcf75a61706d8ab549', '.exe', 3723264, 
 'Malicious', 1.00, 'critical', 'hash_signature', 0.156, 
 '203.0.113.45', 
 '{"entropy": 7.9, "hash_match": true, "ransomware_family": "WannaCry", "suspicious_strings": ["encrypt", "bitcoin", "ransom"]}',
 TRUE, DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 30 MINUTE)),

-- Suspicious executable with high entropy
('invoice_2024.exe', 'f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9', 
 'd3d9446802a44259755d38e6d163e820', '.exe', 856032, 
 'Malicious', 0.94, 'critical', 'machine_learning', 2.876, 
 '198.51.100.23', 
 '{"entropy": 7.8, "suspicious_strings": ["encrypt", "decrypt", "AES", "ransom"], "pe_analysis": {"num_sections": 6, "high_entropy_sections": 4, "packed_sections": 2}}',
 TRUE, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- Obfuscated PowerShell script
('update.ps1', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2', 
 '6512bd43d9caa6e02c990b0a82652dca', '.ps1', 16384, 
 'Malicious', 0.87, 'high', 'rule_based', 0.678, 
 '192.0.2.100', 
 '{"entropy": 7.2, "suspicious_strings": ["hidden", "bypass", "download", "execute"], "pe_analysis": {}}',
 TRUE, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR)),

-- Suspicious VBScript
('document.vbs', 'c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0', 
 'c20ad4d76fe97759aa27a0c99bff6710', '.vbs', 2048, 
 'Malicious', 0.78, 'high', 'machine_learning', 0.345, 
 '203.0.113.67', 
 '{"entropy": 6.8, "suspicious_strings": ["WScript", "Shell", "Run"], "pe_analysis": {}}',
 FALSE, NULL, DATE_SUB(NOW(), INTERVAL 4 HOUR)),

-- Packed executable
('setup.exe', 'd5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6', 
 'c51ce410c124a10e0db5e4b97fc2af39', '.exe', 512000, 
 'Malicious', 0.91, 'critical', 'machine_learning', 2.123, 
 '198.51.100.89', 
 '{"entropy": 7.7, "suspicious_strings": ["encrypt", "victim"], "pe_analysis": {"num_sections": 3, "high_entropy_sections": 3, "packed_sections": 3, "suspicious_section_names": true}}',
 TRUE, DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 6 HOUR)),

-- Suspicious JavaScript
('loader.js', 'e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 
 'aab3238922bcc25a6f606eb525ffdc56', '.js', 32768, 
 'Malicious', 0.82, 'high', 'machine_learning', 0.567, 
 '192.0.2.45', 
 '{"entropy": 7.1, "suspicious_strings": ["eval", "unescape", "fromCharCode"], "pe_analysis": {}}',
 TRUE, DATE_SUB(NOW(), INTERVAL 10 HOUR), DATE_SUB(NOW(), INTERVAL 10 HOUR));


-- ============================================================
-- SEED DATA: scans - Medium Risk Files
-- ============================================================

INSERT INTO scans (
    file_name, file_hash, file_hash_md5, file_type, file_size, 
    prediction, confidence, risk_level, detection_method, 
    scan_duration, client_ip, detection_details, timestamp
) VALUES

('installer.exe', 'b3a4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4', 
 '45c48cce2e2d7fbdea1afc51c7c6ad26', '.exe', 2048000, 
 'Malicious', 0.65, 'medium', 'machine_learning', 2.234, 
 '10.0.0.100', 
 '{"entropy": 6.7, "suspicious_strings": ["install", "update"], "pe_analysis": {"num_sections": 4, "high_entropy_sections": 1}}',
 DATE_SUB(NOW(), INTERVAL 12 HOUR)),

('config.ps1', 'f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7', 
 'd3d9446802a44259755d38e6d163e820', '.ps1', 8192, 
 'Malicious', 0.58, 'medium', 'rule_based', 0.789, 
 '172.16.1.50', 
 '{"entropy": 6.2, "suspicious_strings": ["remote", "invoke"], "pe_analysis": {}}',
 DATE_SUB(NOW(), INTERVAL 15 HOUR));


-- ============================================================
-- SEED DATA: alert_logs
-- ============================================================

INSERT INTO alert_logs (scan_id, alert_type, alert_status, recipient, timestamp) VALUES
(7, 'webhook', 'sent', 'https://hooks.example.com/alerts', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(7, 'email', 'sent', 'security@company.com', DATE_SUB(NOW(), INTERVAL 29 MINUTE)),
(8, 'webhook', 'sent', 'https://hooks.example.com/alerts', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(8, 'email', 'sent', 'security@company.com', DATE_SUB(NOW(), INTERVAL 59 MINUTE)),
(9, 'webhook', 'sent', 'https://hooks.example.com/alerts', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(9, 'email', 'failed', 'security@company.com', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(11, 'webhook', 'sent', 'https://hooks.example.com/alerts', DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(11, 'email', 'sent', 'security@company.com', DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(12, 'webhook', 'sent', 'https://hooks.example.com/alerts', DATE_SUB(NOW(), INTERVAL 10 HOUR)),
(12, 'email', 'sent', 'security@company.com', DATE_SUB(NOW(), INTERVAL 10 HOUR));


-- ============================================================
-- SEED DATA: system_stats (last 7 days)
-- ============================================================

INSERT INTO system_stats (date, total_scans, malicious_count, safe_count, average_scan_time, detection_rate) VALUES
(CURDATE(), 14, 6, 8, 1.234, 0.4286),
(DATE_SUB(CURDATE(), INTERVAL 1 DAY), 25, 8, 17, 1.456, 0.32),
(DATE_SUB(CURDATE(), INTERVAL 2 DAY), 18, 5, 13, 1.123, 0.2778),
(DATE_SUB(CURDATE(), INTERVAL 3 DAY), 32, 12, 20, 1.567, 0.375),
(DATE_SUB(CURDATE(), INTERVAL 4 DAY), 21, 6, 15, 1.234, 0.2857),
(DATE_SUB(CURDATE(), INTERVAL 5 DAY), 28, 9, 19, 1.345, 0.3214),
(DATE_SUB(CURDATE(), INTERVAL 6 DAY), 19, 4, 15, 1.098, 0.2105);


-- ============================================================
-- VERIFY SEED DATA
-- ============================================================

-- Count records in each table
SELECT 'known_hashes' as table_name, COUNT(*) as record_count FROM known_hashes
UNION ALL
SELECT 'scans', COUNT(*) FROM scans
UNION ALL
SELECT 'alert_logs', COUNT(*) FROM alert_logs
UNION ALL
SELECT 'system_stats', COUNT(*) FROM system_stats;

-- Show sample scans
SELECT 
    id,
    file_name,
    prediction,
    confidence,
    risk_level,
    timestamp
FROM scans
ORDER BY timestamp DESC
LIMIT 10;

-- Show statistics
SELECT 
    prediction,
    COUNT(*) as count,
    ROUND(AVG(confidence) * 100, 2) as avg_confidence,
    ROUND(AVG(scan_duration), 3) as avg_scan_time
FROM scans
GROUP BY prediction;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================

SELECT 
    '✅ Seed data inserted successfully!' as status,
    (SELECT COUNT(*) FROM scans) as total_scans,
    (SELECT COUNT(*) FROM known_hashes) as known_hashes,
    (SELECT COUNT(*) FROM alert_logs) as alert_logs,
    DATABASE() as database_name,
    NOW() as completed_at;

-- End of seed_data.sql