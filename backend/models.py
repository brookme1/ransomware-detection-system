"""
Database Models for Ransomware Detection System
Defines data structures for MySQL (SQLAlchemy) and MongoDB (PyMongo)
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import validates
import json

# SQLAlchemy Base
Base = declarative_base()


# ==================== SQLAlchemy Models (MySQL) ====================

class ScanRecord(Base):
    """
    SQLAlchemy model for storing scan results in MySQL
    """
    __tablename__ = 'scans'
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # File information
    file_name = Column(String(255), nullable=False, index=True)
    file_hash = Column(String(64), nullable=False, unique=True, index=True)  # SHA256
    file_hash_md5 = Column(String(32), nullable=True)  # MD5 hash
    file_type = Column(String(10), nullable=False)  # .exe, .dll, etc.
    file_size = Column(Integer, nullable=False)  # Size in bytes
    
    # Detection results
    prediction = Column(String(20), nullable=False, index=True)  # Safe/Malicious
    confidence = Column(Float, nullable=False)  # 0.0 - 1.0
    risk_level = Column(String(20), nullable=True)  # low/medium/high/critical
    detection_method = Column(String(50), nullable=True)  # hash_signature/ml/rule_based
    
    # Performance metrics
    scan_duration = Column(Float, nullable=True)  # Seconds
    
    # Client information
    client_ip = Column(String(45), nullable=True)  # IPv4 or IPv6
    
    # Detection details (stored as JSON)
    detection_details = Column(JSON, nullable=True)
    
    # Alert status
    alert_sent = Column(Boolean, default=False)
    alert_timestamp = Column(DateTime, nullable=True)
    
    # Timestamps
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @validates('prediction')
    def validate_prediction(self, key, value):
        """Validate prediction values"""
        allowed = ['Safe', 'Malicious', 'Unknown']
        if value not in allowed:
            raise ValueError(f"Prediction must be one of {allowed}")
        return value
    
    @validates('confidence')
    def validate_confidence(self, key, value):
        """Validate confidence is between 0 and 1"""
        if not 0.0 <= value <= 1.0:
            raise ValueError("Confidence must be between 0.0 and 1.0")
        return value
    
    @validates('file_type')
    def validate_file_type(self, key, value):
        """Validate file type"""
        allowed_types = ['.exe', '.dll', '.js', '.vbs', '.ps1', '.zip', '.py']
        if value not in allowed_types:
            raise ValueError(f"File type must be one of {allowed_types}")
        return value
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'file_name': self.file_name,
            'file_hash': self.file_hash,
            'file_hash_md5': self.file_hash_md5,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'prediction': self.prediction,
            'confidence': self.confidence,
            'risk_level': self.risk_level,
            'detection_method': self.detection_method,
            'scan_duration': self.scan_duration,
            'client_ip': self.client_ip,
            'detection_details': self.detection_details,
            'alert_sent': self.alert_sent,
            'alert_timestamp': self.alert_timestamp.isoformat() if self.alert_timestamp else None,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return (
            f"<ScanRecord(id={self.id}, file='{self.file_name}', "
            f"prediction='{self.prediction}', confidence={self.confidence:.2f})>"
        )


class KnownHash(Base):
    """
    SQLAlchemy model for storing known ransomware hashes
    """
    __tablename__ = 'known_hashes'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    hash_value = Column(String(64), nullable=False, unique=True, index=True)  # SHA256
    hash_type = Column(String(10), default='SHA256')  # SHA256/MD5
    ransomware_family = Column(String(100), nullable=True)  # WannaCry, Locky, etc.
    description = Column(Text, nullable=True)
    severity = Column(String(20), default='high')  # low/medium/high/critical
    source = Column(String(255), nullable=True)  # Where hash was obtained
    added_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'hash_value': self.hash_value,
            'hash_type': self.hash_type,
            'ransomware_family': self.ransomware_family,
            'description': self.description,
            'severity': self.severity,
            'source': self.source,
            'added_date': self.added_date.isoformat() if self.added_date else None
        }
    
    def __repr__(self):
        return f"<KnownHash(family='{self.ransomware_family}', hash='{self.hash_value[:16]}...')>"


class AlertLog(Base):
    """
    SQLAlchemy model for tracking alerts sent
    """
    __tablename__ = 'alert_logs'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    scan_id = Column(Integer, nullable=False, index=True)
    alert_type = Column(String(50), nullable=False)  # webhook/email
    alert_status = Column(String(20), nullable=False)  # sent/failed
    recipient = Column(String(255), nullable=True)
    error_message = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'scan_id': self.scan_id,
            'alert_type': self.alert_type,
            'alert_status': self.alert_status,
            'recipient': self.recipient,
            'error_message': self.error_message,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
    
    def __repr__(self):
        return f"<AlertLog(scan_id={self.scan_id}, type='{self.alert_type}', status='{self.alert_status}')>"


# ==================== MongoDB Document Schemas ====================

class MongoScanDocument:
    """
    MongoDB document schema for scan records
    """
    
    @staticmethod
    def create_document(scan_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a MongoDB document from scan data
        
        Args:
            scan_data: Dictionary containing scan information
            
        Returns:
            MongoDB document with proper schema
        """
        # Convert datetime objects to ISO format strings
        timestamp = scan_data.get('timestamp', datetime.utcnow())
        if isinstance(timestamp, datetime):
            timestamp = timestamp.isoformat()
        
        document = {
            # File information
            'file_name': scan_data.get('file_name'),
            'file_hash': scan_data.get('file_hash'),
            'file_hash_md5': scan_data.get('file_hash_md5'),
            'file_type': scan_data.get('file_type'),
            'file_size': scan_data.get('file_size'),
            
            # Detection results
            'prediction': scan_data.get('prediction'),
            'confidence': scan_data.get('confidence'),
            'risk_level': scan_data.get('risk_level'),
            'detection_method': scan_data.get('detection_method'),
            
            # Performance metrics
            'scan_duration': scan_data.get('scan_duration'),
            
            # Client information
            'client_ip': scan_data.get('client_ip'),
            
            # Detection details
            'detection_details': scan_data.get('detection_details', {}),
            
            # Alert status
            'alert_sent': scan_data.get('alert_sent', False),
            'alert_timestamp': scan_data.get('alert_timestamp'),
            
            # Timestamps
            'timestamp': timestamp,
            'updated_at': datetime.utcnow().isoformat()
        }
        
        return document
    
    @staticmethod
    def validate_document(document: Dict[str, Any]) -> bool:
        """
        Validate MongoDB document structure
        
        Args:
            document: MongoDB document to validate
            
        Returns:
            True if valid, raises ValueError if invalid
        """
        required_fields = [
            'file_name', 'file_hash', 'file_type', 'file_size',
            'prediction', 'confidence', 'timestamp'
        ]
        
        for field in required_fields:
            if field not in document or document[field] is None:
                raise ValueError(f"Required field '{field}' is missing or None")
        
        # Validate prediction
        if document['prediction'] not in ['Safe', 'Malicious', 'Unknown']:
            raise ValueError(f"Invalid prediction value: {document['prediction']}")
        
        # Validate confidence
        if not 0.0 <= document['confidence'] <= 1.0:
            raise ValueError(f"Confidence must be between 0 and 1: {document['confidence']}")
        
        return True


