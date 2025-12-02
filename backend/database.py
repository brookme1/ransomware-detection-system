"""
Database Connection and Operations Module
Handles MySQL (SQLAlchemy) and MongoDB (PyMongo) operations
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from contextlib import contextmanager

# SQLAlchemy imports (MySQL)
from sqlalchemy import create_engine, desc, func, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

# PyMongo imports (MongoDB)
try:
    from pymongo import MongoClient, ASCENDING, DESCENDING
    from pymongo.errors import PyMongoError, DuplicateKeyError
    PYMONGO_AVAILABLE = True
except ImportError:
    PYMONGO_AVAILABLE = False
    logging.warning("PyMongo not available - MongoDB support disabled")

from config import Config
from models import (
    Base, ScanRecord, KnownHash, AlertLog,
    MongoScanDocument, MongoKnownHashDocument, MongoAlertLogDocument,
    serialize_scan_result, deserialize_scan_result, create_scan_record_from_dict
)

logger = logging.getLogger(__name__)


class Database:
    """
    Database abstraction layer supporting both MySQL and MongoDB
    """
    
    def __init__(self):
        self.db_type = Config.DB_TYPE
        self.engine = None
        self.SessionLocal = None
        self.mongo_client = None
        self.mongo_db = None
        
        logger.info(f"🗄️  Initializing {self.db_type.upper()} database connection")
    
    def connect(self):
        """Establish database connection based on configuration"""
        try:
            if self.db_type == 'mysql':
                self._connect_mysql()
            elif self.db_type == 'sqlite':
                self._connect_sqlite()
            elif self.db_type == 'mongodb':
                self._connect_mongodb()
            else:
                raise ValueError(f"Unsupported database type: {self.db_type}")
            
            logger.info(f"✅ Database connected successfully: {self.db_type}")
        except Exception as e:
            logger.error(f"❌ Database connection failed: {e}")
            raise
    
    def _connect_mysql(self):
        """Connect to MySQL database using SQLAlchemy"""
        try:
            # Create engine
            self.engine = create_engine(
                Config.MYSQL_CONNECTION_STRING,
                pool_pre_ping=True,
                pool_recycle=3600,
                echo=Config.DEBUG
            )
            
            # Create tables if they don't exist
            Base.metadata.create_all(self.engine)
            
            # Create session factory
            self.SessionLocal = sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=self.engine
            )
            
            logger.info("✅ MySQL connection established")
            
        except SQLAlchemyError as e:
            logger.error(f"❌ MySQL connection failed: {e}")
            raise

    def _connect_sqlite(self):
        """Connect to SQLite database for local development"""
        try:
            self.engine = create_engine(
                Config.SQLITE_CONNECTION_STRING,
                connect_args={"check_same_thread": False},
                echo=Config.DEBUG
            )

            Base.metadata.create_all(self.engine)

            self.SessionLocal = sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=self.engine
            )

            logger.info("✅ SQLite connection established")
        except SQLAlchemyError as e:
            logger.error(f"❌ SQLite connection failed: {e}")
            raise
    
    def _connect_mongodb(self):
        """Connect to MongoDB database using PyMongo"""
        if not PYMONGO_AVAILABLE:
            raise ImportError("PyMongo is not installed. Install with: pip install pymongo")
        
        try:
            # Create MongoDB client
            self.mongo_client = MongoClient(
                Config.MONGODB_URI,
                serverSelectionTimeoutMS=5000
            )
            
            # Test connection
            self.mongo_client.admin.command('ping')
            
            # Get database
            self.mongo_db = self.mongo_client[Config.MONGODB_DATABASE]
            
            # Create indexes
            self._create_mongodb_indexes()
            
            logger.info("✅ MongoDB connection established")
            
        except PyMongoError as e:
            logger.error(f"❌ MongoDB connection failed: {e}")
            raise
    
    def _create_mongodb_indexes(self):
        """Create indexes for MongoDB collections"""
        try:
            scans_collection = self.mongo_db['scans']
            
            # Create indexes
            scans_collection.create_index([('file_hash', ASCENDING)], unique=True)
            scans_collection.create_index([('prediction', ASCENDING)])
            scans_collection.create_index([('timestamp', DESCENDING)])
            scans_collection.create_index([('file_name', ASCENDING)])
            
            # Known hashes indexes
            known_hashes = self.mongo_db['known_hashes']
            known_hashes.create_index([('hash_value', ASCENDING)], unique=True)
            
            # Alert logs indexes
            alert_logs = self.mongo_db['alert_logs']
            alert_logs.create_index([('scan_id', ASCENDING)])
            alert_logs.create_index([('timestamp', DESCENDING)])
            
            logger.info("✅ MongoDB indexes created")
            
        except PyMongoError as e:
            logger.warning(f"⚠️ Failed to create MongoDB indexes: {e}")
    
    def disconnect(self):
        """Close database connection"""
        try:
            if self.db_type in ('mysql', 'sqlite') and self.engine:
                self.engine.dispose()
                logger.info("🔌 SQL database connection closed")
            elif self.db_type == 'mongodb' and self.mongo_client:
                self.mongo_client.close()
                logger.info("🔌 MongoDB connection closed")
        except Exception as e:
            logger.error(f"Error closing database connection: {e}")
    
    @contextmanager
    def get_session(self):
        """
        Context manager for MySQL database sessions
        Usage: with db.get_session() as session: ...
        """
        if self.db_type not in ('mysql', 'sqlite'):
            raise ValueError("get_session() is only available for SQL databases")
        
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Session error: {e}")
            raise
        finally:
            session.close()
    
    def check_connection(self) -> bool:
        """Check if database connection is alive"""
        try:
            if self.db_type in ('mysql', 'sqlite'):
                with self.get_session() as session:
                    session.execute(text('SELECT 1'))
                return True
            elif self.db_type == 'mongodb':
                self.mongo_client.admin.command('ping')
                return True
        except Exception as e:
            logger.error(f"Connection check failed: {e}")
            return False
    
    # ==================== SCAN OPERATIONS ====================
    
    def save_scan(self, scan_data: Dict[str, Any]) -> int:
        """
        Save scan result to database
        
        Args:
            scan_data: Dictionary containing scan information
        
        Returns:
            Scan ID (integer for MySQL, string for MongoDB)
        """
        try:
            if self.db_type in ('mysql', 'sqlite'):
                return self._save_scan_mysql(scan_data)
            elif self.db_type == 'mongodb':
                return self._save_scan_mongodb(scan_data)
        except Exception as e:
            logger.error(f"Failed to save scan: {e}")
            raise
    
    def _save_scan_mysql(self, scan_data: Dict[str, Any]) -> int:
        """Save scan to MySQL database"""
        try:
            with self.get_session() as session:
                # Create scan record
                scan_record = create_scan_record_from_dict(scan_data)
                
                # Add to session and commit
                session.add(scan_record)
                session.flush()  # Get the ID without committing
                
                scan_id = scan_record.id
                
                logger.info(f"✅ Scan saved to MySQL: ID={scan_id}")
                return scan_id
                
        except IntegrityError as e:
            # Handle duplicate hash
            logger.warning(f"⚠️ Duplicate scan detected: {scan_data.get('file_hash')}")
            # Try to get existing scan ID
            with self.get_session() as session:
                existing = session.query(ScanRecord).filter_by(
                    file_hash=scan_data.get('file_hash')
                ).first()
                return existing.id if existing else None
        except SQLAlchemyError as e:
            logger.error(f"❌ MySQL save error: {e}")
            raise
    
    def _save_scan_mongodb(self, scan_data: Dict[str, Any]) -> str:
        """Save scan to MongoDB database"""
        try:
            collection = self.mongo_db['scans']
            
            # Create document
            document = MongoScanDocument.create_document(scan_data)
            MongoScanDocument.validate_document(document)
            
            # Insert document
            result = collection.insert_one(document)
            scan_id = str(result.inserted_id)
            
            logger.info(f"✅ Scan saved to MongoDB: ID={scan_id}")
            return scan_id
            
        except DuplicateKeyError:
            # Handle duplicate hash
            logger.warning(f"⚠️ Duplicate scan detected: {scan_data.get('file_hash')}")
            existing = collection.find_one({'file_hash': scan_data.get('file_hash')})
            return str(existing['_id']) if existing else None
        except PyMongoError as e:
            logger.error(f"❌ MongoDB save error: {e}")
            raise
    
    def get_all_scans(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """
        Retrieve all scan records with pagination
        
        Args:
            limit: Maximum number of records to return
            offset: Number of records to skip
        
        Returns:
            List of scan records as dictionaries
        """
        try:
            if self.db_type in ('mysql', 'sqlite'):
                return self._get_all_scans_mysql(limit, offset)
            elif self.db_type == 'mongodb':
                return self._get_all_scans_mongodb(limit, offset)
        except Exception as e:
            logger.error(f"Failed to retrieve scans: {e}")
            raise
    
    def _get_all_scans_mysql(self, limit: int, offset: int) -> List[Dict[str, Any]]:
        """Retrieve scans from MySQL"""
        try:
            with self.get_session() as session:
                scans = session.query(ScanRecord)\
                    .order_by(desc(ScanRecord.timestamp))\
                    .limit(limit)\
                    .offset(offset)\
                    .all()
                
                return [scan.to_dict() for scan in scans]
        except SQLAlchemyError as e:
            logger.error(f"❌ MySQL query error: {e}")
            raise
    
    def _get_all_scans_mongodb(self, limit: int, offset: int) -> List[Dict[str, Any]]:
        """Retrieve scans from MongoDB"""
        try:
            collection = self.mongo_db['scans']
            
            scans = collection.find()\
                .sort('timestamp', DESCENDING)\
                .skip(offset)\
                .limit(limit)
            
            return [deserialize_scan_result(scan, 'mongodb') for scan in scans]
        except PyMongoError as e:
            logger.error(f"❌ MongoDB query error: {e}")
            raise
    
    def get_scan_by_id(self, scan_id: Any) -> Optional[Dict[str, Any]]:
        """
        Retrieve a specific scan by ID
        
        Args:
            scan_id: Scan ID (int for MySQL, str for MongoDB)
        
        Returns:
            Scan record as dictionary or None
        """
        try:
            if self.db_type in ('mysql', 'sqlite'):
                return self._get_scan_by_id_mysql(scan_id)
            elif self.db_type == 'mongodb':
                return self._get_scan_by_id_mongodb(scan_id)
        except Exception as e:
            logger.error(f"Failed to retrieve scan {scan_id}: {e}")
            raise
    
    def _get_scan_by_id_mysql(self, scan_id: int) -> Optional[Dict[str, Any]]:
        """Retrieve scan by ID from MySQL"""
        try:
            with self.get_session() as session:
                scan = session.query(ScanRecord).filter_by(id=scan_id).first()
                return scan.to_dict() if scan else None
        except SQLAlchemyError as e:
            logger.error(f"❌ MySQL query error: {e}")
            raise
    
    def _get_scan_by_id_mongodb(self, scan_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve scan by ID from MongoDB"""
        try:
            from bson.objectid import ObjectId
            
            collection = self.mongo_db['scans']
            scan = collection.find_one({'_id': ObjectId(scan_id)})
            
            return deserialize_scan_result(scan, 'mongodb') if scan else None
        except PyMongoError as e:
            logger.error(f"❌ MongoDB query error: {e}")
            raise
    
    def get_scan_by_hash(self, file_hash: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve scan by file hash
        
        Args:
            file_hash: SHA256 hash of file
        
        Returns:
            Scan record as dictionary or None
        """
        try:
            if self.db_type in ('mysql', 'sqlite'):
                with self.get_session() as session:
                    scan = session.query(ScanRecord).filter_by(file_hash=file_hash).first()
                    return scan.to_dict() if scan else None
            elif self.db_type == 'mongodb':
                collection = self.mongo_db['scans']
                scan = collection.find_one({'file_hash': file_hash})
                return deserialize_scan_result(scan, 'mongodb') if scan else None
        except Exception as e:
            logger.error(f"Failed to retrieve scan by hash: {e}")
            return None
    
    def get_scan_count(self) -> int:
        """Get total number of scans in database"""
        try:
            if self.db_type in ('mysql', 'sqlite'):
                with self.get_session() as session:
                    return session.query(func.count(ScanRecord.id)).scalar()
            elif self.db_type == 'mongodb':
                collection = self.mongo_db['scans']
                return collection.count_documents({})
        except Exception as e:
            logger.error(f"Failed to get scan count: {e}")
            return 0
    
    def get_malicious_scans(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Retrieve recent malicious scans
        
        Args:
            limit: Maximum number of records
        
        Returns:
            List of malicious scan records
        """
        try:
            if self.db_type in ('mysql', 'sqlite'):
                with self.get_session() as session:
                    scans = session.query(ScanRecord)\
                        .filter_by(prediction='Malicious')\
                        .order_by(desc(ScanRecord.timestamp))\
                        .limit(limit)\
                        .all()
                    return [scan.to_dict() for scan in scans]
            elif self.db_type == 'mongodb':
                collection = self.mongo_db['scans']
                scans = collection.find({'prediction': 'Malicious'})\
                    .sort('timestamp', DESCENDING)\
                    .limit(limit)
                return [deserialize_scan_result(scan, 'mongodb') for scan in scans]
        except Exception as e:
            logger.error(f"Failed to retrieve malicious scans: {e}")
            return []
    
    # ==================== STATISTICS ====================
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get database statistics
        
        Returns:
            Dictionary with statistics
        """
        try:
            stats = {
                'total_scans': 0,
                'malicious_count': 0,
                'safe_count': 0,
                'detection_rate': 0.0,
                'recent_scans': []
            }
            
            if self.db_type in ('mysql', 'sqlite'):
                with self.get_session() as session:
                    stats['total_scans'] = session.query(func.count(ScanRecord.id)).scalar()
                    stats['malicious_count'] = session.query(func.count(ScanRecord.id))\
                        .filter_by(prediction='Malicious').scalar()
                    stats['safe_count'] = session.query(func.count(ScanRecord.id))\
                        .filter_by(prediction='Safe').scalar()
                    
                    recent = session.query(ScanRecord)\
                        .order_by(desc(ScanRecord.timestamp))\
                        .limit(10)\
                        .all()
                    stats['recent_scans'] = [scan.to_dict() for scan in recent]
                    
            elif self.db_type == 'mongodb':
                collection = self.mongo_db['scans']
                stats['total_scans'] = collection.count_documents({})
                stats['malicious_count'] = collection.count_documents({'prediction': 'Malicious'})
                stats['safe_count'] = collection.count_documents({'prediction': 'Safe'})
                
                recent = collection.find()\
                    .sort('timestamp', DESCENDING)\
                    .limit(10)
                stats['recent_scans'] = [deserialize_scan_result(scan, 'mongodb') for scan in recent]
            
            # Calculate detection rate
            if stats['total_scans'] > 0:
                stats['detection_rate'] = stats['malicious_count'] / stats['total_scans']
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get statistics: {e}")
            return {}
    
    # ==================== ALERT LOG OPERATIONS ====================
    
    def log_alert(self, alert_data: Dict[str, Any]) -> bool:
        """
        Log an alert to database
        
        Args:
            alert_data: Dictionary containing alert information
        
        Returns:
            True if successful
        """
        try:
            if self.db_type in ('mysql', 'sqlite'):
                with self.get_session() as session:
                    alert = AlertLog(
                        scan_id=alert_data.get('scan_id'),
                        alert_type=alert_data.get('alert_type'),
                        alert_status=alert_data.get('alert_status'),
                        recipient=alert_data.get('recipient'),
                        error_message=alert_data.get('error_message')
                    )
                    session.add(alert)
                    logger.info(f"✅ Alert logged: scan_id={alert_data.get('scan_id')}")
                    return True
                    
            elif self.db_type == 'mongodb':
                collection = self.mongo_db['alert_logs']
                document = MongoAlertLogDocument.create_document(alert_data)
                collection.insert_one(document)
                logger.info(f"✅ Alert logged: scan_id={alert_data.get('scan_id')}")
                return True
                
        except Exception as e:
            logger.error(f"Failed to log alert: {e}")
            return False


# ==================== UTILITY FUNCTIONS ====================

def init_database():
    """Initialize database connection and create tables"""
    db = Database()
    db.connect()
    logger.info("🗄️  Database initialized successfully")
    return db


if __name__ == "__main__":
    # Test database connection
    print("🧪 Testing database connection...")
    
    db = init_database()
    
    # Check connection
    if db.check_connection():
        print("✅ Database connection successful!")
        
        # Get statistics
        stats = db.get_statistics()
        print(f"\n📊 Database Statistics:")
        print(f"  Total Scans: {stats.get('total_scans', 0)}")
        print(f"  Malicious: {stats.get('malicious_count', 0)}")
        print(f"  Safe: {stats.get('safe_count', 0)}")
        print(f"  Detection Rate: {stats.get('detection_rate', 0):.2%}")
    else:
        print("❌ Database connection failed!")
    
    db.disconnect()
    print("\n🔌 Database connection closed")