// ============================================================
// Ransomware Detection System - MongoDB Schema Setup
// ============================================================
// Description: Creates collections, indexes, and validation rules
//              for MongoDB database
// Usage: mongosh ransomware_db < mongodb_schema.js
// ============================================================

// Switch to database (creates if not exists)
use ransomware_db;

print("🗄️  Setting up Ransomware Detection System MongoDB database...\n");


// ============================================================
// DROP EXISTING COLLECTIONS (Optional - for clean start)
// ============================================================

// Uncomment to drop existing collections
// db.scans.drop();
// db.known_hashes.drop();
// db.alert_logs.drop();
// db.system_stats.drop();
// print("✅ Existing collections dropped\n");


// ============================================================
// COLLECTION: scans
// Main collection for storing scan results
// ============================================================

db.createCollection("scans", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["file_name", "file_hash", "file_type", "file_size", 
                 "prediction", "confidence", "timestamp"],
      properties: {
        file_name: {
          bsonType: "string",
          description: "Original filename - required"
        },
        file_hash: {
          bsonType: "string",
          pattern: "^[a-f0-9]{64}$",
          description: "SHA256 hash (64 characters) - required"
        },
        file_hash_md5: {
          bsonType: "string",
          pattern: "^[a-f0-9]{32}$",
          description: "MD5 hash (32 characters) - optional"
        },
        file_type: {
          bsonType: "string",
          enum: [".exe", ".dll", ".js", ".vbs", ".ps1", ".zip", ".py"],
          description: "File extension - required"
        },
        file_size: {
          bsonType: "int",
          minimum: 0,
          description: "File size in bytes - required"
        },
        prediction: {
          bsonType: "string",
          enum: ["Safe", "Malicious", "Unknown"],
          description: "Prediction result - required"
        },
        confidence: {
          bsonType: "double",
          minimum: 0.0,
          maximum: 1.0,
          description: "Confidence score (0.0 - 1.0) - required"
        },
        risk_level: {
          bsonType: "string",
          enum: ["low", "medium", "high", "critical"],
          description: "Risk level - optional"
        },
        detection_method: {
          bsonType: "string",
          enum: ["hash_signature", "machine_learning", "rule_based"],
          description: "Detection method used - optional"
        },
        scan_duration: {
          bsonType: "double",
          minimum: 0,
          description: "Scan duration in seconds - optional"
        },
        client_ip: {
          bsonType: "string",
          description: "Client IP address - optional"
        },
        detection_details: {
          bsonType: "object",
          description: "Full detection analysis results - optional"
        },
        alert_sent: {
          bsonType: "bool",
          description: "Whether alert was sent - optional"
        },
        alert_timestamp: {
          bsonType: "string",
          description: "When alert was sent (ISO format) - optional"
        },
        timestamp: {
          bsonType: "string",
          description: "Scan timestamp (ISO format) - required"
        },
        updated_at: {
          bsonType: "string",
          description: "Last update timestamp (ISO format) - optional"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "error"
});

print("✅ Collection 'scans' created with validation rules");


// Create indexes for scans collection
db.scans.createIndex(
  { "file_hash": 1 }, 
  { unique: true, name: "idx_file_hash" }
);
print("  📊 Index created: file_hash (unique)");

db.scans.createIndex(
  { "timestamp": -1 }, 
  { name: "idx_timestamp" }
);
print("  📊 Index created: timestamp (descending)");

db.scans.createIndex(
  { "prediction": 1 }, 
  { name: "idx_prediction" }
);
print("  📊 Index created: prediction");

db.scans.createIndex(
  { "file_name": 1 }, 
  { name: "idx_file_name" }
);
print("  📊 Index created: file_name");

db.scans.createIndex(
  { "client_ip": 1 }, 
  { name: "idx_client_ip" }
);
print("  📊 Index created: client_ip");

// Compound indexes for complex queries
db.scans.createIndex(
  { "prediction": 1, "timestamp": -1 }, 
  { name: "idx_prediction_timestamp" }
);
print("  📊 Compound index created: prediction + timestamp");

db.scans.createIndex(
  { "risk_level": 1, "confidence": -1 }, 
  { name: "idx_risk_confidence" }
);
print("  📊 Compound index created: risk_level + confidence");

db.scans.createIndex(
  { "file_type": 1, "prediction": 1 }, 
  { name: "idx_filetype_prediction" }
);
print("  📊 Compound index created: file_type + prediction");

// Text index for full-text search on file_name
db.scans.createIndex(
  { "file_name": "text" }, 
  { name: "idx_filename_text" }
);
print("  📊 Text index created: file_name (full-text search)\n");


// ============================================================
// COLLECTION: known_hashes
// Database of known ransomware hash signatures
// ============================================================

db.createCollection("known_hashes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["hash_value", "hash_type"],
      properties: {
        hash_value: {
          bsonType: "string",
          pattern: "^[a-f0-9]{32,64}$",
          description: "Hash value (MD5/SHA1/SHA256) - required"
        },
        hash_type: {
          bsonType: "string",
          enum: ["SHA256", "MD5", "SHA1"],
          description: "Hash algorithm type - required"
        },
        ransomware_family: {
          bsonType: "string",
          description: "Ransomware family name - optional"
        },
        description: {
          bsonType: "string",
          description: "Description of the ransomware - optional"
        },
        severity: {
          bsonType: "string",
          enum: ["low", "medium", "high", "critical"],
          description: "Threat severity level - optional"
        },
        source: {
          bsonType: "string",
          description: "Source of the hash - optional"
        },
        added_date: {
          bsonType: "string",
          description: "When hash was added (ISO format) - optional"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "error"
});

print("✅ Collection 'known_hashes' created with validation rules");

// Create indexes for known_hashes collection
db.known_hashes.createIndex(
  { "hash_value": 1 }, 
  { unique: true, name: "idx_hash_value" }
);
print("  📊 Index created: hash_value (unique)");

db.known_hashes.createIndex(
  { "ransomware_family": 1 }, 
  { name: "idx_ransomware_family" }
);
print("  📊 Index created: ransomware_family");

db.known_hashes.createIndex(
  { "added_date": -1 }, 
  { name: "idx_added_date" }
);
print("  📊 Index created: added_date\n");


// ============================================================
// COLLECTION: alert_logs
// Audit trail for all alerts sent
// ============================================================

db.createCollection("alert_logs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["scan_id", "alert_type", "alert_status", "timestamp"],
      properties: {
        scan_id: {
          bsonType: "string",
          description: "Reference to scan ObjectId - required"
        },
        alert_type: {
          bsonType: "string",
          enum: ["webhook", "email", "sms", "slack"],
          description: "Type of alert - required"
        },
        alert_status: {
          bsonType: "string",
          enum: ["sent", "failed", "pending"],
          description: "Alert status - required"
        },
        recipient: {
          bsonType: "string",
          description: "Alert recipient - optional"
        },
        error_message: {
          bsonType: "string",
          description: "Error message if alert failed - optional"
        },
        timestamp: {
          bsonType: "string",
          description: "When alert was sent (ISO format) - required"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "error"
});

print("✅ Collection 'alert_logs' created with validation rules");

// Create indexes for alert_logs collection
db.alert_logs.createIndex(
  { "scan_id": 1 }, 
  { name: "idx_scan_id" }
);
print("  📊 Index created: scan_id");

db.alert_logs.createIndex(
  { "timestamp": -1 }, 
  { name: "idx_timestamp" }
);
print("  📊 Index created: timestamp");

db.alert_logs.createIndex(
  { "alert_status": 1 }, 
  { name: "idx_alert_status" }
);
print("  📊 Index created: alert_status\n");


// ============================================================
// COLLECTION: system_stats
// Daily system statistics and metrics
// ============================================================

db.createCollection("system_stats", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["date"],
      properties: {
        date: {
          bsonType: "string",
          description: "Statistics date (YYYY-MM-DD) - required"
        },
        total_scans: {
          bsonType: "int",
          minimum: 0,
          description: "Total number of scans - optional"
        },
        malicious_count: {
          bsonType: "int",
          minimum: 0,
          description: "Number of malicious detections - optional"
        },
        safe_count: {
          bsonType: "int",
          minimum: 0,
          description: "Number of safe detections - optional"
        },
        average_scan_time: {
          bsonType: "double",
          minimum: 0,
          description: "Average scan duration in seconds - optional"
        },
        detection_rate: {
          bsonType: "double",
          minimum: 0.0,
          maximum: 1.0,
          description: "Detection rate (malicious / total) - optional"
        },
        updated_at: {
          bsonType: "string",
          description: "Last update timestamp (ISO format) - optional"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "error"
});

print("✅ Collection 'system_stats' created with validation rules");

// Create indexes for system_stats collection
db.system_stats.createIndex(
  { "date": -1 }, 
  { unique: true, name: "idx_date" }
);
print("  📊 Index created: date (unique, descending)\n");


// ============================================================
// INSERT SAMPLE DATA
// ============================================================

print("📝 Inserting sample data...\n");

// Sample known ransomware hashes
db.known_hashes.insertMany([
  {
    hash_value: "ed01ebfbc9eb5bbea545af4d01bf5f1071661840480439c6e5babe8e080e41aa",
    hash_type: "SHA256",
    ransomware_family: "WannaCry",
    description: "WannaCry ransomware variant - uses EternalBlue exploit",
    severity: "critical",
    source: "VirusTotal",
    added_date: new Date().toISOString()
  },
  {
    hash_value: "7c27e6b6ca3d0fbe9fc3b2d3e9f8e4a5d1c9b8e7f6a5d4c3b2a1f0e9d8c7b6a5",
    hash_type: "SHA256",
    ransomware_family: "Locky",
    description: "Locky ransomware - encrypts user files",
    severity: "high",
    source: "MalwareBazaar",
    added_date: new Date().toISOString()
  },
  {
    hash_value: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8",
    hash_type: "SHA256",
    ransomware_family: "Ryuk",
    description: "Ryuk ransomware - targets enterprise networks",
    severity: "critical",
    source: "ThreatConnect",
    added_date: new Date().toISOString()
  }
]);

print("✅ Inserted 3 known ransomware hashes");

// Sample scan results
const now = new Date();
const oneHourAgo = new Date(now.getTime() - 3600000);
const twoHoursAgo = new Date(now.getTime() - 7200000);
const threeHoursAgo = new Date(now.getTime() - 10800000);

db.scans.insertMany([
  // Safe scan
  {
    file_name: "notepad.exe",
    file_hash: "c4ca4238a0b923820dcc509a6f75849bc6d9e8a8e9f6f7b9d8c7a6e5f4d3c2b1",
    file_hash_md5: "e4d909c290d0fb1ca068ffaddf22cbd0",
    file_type: ".exe",
    file_size: 245760,
    prediction: "Safe",
    confidence: 0.98,
    risk_level: "low",
    detection_method: "machine_learning",
    scan_duration: 2.145,
    client_ip: "192.168.1.100",
    detection_details: {
      entropy: 5.2,
      suspicious_strings: [],
      pe_analysis: {
        num_sections: 4,
        high_entropy_sections: 0
      }
    },
    alert_sent: false,
    timestamp: oneHourAgo.toISOString(),
    updated_at: oneHourAgo.toISOString()
  },
  // Malicious scan - WannaCry detected
  {
    file_name: "wcry.exe",
    file_hash: "ed01ebfbc9eb5bbea545af4d01bf5f1071661840480439c6e5babe8e080e41aa",
    file_hash_md5: "84c82835a5d21bbcf75a61706d8ab549",
    file_type: ".exe",
    file_size: 3723264,
    prediction: "Malicious",
    confidence: 1.00,
    risk_level: "critical",
    detection_method: "hash_signature",
    scan_duration: 0.156,
    client_ip: "203.0.113.45",
    detection_details: {
      entropy: 7.9,
      hash_match: true,
      ransomware_family: "WannaCry",
      suspicious_strings: ["encrypt", "bitcoin", "ransom"]
    },
    alert_sent: true,
    alert_timestamp: twoHoursAgo.toISOString(),
    timestamp: twoHoursAgo.toISOString(),
    updated_at: twoHoursAgo.toISOString()
  },
  // Malicious scan - high entropy
  {
    file_name: "invoice_2024.exe",
    file_hash: "f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9",
    file_hash_md5: "d3d9446802a44259755d38e6d163e820",
    file_type: ".exe",
    file_size: 856032,
    prediction: "Malicious",
    confidence: 0.94,
    risk_level: "critical",
    detection_method: "machine_learning",
    scan_duration: 2.876,
    client_ip: "198.51.100.23",
    detection_details: {
      entropy: 7.8,
      suspicious_strings: ["encrypt", "decrypt", "AES", "ransom"],
      pe_analysis: {
        num_sections: 6,
        high_entropy_sections: 4,
        packed_sections: 2
      }
    },
    alert_sent: true,
    alert_timestamp: threeHoursAgo.toISOString(),
    timestamp: threeHoursAgo.toISOString(),
    updated_at: threeHoursAgo.toISOString()
  }
]);

print("✅ Inserted 3 sample scans (1 safe, 2 malicious)");

// Sample alert logs
const scan2 = db.scans.findOne({ file_name: "wcry.exe" });
const scan3 = db.scans.findOne({ file_name: "invoice_2024.exe" });

db.alert_logs.insertMany([
  {
    scan_id: scan2._id.toString(),
    alert_type: "webhook",
    alert_status: "sent",
    recipient: "https://hooks.example.com/alerts",
    timestamp: twoHoursAgo.toISOString()
  },
  {
    scan_id: scan2._id.toString(),
    alert_type: "email",
    alert_status: "sent",
    recipient: "security@company.com",
    timestamp: twoHoursAgo.toISOString()
  },
  {
    scan_id: scan3._id.toString(),
    alert_type: "webhook",
    alert_status: "sent",
    recipient: "https://hooks.example.com/alerts",
    timestamp: threeHoursAgo.toISOString()
  }
]);

print("✅ Inserted 3 alert logs");

// Sample system statistics
const today = new Date().toISOString().split('T')[0];
db.system_stats.insertOne({
  date: today,
  total_scans: 3,
  malicious_count: 2,
  safe_count: 1,
  average_scan_time: 1.726,
  detection_rate: 0.6667,
  updated_at: now.toISOString()
});

print("✅ Inserted system statistics\n");


// ============================================================
// VERIFICATION QUERIES
// ============================================================

print("📊 Verification Results:\n");

// Count documents in each collection
print("Collection counts:");
print("  scans: " + db.scans.countDocuments());
print("  known_hashes: " + db.known_hashes.countDocuments());
print("  alert_logs: " + db.alert_logs.countDocuments());
print("  system_stats: " + db.system_stats.countDocuments());
print("");

// Show sample scans
print("Sample scans:");
db.scans.find({}, { file_name: 1, prediction: 1, confidence: 1, timestamp: 1 })
  .sort({ timestamp: -1 })
  .forEach(scan => {
    print("  - " + scan.file_name + " | " + scan.prediction + 
          " (" + (scan.confidence * 100).toFixed(1) + "%)");
  });
print("");

// Show indexes
print("Indexes on 'scans' collection:");
db.scans.getIndexes().forEach(index => {
  print("  - " + index.name + ": " + JSON.stringify(index.key));
});
print("");


// ============================================================
// UTILITY FUNCTIONS (for use in mongosh)
// ============================================================

print("💡 Useful MongoDB Commands:\n");
print("// Get all malicious scans:");
print("db.scans.find({ prediction: 'Malicious' }).sort({ timestamp: -1 });\n");

print("// Get scan statistics:");
print("db.scans.aggregate([");
print("  { $group: { _id: '$prediction', count: { $sum: 1 }, avg_confidence: { $avg: '$confidence' } } }");
print("]);\n");

print("// Search by filename:");
print("db.scans.find({ $text: { $search: 'wcry' } });\n");

print("// Get recent scans (last 24 hours):");
print("db.scans.find({ timestamp: { $gte: new Date(Date.now() - 86400000).toISOString() } });\n");

print("// Drop database (CAUTION!):");
print("// db.dropDatabase();\n");


// ============================================================
// SUCCESS MESSAGE
// ============================================================

print("\n" + "=".repeat(60));
print("✅ MongoDB schema setup completed successfully!");
print("=".repeat(60));
print("Database: " + db.getName());
print("Collections created: 4");
print("Indexes created: 15+");
print("Sample data inserted: Yes");
print("Validation rules: Active");
print("=".repeat(60) + "\n");

// End of mongodb_schema.js