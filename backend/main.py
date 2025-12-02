"""
Ransomware Detection System - Main FastAPI Application
Handles file uploads, scanning, and API routing
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import hashlib
import time
from datetime import datetime
from typing import Optional
import logging

# Import custom modules (will be created next)
from detection_engine import RansomwareDetector
from database import Database
from config import Config
from utils import sanitize_filename, validate_file_size, get_client_ip

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ransomware_detector.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Ransomware Detection System",
    description="AI-powered ransomware detection API",
    version="1.0.0"
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
db = Database()
detector = RansomwareDetector()

# Track recent alerts to prevent duplicates (hash -> timestamp)
recent_alerts = {}
ALERT_COOLDOWN = 3600  # 1 hour cooldown


@app.on_event("startup")
async def startup_event():
    """Initialize database and load ML model on startup"""
    try:
        db.connect()
        detector.load_model()
        logger.info("✅ Application started successfully")
    except Exception as e:
        logger.error(f"❌ Startup failed: {str(e)}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown"""
    db.disconnect()
    logger.info("🛑 Application shutdown")


@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "message": "Ransomware Detection System API",
        "version": "1.0.0",
        "endpoints": {
            "scan": "POST /api/scan",
            "scans": "GET /api/scans",
            "scan_detail": "GET /api/scan/{scan_id}",
            "health": "GET /api/health"
        }
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        db_status = db.check_connection()
        model_status = detector.model is not None
        
        return {
            "status": "healthy" if (db_status and model_status) else "degraded",
            "database": "connected" if db_status else "disconnected",
            "ml_model": "loaded" if model_status else "not loaded",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "error": str(e)}
        )


