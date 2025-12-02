"""
Ransomware Detection System - Configuration Settings
Centralized configuration using environment variables
"""

import os
from dotenv import load_dotenv
from typing import List

# Load environment variables from .env file
load_dotenv()


class Config:
    """Application configuration class"""
    
    # ==================== APPLICATION SETTINGS ====================
    APP_NAME = "Ransomware Detection System"
    VERSION = "1.0.0"
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    
    # Server settings
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    
    # Secret key for session management
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    
    # ==================== CORS SETTINGS ====================
    # Allow React frontend to communicate with backend
    ALLOWED_ORIGINS = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000"
    ).split(",")
    
    # ==================== DATABASE SETTINGS ====================
    # Database type: 'mysql', 'sqlite', or 'mongodb'
    DB_TYPE = os.getenv("DB_TYPE", "sqlite").lower()
    
    # MySQL Configuration
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "password")
    MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "ransomware_db")
    
    # MySQL connection string
    MYSQL_CONNECTION_STRING = (
        f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@"
        f"{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"
    )

    # SQLite Configuration (development fallback)
    SQLITE_PATH = os.path.abspath(os.getenv(
        "SQLITE_PATH",
        os.path.join("database", "ransomware.db")
    ))
    SQLITE_CONNECTION_STRING = f"sqlite:///{SQLITE_PATH.replace(os.sep, '/')}"
    sqlite_dir = os.path.dirname(SQLITE_PATH)
    if sqlite_dir and not os.path.exists(sqlite_dir):
        os.makedirs(sqlite_dir, exist_ok=True)
    
    # MongoDB Configuration (alternative)
    MONGODB_URI = os.getenv(
        "MONGODB_URI",
        "mongodb://localhost:27017/"
    )
    MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "ransomware_db")
    MONGODB_COLLECTION = os.getenv("MONGODB_COLLECTION", "scans")
    
    # ==================== FILE UPLOAD SETTINGS ====================
    # Maximum file size: 100 MB
    MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", 100 * 1024 * 1024))
    
    # Allowed file extensions
    ALLOWED_EXTENSIONS = ['.exe', '.dll', '.js', '.vbs', '.ps1', '.zip', '.py']
    
    # Temporary upload directory
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "temp_uploads")
    
    # Create upload folder if it doesn't exist
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    
    # ==================== MACHINE LEARNING SETTINGS ====================
    # ML model path
    MODEL_PATH = os.getenv("MODEL_PATH", "models/ransomware_detector.pkl")
    
    # Model type: 'random_forest' or 'logistic_regression'
    MODEL_TYPE = os.getenv("MODEL_TYPE", "random_forest")
    
    # Malicious confidence threshold
    MALICIOUS_THRESHOLD = float(os.getenv("MALICIOUS_THRESHOLD", 0.5))
    
    # Feature extraction settings
    EXTRACT_STRINGS = os.getenv("EXTRACT_STRINGS", "True").lower() == "true"
    EXTRACT_ENTROPY = os.getenv("EXTRACT_ENTROPY", "True").lower() == "true"
    EXTRACT_PE_INFO = os.getenv("EXTRACT_PE_INFO", "True").lower() == "true"
    
    # ==================== DETECTION SETTINGS ====================
    # Known ransomware hashes database path
    KNOWN_RANSOMWARE_HASHES_PATH = os.getenv(
        "KNOWN_RANSOMWARE_HASHES",
        "data/known_ransomware_hashes.txt"
    )
    
    # Suspicious strings to detect
    SUSPICIOUS_STRINGS = [
        'encrypt', 'decrypt', 'ransom', 'bitcoin', 'btc',
        'wallet', 'payment', 'cryptocurrency', 'locked',
        'restore', 'recovery', 'YOUR_FILES', 'DECRYPT',
        'HOW_TO_DECRYPT', 'README', '.onion', 'TOR',
        'ENCRYPTED', 'victim', 'AES', 'RSA', 'cipher'
    ]
    
    # Suspicious PE section names
    SUSPICIOUS_SECTIONS = [
        '.packed', '.enigma', '.upx', '.aspack',
        '.petite', '.rlpack', '.themida'
    ]
    
    # Entropy thresholds
    HIGH_ENTROPY_THRESHOLD = float(os.getenv("HIGH_ENTROPY_THRESHOLD", 7.0))
    SECTION_ENTROPY_THRESHOLD = float(os.getenv("SECTION_ENTROPY_THRESHOLD", 6.5))
    
    # ==================== ALERT SETTINGS ====================
    # Alert cooldown period (seconds) - prevent duplicate alerts
    ALERT_COOLDOWN = int(os.getenv("ALERT_COOLDOWN", 3600))  # 1 hour
    
    # Webhook configuration
    WEBHOOK_ENABLED = os.getenv("WEBHOOK_ENABLED", "False").lower() == "true"
    WEBHOOK_URL = os.getenv("WEBHOOK_URL", "")
    WEBHOOK_TIMEOUT = int(os.getenv("WEBHOOK_TIMEOUT", 5))
    
    # Email configuration
    SMTP_ENABLED = os.getenv("SMTP_ENABLED", "False").lower() == "true"
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM = os.getenv("SMTP_FROM", "alerts@ransomware-detector.com")
    SMTP_TO = os.getenv("SMTP_TO", "admin@company.com")
    SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "True").lower() == "true"
    
    # ==================== LOGGING SETTINGS ====================
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE = os.getenv("LOG_FILE", "ransomware_detector.log")
    LOG_MAX_BYTES = int(os.getenv("LOG_MAX_BYTES", 10 * 1024 * 1024))  # 10 MB
    LOG_BACKUP_COUNT = int(os.getenv("LOG_BACKUP_COUNT", 5))
    
    # ==================== PERFORMANCE SETTINGS ====================
    # Target scan time (seconds)
    TARGET_SCAN_TIME = float(os.getenv("TARGET_SCAN_TIME", 3.0))
    
    # Enable concurrent scanning
    CONCURRENT_SCANNING = os.getenv("CONCURRENT_SCANNING", "True").lower() == "true"
    
    # Maximum concurrent workers
    MAX_WORKERS = int(os.getenv("MAX_WORKERS", 4))
    
    # Request rate limiting
    RATE_LIMIT_ENABLED = os.getenv("RATE_LIMIT_ENABLED", "True").lower() == "true"
    RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", 60))
    
    # ==================== SECURITY SETTINGS ====================
    # Enable IP logging
    LOG_CLIENT_IP = os.getenv("LOG_CLIENT_IP", "True").lower() == "true"
    
    # Require API key for requests (optional)
    REQUIRE_API_KEY = os.getenv("REQUIRE_API_KEY", "False").lower() == "true"
    API_KEY = os.getenv("API_KEY", "")
    
    # ==================== ARCHIVE HANDLING ====================
    # Enable zip file extraction and analysis
    ANALYZE_ARCHIVES = os.getenv("ANALYZE_ARCHIVES", "True").lower() == "true"
    
    # Maximum files to extract from archive
    MAX_ARCHIVE_FILES = int(os.getenv("MAX_ARCHIVE_FILES", 100))
    
    # Maximum archive extraction depth
    MAX_ARCHIVE_DEPTH = int(os.getenv("MAX_ARCHIVE_DEPTH", 3))
    
    # Zip bomb detection - max uncompressed size
    MAX_UNCOMPRESSED_SIZE = int(os.getenv("MAX_UNCOMPRESSED_SIZE", 1024 * 1024 * 1024))  # 1 GB
    
    # ==================== VALIDATION METHODS ====================
    @classmethod
    def validate_config(cls):
        """Validate configuration settings"""
        errors = []
        
        # Check database configuration
        if cls.DB_TYPE == "mysql":
            if not cls.MYSQL_PASSWORD or cls.MYSQL_PASSWORD == "password":
                errors.append("⚠️ Warning: Using default MySQL password")
        elif cls.DB_TYPE == "sqlite":
            sqlite_dir = os.path.dirname(cls.SQLITE_PATH)
            if sqlite_dir and not os.path.exists(sqlite_dir):
                os.makedirs(sqlite_dir, exist_ok=True)
                errors.append(f"ℹ️ Info: Created SQLite directory: {sqlite_dir}")
        
        # Check secret key
        if cls.SECRET_KEY == "your-secret-key-change-in-production":
            errors.append("⚠️ Warning: Using default SECRET_KEY - change in production!")
        
        # Check SMTP configuration if enabled
        if cls.SMTP_ENABLED:
            if not cls.SMTP_USERNAME or not cls.SMTP_PASSWORD:
                errors.append("❌ Error: SMTP enabled but credentials not provided")
            if not cls.SMTP_TO:
                errors.append("❌ Error: SMTP enabled but recipient email not provided")
        
        # Check webhook configuration if enabled
        if cls.WEBHOOK_ENABLED:
            if not cls.WEBHOOK_URL:
                errors.append("❌ Error: Webhook enabled but URL not provided")
        
        # Check model path
        if not os.path.exists(os.path.dirname(cls.MODEL_PATH)):
            os.makedirs(os.path.dirname(cls.MODEL_PATH))
            errors.append(f"ℹ️ Info: Created model directory: {os.path.dirname(cls.MODEL_PATH)}")
        
        # Check known hashes file
        if cls.KNOWN_RANSOMWARE_HASHES_PATH:
            hash_dir = os.path.dirname(cls.KNOWN_RANSOMWARE_HASHES_PATH)
            if hash_dir and not os.path.exists(hash_dir):
                os.makedirs(hash_dir)
        
        return errors
    
    @classmethod
    def get_db_config(cls):
        """Get database configuration as dictionary"""
        if cls.DB_TYPE == "mysql":
            return {
                "type": "mysql",
                "host": cls.MYSQL_HOST,
                "port": cls.MYSQL_PORT,
                "user": cls.MYSQL_USER,
                "password": cls.MYSQL_PASSWORD,
                "database": cls.MYSQL_DATABASE
            }
        elif cls.DB_TYPE == "sqlite":
            return {
                "type": "sqlite",
                "path": cls.SQLITE_PATH,
                "connection_string": cls.SQLITE_CONNECTION_STRING
            }
        elif cls.DB_TYPE == "mongodb":
            return {
                "type": "mongodb",
                "uri": cls.MONGODB_URI,
                "database": cls.MONGODB_DATABASE,
                "collection": cls.MONGODB_COLLECTION
            }
        else:
            raise ValueError(f"Unsupported database type: {cls.DB_TYPE}")
    
    @classmethod
    def print_config(cls):
        """Print current configuration (excluding sensitive data)"""
        print("\n" + "="*60)
        print(f"🔧 {cls.APP_NAME} v{cls.VERSION} Configuration")
        print("="*60)
        print(f"🌐 Server: {cls.HOST}:{cls.PORT}")
        print(f"🗄️  Database: {cls.DB_TYPE}")
        print(f"🧠 ML Model: {cls.MODEL_PATH}")
        print(f"📊 Max File Size: {cls.MAX_FILE_SIZE / (1024*1024):.0f} MB")
        print(f"🚨 Alerts: Webhook={cls.WEBHOOK_ENABLED}, Email={cls.SMTP_ENABLED}")
        print(f"⚡ Concurrent Scanning: {cls.CONCURRENT_SCANNING}")
        print(f"🔒 Debug Mode: {cls.DEBUG}")
        print("="*60 + "\n")


# Validate configuration on import
validation_errors = Config.validate_config()
if validation_errors:
    print("\n⚠️  Configuration Warnings/Errors:")
    for error in validation_errors:
        print(f"  {error}")
    print()