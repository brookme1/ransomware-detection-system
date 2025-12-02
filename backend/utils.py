"""
Utility Functions for Ransomware Detection System
Helper functions for file handling, validation, formatting, and security
"""

import os
import re
import hashlib
import mimetypes
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from pathlib import Path
import logging

from fastapi import Request

logger = logging.getLogger(__name__)


# ==================== FILE VALIDATION ====================

def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal and malicious filenames
    
    Args:
        filename: Original filename
    
    Returns:
        Sanitized filename
    """
    if not filename:
        return "unnamed_file"
    
    # Get base filename without path
    filename = os.path.basename(filename)
    
    # Remove or replace dangerous characters
    # Allow only alphanumeric, dots, underscores, hyphens
    sanitized = re.sub(r'[^\w\s\-\.]', '_', filename)
    
    # Remove multiple dots (potential extension hiding)
    sanitized = re.sub(r'\.{2,}', '.', sanitized)
    
    # Limit length
    max_length = 255
    if len(sanitized) > max_length:
        name, ext = os.path.splitext(sanitized)
        sanitized = name[:max_length - len(ext)] + ext
    
    # Ensure not empty
    if not sanitized or sanitized == '.':
        sanitized = "unnamed_file"
    
    return sanitized


def validate_file_size(size: int, max_size: Optional[int] = None) -> bool:
    """
    Validate file size
    
    Args:
        size: File size in bytes
        max_size: Maximum allowed size (defaults to Config.MAX_FILE_SIZE)
    
    Returns:
        True if valid, False otherwise
    """
    from config import Config
    
    if max_size is None:
        max_size = Config.MAX_FILE_SIZE
    
    if size <= 0:
        logger.warning(f"⚠️ Invalid file size: {size}")
        return False
    
    if size > max_size:
        logger.warning(f"⚠️ File too large: {size} bytes (max: {max_size})")
        return False
    
    return True


def validate_file_extension(filename: str, allowed_extensions: Optional[List[str]] = None) -> bool:
    """
    Validate file extension
    
    Args:
        filename: Filename to validate
        allowed_extensions: List of allowed extensions (defaults to Config.ALLOWED_EXTENSIONS)
    
    Returns:
        True if valid, False otherwise
    """
    from config import Config
    
    if allowed_extensions is None:
        allowed_extensions = Config.ALLOWED_EXTENSIONS
    
    file_extension = os.path.splitext(filename)[1].lower()
    
    if file_extension not in allowed_extensions:
        logger.warning(f"⚠️ Invalid file extension: {file_extension}")
        return False
    
    return True


def get_file_type(filename: str) -> str:
    """
    Get file type/extension
    
    Args:
        filename: Filename
    
    Returns:
        File extension (e.g., '.exe')
    """
    return os.path.splitext(filename)[1].lower()


def get_mime_type(filename: str) -> str:
    """
    Get MIME type from filename
    
    Args:
        filename: Filename
    
    Returns:
        MIME type string
    """
    mime_type, _ = mimetypes.guess_type(filename)
    return mime_type or 'application/octet-stream'


# ==================== HASHING ====================

def calculate_file_hash(data: bytes, algorithm: str = 'sha256') -> str:
    """
    Calculate hash of file data
    
    Args:
        data: File bytes
        algorithm: Hash algorithm ('sha256', 'md5', 'sha1')
    
    Returns:
        Hex digest of hash
    """
    if algorithm == 'sha256':
        return hashlib.sha256(data).hexdigest()
    elif algorithm == 'md5':
        return hashlib.md5(data).hexdigest()
    elif algorithm == 'sha1':
        return hashlib.sha1(data).hexdigest()
    else:
        raise ValueError(f"Unsupported hash algorithm: {algorithm}")


def calculate_multiple_hashes(data: bytes) -> Dict[str, str]:
    """
    Calculate multiple hashes for file data
    
    Args:
        data: File bytes
    
    Returns:
        Dictionary with hash algorithm as key and hex digest as value
    """
    return {
        'sha256': hashlib.sha256(data).hexdigest(),
        'md5': hashlib.md5(data).hexdigest(),
        'sha1': hashlib.sha1(data).hexdigest()
    }


# ==================== REQUEST HANDLING ====================

def get_client_ip(request: Request) -> str:
    """
    Extract client IP address from request
    Handles X-Forwarded-For header for proxied requests
    
    Args:
        request: FastAPI Request object
    
    Returns:
        Client IP address
    """
    # Check for X-Forwarded-For header (proxy)
    forwarded_for = request.headers.get('X-Forwarded-For')
    if forwarded_for:
        # Take first IP in chain
        return forwarded_for.split(',')[0].strip()
    
    # Check for X-Real-IP header
    real_ip = request.headers.get('X-Real-IP')
    if real_ip:
        return real_ip.strip()
    
    # Fall back to direct client IP
    return request.client.host if request.client else 'unknown'


def get_user_agent(request: Request) -> str:
    """
    Extract user agent from request
    
    Args:
        request: FastAPI Request object
    
    Returns:
        User agent string
    """
    return request.headers.get('User-Agent', 'unknown')


# ==================== FORMATTING ====================

def format_file_size(size_bytes: int) -> str:
    """
    Format file size in human-readable format
    
    Args:
        size_bytes: Size in bytes
    
    Returns:
        Formatted string (e.g., "1.5 MB")
    """
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} PB"


def format_timestamp(dt: datetime, format_str: str = '%Y-%m-%d %H:%M:%S') -> str:
    """
    Format datetime object to string
    
    Args:
        dt: Datetime object
        format_str: Format string
    
    Returns:
        Formatted datetime string
    """
    if not dt:
        return 'N/A'
    
    if isinstance(dt, str):
        return dt
    
    return dt.strftime(format_str)


def format_confidence(confidence: float) -> str:
    """
    Format confidence score as percentage
    
    Args:
        confidence: Confidence value (0-1)
    
    Returns:
        Formatted percentage string
    """
    return f"{confidence * 100:.2f}%"


def format_duration(seconds: float) -> str:
    """
    Format duration in human-readable format
    
    Args:
        seconds: Duration in seconds
    
    Returns:
        Formatted string (e.g., "2.5s" or "1m 30s")
    """
    if seconds < 60:
        return f"{seconds:.2f}s"
    
    minutes = int(seconds // 60)
    remaining_seconds = seconds % 60
    return f"{minutes}m {remaining_seconds:.0f}s"


# ==================== DATA CONVERSION ====================

def bytes_to_hex(data: bytes, max_length: int = 32) -> str:
    """
    Convert bytes to hex string (limited length)
    
    Args:
        data: Bytes to convert
        max_length: Maximum number of bytes to convert
    
    Returns:
        Hex string
    """
    return data[:max_length].hex()


def safe_json_dumps(obj: Any) -> str:
    """
    Safely convert object to JSON string
    Handles datetime and bytes objects
    
    Args:
        obj: Object to convert
    
    Returns:
        JSON string
    """
    import json
    
    def json_serializer(o):
        if isinstance(o, datetime):
            return o.isoformat()
        elif isinstance(o, bytes):
            return o.hex()
        raise TypeError(f"Object of type {type(o)} is not JSON serializable")
    
    return json.dumps(obj, default=json_serializer)


# ==================== RISK LEVEL ====================

def get_risk_level(confidence: float, prediction: str = None) -> str:
    """
    Determine risk level based on confidence score
    
    Args:
        confidence: Confidence score (0-1)
        prediction: Prediction result ('Safe' or 'Malicious')
    
    Returns:
        Risk level: 'low', 'medium', 'high', or 'critical'
    """
    if prediction == 'Safe':
        return 'low'
    
    if confidence >= 0.9:
        return 'critical'
    elif confidence >= 0.7:
        return 'high'
    elif confidence >= 0.5:
        return 'medium'
    else:
        return 'low'


def get_risk_color(risk_level: str) -> str:
    """
    Get color code for risk level
    
    Args:
        risk_level: Risk level string
    
    Returns:
        Color code (for UI)
    """
    colors = {
        'low': '#22c55e',      # green
        'medium': '#eab308',   # yellow
        'high': '#f97316',     # orange
        'critical': '#ef4444'  # red
    }
    return colors.get(risk_level, '#6b7280')  # gray default


# ==================== PATH HANDLING ====================

def ensure_directory_exists(directory: str) -> bool:
    """
    Ensure directory exists, create if not
    
    Args:
        directory: Directory path
    
    Returns:
        True if successful
    """
    try:
        Path(directory).mkdir(parents=True, exist_ok=True)
        return True
    except Exception as e:
        logger.error(f"Failed to create directory {directory}: {e}")
        return False


def get_temp_filepath(filename: str) -> str:
    """
    Generate temporary file path
    
    Args:
        filename: Original filename
    
    Returns:
        Temporary file path
    """
    from config import Config
    
    ensure_directory_exists(Config.UPLOAD_FOLDER)
    
    # Add timestamp to avoid conflicts
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    safe_name = sanitize_filename(filename)
    name, ext = os.path.splitext(safe_name)
    
    return os.path.join(Config.UPLOAD_FOLDER, f"{name}_{timestamp}{ext}")


def cleanup_temp_files(max_age_hours: int = 24):
    """
    Clean up old temporary files
    
    Args:
        max_age_hours: Maximum age of files to keep (in hours)
    """
    from config import Config
    
    try:
        if not os.path.exists(Config.UPLOAD_FOLDER):
            return
        
        cutoff_time = datetime.now() - timedelta(hours=max_age_hours)
        
        for filename in os.listdir(Config.UPLOAD_FOLDER):
            filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
            
            if os.path.isfile(filepath):
                file_time = datetime.fromtimestamp(os.path.getmtime(filepath))
                
                if file_time < cutoff_time:
                    os.remove(filepath)
                    logger.info(f"🗑️ Cleaned up old temp file: {filename}")
    
    except Exception as e:
        logger.error(f"Failed to cleanup temp files: {e}")


# ==================== STRING UTILITIES ====================

def truncate_string(text: str, max_length: int = 100, suffix: str = '...') -> str:
    """
    Truncate string to maximum length
    
    Args:
        text: String to truncate
        max_length: Maximum length
        suffix: Suffix to add if truncated
    
    Returns:
        Truncated string
    """
    if not text or len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix


def extract_file_info(filename: str, file_size: int) -> Dict[str, Any]:
    """
    Extract comprehensive file information
    
    Args:
        filename: Filename
        file_size: File size in bytes
    
    Returns:
        Dictionary with file information
    """
    return {
        'name': filename,
        'sanitized_name': sanitize_filename(filename),
        'extension': get_file_type(filename),
        'mime_type': get_mime_type(filename),
        'size': file_size,
        'size_formatted': format_file_size(file_size)
    }


# ==================== VALIDATION ====================

def is_valid_hash(hash_string: str, hash_type: str = 'sha256') -> bool:
    """
    Validate hash string format
    
    Args:
        hash_string: Hash string to validate
        hash_type: Hash type ('sha256', 'md5', 'sha1')
    
    Returns:
        True if valid format
    """
    lengths = {
        'sha256': 64,
        'md5': 32,
        'sha1': 40
    }
    
    expected_length = lengths.get(hash_type)
    if not expected_length:
        return False
    
    if len(hash_string) != expected_length:
        return False
    
    # Check if hexadecimal
    try:
        int(hash_string, 16)
        return True
    except ValueError:
        return False


def is_valid_ip(ip_address: str) -> bool:
    """
    Validate IP address format (IPv4 or IPv6)
    
    Args:
        ip_address: IP address string
    
    Returns:
        True if valid
    """
    import ipaddress
    
    try:
        ipaddress.ip_address(ip_address)
        return True
    except ValueError:
        return False


# ==================== PERFORMANCE MONITORING ====================

class PerformanceTimer:
    """Context manager for timing operations"""
    
    def __init__(self, operation_name: str = "Operation"):
        self.operation_name = operation_name
        self.start_time = None
        self.end_time = None
    
    def __enter__(self):
        self.start_time = datetime.now()
        logger.debug(f"⏱️ Started: {self.operation_name}")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end_time = datetime.now()
        duration = (self.end_time - self.start_time).total_seconds()
        logger.debug(f"⏱️ Completed: {self.operation_name} ({duration:.3f}s)")
    
    def elapsed(self) -> float:
        """Get elapsed time in seconds"""
        if self.start_time and self.end_time:
            return (self.end_time - self.start_time).total_seconds()
        return 0.0


# ==================== ERROR HANDLING ====================

def safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    """
    Safely divide two numbers
    
    Args:
        numerator: Numerator
        denominator: Denominator
        default: Default value if division fails
    
    Returns:
        Result or default value
    """
    try:
        if denominator == 0:
            return default
        return numerator / denominator
    except Exception:
        return default


# ==================== LOGGING HELPERS ====================

def log_scan_summary(scan_result: Dict[str, Any]):
    """
    Log scan result summary
    
    Args:
        scan_result: Scan result dictionary
    """
    logger.info(
        f"📊 SCAN SUMMARY | "
        f"File: {scan_result.get('file_name')} | "
        f"Prediction: {scan_result.get('prediction')} | "
        f"Confidence: {format_confidence(scan_result.get('confidence', 0))} | "
        f"Duration: {format_duration(scan_result.get('scan_duration', 0))}"
    )


# ==================== TESTING ====================

if __name__ == "__main__":
    # Test utilities
    print("🧪 Testing Utility Functions\n")
    
    # Test filename sanitization
    print("=== Filename Sanitization ===")
    test_filenames = [
        "normal_file.exe",
        "../../../etc/passwd",
        "file with spaces.dll",
        "file<>:|?.exe",
        "a" * 300 + ".exe"
    ]
    
    for filename in test_filenames:
        sanitized = sanitize_filename(filename)
        print(f"Original:  {filename[:50]}")
        print(f"Sanitized: {sanitized}\n")
    
    # Test file size formatting
    print("=== File Size Formatting ===")
    sizes = [512, 1024, 1048576, 1073741824, 1099511627776]
    for size in sizes:
        print(f"{size} bytes = {format_file_size(size)}")
    
    # Test hash validation
    print("\n=== Hash Validation ===")
    test_hashes = [
        ("a" * 64, "sha256"),
        ("b" * 32, "md5"),
        ("invalid", "sha256"),
        ("c" * 40, "sha1")
    ]
    
    for hash_str, hash_type in test_hashes:
        valid = is_valid_hash(hash_str, hash_type)
        print(f"{hash_type} hash '{hash_str[:20]}...' is {'valid' if valid else 'invalid'}")
    
    # Test risk level
    print("\n=== Risk Level Calculation ===")
    confidences = [0.3, 0.6, 0.8, 0.95]
    for conf in confidences:
        risk = get_risk_level(conf, 'Malicious')
        color = get_risk_color(risk)
        print(f"Confidence {format_confidence(conf)} → Risk: {risk} (Color: {color})")
    
    # Test performance timer
    print("\n=== Performance Timer ===")
    import time
    with PerformanceTimer("Test operation") as timer:
        time.sleep(0.5)
    print(f"Elapsed: {timer.elapsed():.3f}s")
    
    print("\n✅ All utility tests completed!")