@app.post("/api/scan")
async def scan_file(request: Request, file: UploadFile = File(...)):
    """
    Scan uploaded file for ransomware
    
    Args:
        file: Uploaded file (multipart/form-data)
    
    Returns:
        JSON with scan results including prediction and confidence
    """
    start_time = time.time()
    client_ip = get_client_ip(request)
    
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        # Sanitize filename
        safe_filename = sanitize_filename(file.filename)
        logger.info(f"📁 Scanning file: {safe_filename} from IP: {client_ip}")
        
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Validate file size (max 100 MB)
        if not validate_file_size(file_size):
            raise HTTPException(
                status_code=413,
                detail="File too large. Maximum size is 100 MB"
            )
        
        # Calculate file hash
        file_hash_sha256 = hashlib.sha256(file_content).hexdigest()
        file_hash_md5 = hashlib.md5(file_content).hexdigest()
        
        # Get file extension
        file_extension = os.path.splitext(safe_filename)[1].lower()
        
        # Validate file type
        allowed_extensions = ['.exe', '.dll', '.js', '.vbs', '.ps1', '.zip', '.py']
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Perform ransomware detection
        detection_result = detector.analyze_file(
            file_content=file_content,
            filename=safe_filename,
            file_hash=file_hash_sha256
        )
        
        # Calculate scan duration
        scan_duration = round(time.time() - start_time, 3)
        
        # Prepare scan record
        scan_record = {
            "file_name": safe_filename,
            "file_hash": file_hash_sha256,
            "file_hash_md5": file_hash_md5,
            "file_type": file_extension,
            "file_size": file_size,
            "prediction": detection_result["prediction"],
            "confidence": detection_result["confidence"],
            "scan_duration": scan_duration,
            "client_ip": client_ip,
            "detection_details": detection_result.get("details", {}),
            "timestamp": datetime.utcnow()
        }
        
        # Save to database
        scan_id = db.save_scan(scan_record)
        scan_record["scan_id"] = scan_id
        
        # Trigger alerts if malicious
        if detection_result["prediction"] == "Malicious" or detection_result["confidence"] > 0.8:
            await trigger_alert(scan_record)
        
        logger.info(
            f"✅ Scan completed: {safe_filename} | "
            f"Result: {detection_result['prediction']} | "
            f"Confidence: {detection_result['confidence']:.2%} | "
            f"Duration: {scan_duration}s"
        )
        
        # Return response
        return {
            "success": True,
            "scan_id": scan_id,
            "file_name": safe_filename,
            "file_hash": file_hash_sha256,
            "file_size": file_size,
            "prediction": detection_result["prediction"],
            "confidence": detection_result["confidence"],
            "risk_level": get_risk_level(detection_result["confidence"]),
            "scan_duration": scan_duration,
            "details": detection_result.get("details", {}),
            "timestamp": scan_record["timestamp"].isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Scan failed for {file.filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")


@app.get("/api/scans")
async def get_all_scans(limit: int = 100, offset: int = 0):
    """
    Retrieve all past scan results
    
    Args:
        limit: Maximum number of results (default 100)
        offset: Offset for pagination (default 0)
    
    Returns:
        JSON array of scan results
    """
    try:
        scans = db.get_all_scans(limit=limit, offset=offset)
        total_scans = db.get_scan_count()
        
        return {
            "success": True,
            "total": total_scans,
            "limit": limit,
            "offset": offset,
            "scans": scans
        }
    except Exception as e:
        logger.error(f"Failed to retrieve scans: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve scans: {str(e)}")


@app.get("/api/scan/{scan_id}")
async def get_scan_detail(scan_id: int):
    """
    Retrieve details of a specific scan
    
    Args:
        scan_id: ID of the scan to retrieve
    
    Returns:
        JSON with detailed scan information
    """
    try:
        scan = db.get_scan_by_id(scan_id)
        
        if not scan:
            raise HTTPException(status_code=404, detail="Scan not found")
        
        return {
            "success": True,
            "scan": scan
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve scan {scan_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve scan: {str(e)}")


async def trigger_alert(scan_record: dict):
    """
    Trigger alerts for malicious files
    
    Args:
        scan_record: Dictionary containing scan information
    """
    file_hash = scan_record["file_hash"]
    current_time = time.time()
    
    # Check cooldown to prevent duplicate alerts
    if file_hash in recent_alerts:
        last_alert_time = recent_alerts[file_hash]
        if current_time - last_alert_time < ALERT_COOLDOWN:
            logger.info(f"⏳ Alert cooldown active for hash: {file_hash}")
            return
    
    # Update alert timestamp
    recent_alerts[file_hash] = current_time
    
    try:
        # Webhook alert
        if Config.WEBHOOK_URL:
            await send_webhook_alert(scan_record)
        
        # Email alert
        if Config.SMTP_ENABLED:
            await send_email_alert(scan_record)
        
        logger.warning(
            f"🚨 ALERT: Malicious file detected! "
            f"File: {scan_record['file_name']} | "
            f"Hash: {file_hash} | "
            f"Confidence: {scan_record['confidence']:.2%}"
        )
    except Exception as e:
        logger.error(f"Failed to send alert: {str(e)}")


async def send_webhook_alert(scan_record: dict):
    """Send alert to configured webhook URL"""
    import httpx
    
    alert_payload = {
        "alert_type": "ransomware_detected",
        "severity": "critical",
        "file_name": scan_record["file_name"],
        "file_hash": scan_record["file_hash"],
        "confidence": scan_record["confidence"],
        "timestamp": scan_record["timestamp"].isoformat()
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(Config.WEBHOOK_URL, json=alert_payload, timeout=5.0)
        logger.info(f"📤 Webhook alert sent: {response.status_code}")


async def send_email_alert(scan_record: dict):
    """Send email alert to administrator"""
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    
    msg = MIMEMultipart()
    msg['From'] = Config.SMTP_FROM
    msg['To'] = Config.SMTP_TO
    msg['Subject'] = f"🚨 Ransomware Detected: {scan_record['file_name']}"
    
    body = f"""
    RANSOMWARE DETECTION ALERT
    
    A potentially malicious file has been detected:
    
    File Name: {scan_record['file_name']}
    File Hash: {scan_record['file_hash']}
    Confidence: {scan_record['confidence']:.2%}
    Detection Time: {scan_record['timestamp']}
    Client IP: {scan_record.get('client_ip', 'Unknown')}
    
    Please review and take appropriate action.
    """
    
    msg.attach(MIMEText(body, 'plain'))
    
    with smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT) as server:
        server.starttls()
        server.login(Config.SMTP_USERNAME, Config.SMTP_PASSWORD)
        server.send_message(msg)
    
    logger.info(f"📧 Email alert sent to {Config.SMTP_TO}")


def get_risk_level(confidence: float) -> str:
    """Determine risk level based on confidence score"""
    if confidence >= 0.9:
        return "critical"
    elif confidence >= 0.7:
        return "high"
    elif confidence >= 0.5:
        return "medium"
    else:
        return "low"


if __name__ == "__main__":
    # Run the application
    uvicorn.run(
        "main:app",
        host=Config.HOST,
        port=Config.PORT,
        reload=Config.DEBUG
    )