class MongoKnownHashDocument:
    """
    MongoDB document schema for known ransomware hashes
    """
    
    @staticmethod
    def create_document(hash_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a MongoDB document for known hash"""
        return {
            'hash_value': hash_data.get('hash_value'),
            'hash_type': hash_data.get('hash_type', 'SHA256'),
            'ransomware_family': hash_data.get('ransomware_family'),
            'description': hash_data.get('description'),
            'severity': hash_data.get('severity', 'high'),
            'source': hash_data.get('source'),
            'added_date': datetime.utcnow().isoformat()
        }


class MongoAlertLogDocument:
    """
    MongoDB document schema for alert logs
    """
    
    @staticmethod
    def create_document(alert_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a MongoDB document for alert log"""
        return {
            'scan_id': alert_data.get('scan_id'),
            'alert_type': alert_data.get('alert_type'),
            'alert_status': alert_data.get('alert_status'),
            'recipient': alert_data.get('recipient'),
            'error_message': alert_data.get('error_message'),
            'timestamp': datetime.utcnow().isoformat()
        }


# ==================== Helper Functions ====================

def serialize_scan_result(scan_data: Dict[str, Any], db_type: str = 'mysql') -> Dict[str, Any]:
    """
    Serialize scan result for database storage
    
    Args:
        scan_data: Raw scan data dictionary
        db_type: 'mysql' or 'mongodb'
    
    Returns:
        Serialized data ready for database insertion
    """
    # Handle datetime conversion
    if 'timestamp' in scan_data and isinstance(scan_data['timestamp'], datetime):
        if db_type == 'mongodb':
            scan_data['timestamp'] = scan_data['timestamp'].isoformat()
    
    # Handle JSON serialization for detection_details
    if 'detection_details' in scan_data:
        if db_type == 'mysql' and isinstance(scan_data['detection_details'], str):
            scan_data['detection_details'] = json.loads(scan_data['detection_details'])
    
    return scan_data


def deserialize_scan_result(db_record: Any, db_type: str = 'mysql') -> Dict[str, Any]:
    """
    Deserialize database record to dictionary
    
    Args:
        db_record: Database record (SQLAlchemy object or MongoDB document)
        db_type: 'mysql' or 'mongodb'
    
    Returns:
        Dictionary representation of scan result
    """
    if db_type == 'mysql':
        # SQLAlchemy object
        if hasattr(db_record, 'to_dict'):
            return db_record.to_dict()
        else:
            return dict(db_record)
    elif db_type == 'mongodb':
        # MongoDB document
        result = dict(db_record)
        # Convert ObjectId to string
        if '_id' in result:
            result['id'] = str(result['_id'])
            del result['_id']
        return result
    else:
        raise ValueError(f"Unsupported database type: {db_type}")


def create_scan_record_from_dict(data: Dict[str, Any]) -> ScanRecord:
    """
    Create SQLAlchemy ScanRecord object from dictionary
    
    Args:
        data: Dictionary containing scan data
    
    Returns:
        ScanRecord object
    """
    return ScanRecord(
        file_name=data.get('file_name'),
        file_hash=data.get('file_hash'),
        file_hash_md5=data.get('file_hash_md5'),
        file_type=data.get('file_type'),
        file_size=data.get('file_size'),
        prediction=data.get('prediction'),
        confidence=data.get('confidence'),
        risk_level=data.get('risk_level'),
        detection_method=data.get('detection_method'),
        scan_duration=data.get('scan_duration'),
        client_ip=data.get('client_ip'),
        detection_details=data.get('detection_details'),
        alert_sent=data.get('alert_sent', False),
        alert_timestamp=data.get('alert_timestamp'),
        timestamp=data.get('timestamp', datetime.utcnow())
    )


# ==================== Database Schema Information ====================

MYSQL_SCHEMA_INFO = {
    'tables': {
        'scans': {
            'description': 'Main table storing all scan results',
            'indexes': ['file_hash', 'prediction', 'timestamp', 'file_name']
        },
        'known_hashes': {
            'description': 'Known ransomware hash signatures',
            'indexes': ['hash_value']
        },
        'alert_logs': {
            'description': 'Log of all alerts sent',
            'indexes': ['scan_id', 'timestamp']
        }
    }
}

MONGODB_COLLECTIONS_INFO = {
    'collections': {
        'scans': {
            'description': 'Main collection storing all scan results',
            'indexes': [
                {'field': 'file_hash', 'unique': True},
                {'field': 'prediction'},
                {'field': 'timestamp'}
            ]
        },
        'known_hashes': {
            'description': 'Known ransomware hash signatures',
            'indexes': [
                {'field': 'hash_value', 'unique': True}
            ]
        },
        'alert_logs': {
            'description': 'Log of all alerts sent',
            'indexes': [
                {'field': 'scan_id'},
                {'field': 'timestamp'}
            ]
        }
    }
}


if __name__ == "__main__":
    # Test model creation
    print("📊 Database Models Information")
    print("\n=== MySQL Tables ===")
    for table, info in MYSQL_SCHEMA_INFO['tables'].items():
        print(f"\n{table}:")
        print(f"  Description: {info['description']}")
        print(f"  Indexes: {', '.join(info['indexes'])}")
    
    print("\n=== MongoDB Collections ===")
    for collection, info in MONGODB_COLLECTIONS_INFO['collections'].items():
        print(f"\n{collection}:")
        print(f"  Description: {info['description']}")
        print(f"  Indexes: {[idx['field'] for idx in info['indexes']]}")
    
    # Test scan record creation
    print("\n=== Test Scan Record ===")
    test_data = {
        'file_name': 'test.exe',
        'file_hash': 'a' * 64,
        'file_type': '.exe',
        'file_size': 1024,
        'prediction': 'Safe',
        'confidence': 0.95,
        'scan_duration': 2.5
    }
    
    scan = create_scan_record_from_dict(test_data)
    print(f"Created: {scan}")
    print(f"As dict: {scan.to_dict()}")