"""
Ransomware Detection Engine
Implements multi-layered detection: static analysis, entropy, PE inspection, 
string analysis, hash matching, and ML classification
"""

import os
import re
import math
import hashlib
import zipfile
import io
import logging
from typing import Dict, List, Tuple, Optional
from collections import Counter

# ML libraries
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression

# PE file analysis
try:
    import pefile
    PE_AVAILABLE = True
except ImportError:
    PE_AVAILABLE = False
    logging.warning("pefile not available - PE analysis disabled")

from config import Config

logger = logging.getLogger(__name__)


class RansomwareDetector:
    """
    Multi-layered ransomware detection engine combining:
    - Hash signature matching
    - Entropy analysis
    - PE file inspection
    - String analysis
    - Machine Learning classification
    """
    
    def __init__(self):
        self.model = None
        self.known_ransomware_hashes = set()
        self.feature_names = []
        self._load_known_hashes()
    
    def _load_known_hashes(self):
        """Load known ransomware hash signatures"""
        try:
            if os.path.exists(Config.KNOWN_RANSOMWARE_HASHES_PATH):
                with open(Config.KNOWN_RANSOMWARE_HASHES_PATH, 'r') as f:
                    self.known_ransomware_hashes = set(
                        line.strip().lower() for line in f if line.strip()
                    )
                logger.info(f"✅ Loaded {len(self.known_ransomware_hashes)} known ransomware hashes")
            else:
                logger.warning(f"⚠️ Known hashes file not found: {Config.KNOWN_RANSOMWARE_HASHES_PATH}")
                # Create empty file
                os.makedirs(os.path.dirname(Config.KNOWN_RANSOMWARE_HASHES_PATH), exist_ok=True)
                with open(Config.KNOWN_RANSOMWARE_HASHES_PATH, 'w') as f:
                    f.write("# Add known ransomware SHA256 hashes here (one per line)\n")
        except Exception as e:
            logger.error(f"Failed to load known hashes: {e}")
    
    def load_model(self):
        """Load pre-trained ML model"""
        try:
            if os.path.exists(Config.MODEL_PATH):
                model_data = joblib.load(Config.MODEL_PATH)
                self.model = model_data['model']
                self.feature_names = model_data.get('feature_names', [])
                logger.info(f"✅ ML model loaded: {Config.MODEL_PATH}")
            else:
                logger.warning(f"⚠️ Model not found: {Config.MODEL_PATH}")
                logger.info("🔨 Creating and training default model...")
                self._create_default_model()
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            logger.info("🔨 Creating default model...")
            self._create_default_model()
    
    def _create_default_model(self):
        """Create a default trained model with synthetic data"""
        logger.info("Creating default RandomForest model with synthetic training data...")
        
        # Feature names
        self.feature_names = [
            'file_size', 'entropy', 'high_entropy_sections', 
            'suspicious_strings_count', 'suspicious_imports_count',
            'packed_sections', 'has_suspicious_section_names',
            'num_sections', 'entry_point_entropy', 'code_section_entropy'
        ]
        
        # Generate synthetic training data
        # Malicious samples (class 1)
        X_malicious = np.array([
            [500000, 7.8, 3, 15, 8, 2, 1, 6, 7.5, 7.9],
            [750000, 7.9, 4, 20, 10, 3, 1, 7, 7.8, 7.7],
            [1000000, 7.7, 2, 18, 12, 2, 1, 5, 7.6, 7.8],
            [600000, 7.9, 5, 22, 9, 4, 1, 8, 7.9, 7.9],
            [800000, 7.8, 3, 16, 11, 2, 1, 6, 7.7, 7.8],
        ])
        
        # Safe samples (class 0)
        X_safe = np.array([
            [200000, 5.5, 0, 3, 2, 0, 0, 4, 5.2, 5.8],
            [350000, 6.0, 1, 5, 3, 0, 0, 5, 5.8, 6.1],
            [450000, 5.8, 0, 4, 1, 0, 0, 4, 5.5, 5.9],
            [300000, 5.7, 1, 2, 4, 0, 0, 5, 5.6, 6.0],
            [400000, 5.9, 0, 6, 3, 0, 0, 4, 5.7, 5.8],
        ])
        
        # Combine data
        X = np.vstack([X_malicious, X_safe])
        y = np.array([1, 1, 1, 1, 1, 0, 0, 0, 0, 0])
        
        # Train model
        if Config.MODEL_TYPE == 'logistic_regression':
            self.model = LogisticRegression(random_state=42, max_iter=1000)
        else:
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            )
        
        self.model.fit(X, y)
        
        # Save model
        os.makedirs(os.path.dirname(Config.MODEL_PATH), exist_ok=True)
        joblib.dump({
            'model': self.model,
            'feature_names': self.feature_names
        }, Config.MODEL_PATH)
        
        logger.info(f"✅ Default model created and saved to {Config.MODEL_PATH}")
    
    def analyze_file(self, file_content: bytes, filename: str, file_hash: str) -> Dict:
        """
        Main analysis function - orchestrates all detection methods
        
        Args:
            file_content: Raw file bytes
            filename: Original filename
            file_hash: SHA256 hash of file
        
        Returns:
            Dictionary with prediction, confidence, and detailed results
        """
        logger.info(f"🔍 Analyzing file: {filename} ({len(file_content)} bytes)")
        
        detection_details = {
            'hash_match': False,
            'entropy_score': 0.0,
            'suspicious_strings': [],
            'pe_analysis': {},
            'archive_analysis': {},
            'ml_prediction': 'Unknown',
            'ml_confidence': 0.0
        }
        
        # 1. Hash signature matching (fastest check)
        hash_match = self._check_hash_signature(file_hash)
        detection_details['hash_match'] = hash_match
        
        if hash_match:
            logger.warning(f"🚨 HASH MATCH: Known ransomware detected!")
            return {
                'prediction': 'Malicious',
                'confidence': 1.0,
                'method': 'hash_signature',
                'details': detection_details
            }
        
        # 2. Entropy analysis
        entropy = self._calculate_entropy(file_content)
        detection_details['entropy_score'] = entropy
        
        # 3. String analysis
        suspicious_strings = self._extract_suspicious_strings(file_content)
        detection_details['suspicious_strings'] = suspicious_strings
        
        # 4. PE file analysis (if applicable)
        pe_info = {}
        if filename.lower().endswith(('.exe', '.dll')) and PE_AVAILABLE:
            pe_info = self._analyze_pe_file(file_content)
            detection_details['pe_analysis'] = pe_info
        
        # 5. Archive analysis (if zip file)
        if filename.lower().endswith('.zip'):
            archive_info = self._analyze_archive(file_content)
            detection_details['archive_analysis'] = archive_info
        
        # 6. Extract features for ML model
        features = self._extract_features(
            file_content, 
            entropy, 
            suspicious_strings, 
            pe_info
        )
        
        # 7. ML prediction
        if self.model is not None:
            try:
                prediction_proba = self.model.predict_proba([features])[0]
                malicious_probability = prediction_proba[1]
                
                prediction = 'Malicious' if malicious_probability >= Config.MALICIOUS_THRESHOLD else 'Safe'
                
                detection_details['ml_prediction'] = prediction
                detection_details['ml_confidence'] = malicious_probability
                
                logger.info(
                    f"📊 ML Prediction: {prediction} "
                    f"(confidence: {malicious_probability:.2%})"
                )
                
                return {
                    'prediction': prediction,
                    'confidence': float(malicious_probability),
                    'method': 'machine_learning',
                    'details': detection_details
                }
            except Exception as e:
                logger.error(f"ML prediction failed: {e}")
        
        # Fallback: rule-based detection
        rule_based_result = self._rule_based_detection(
            entropy, 
            suspicious_strings, 
            pe_info
        )
        
        detection_details['ml_prediction'] = rule_based_result['prediction']
        detection_details['ml_confidence'] = rule_based_result['confidence']
        
        return {
            'prediction': rule_based_result['prediction'],
            'confidence': rule_based_result['confidence'],
            'method': 'rule_based',
            'details': detection_details
        }
    
    def _check_hash_signature(self, file_hash: str) -> bool:
        """Check if file hash matches known ransomware"""
        return file_hash.lower() in self.known_ransomware_hashes
    
    def _calculate_entropy(self, data: bytes) -> float:
        """
        Calculate Shannon entropy of data
        High entropy (> 7.0) often indicates encryption/packing
        """
        if not data:
            return 0.0
        
        # Count byte frequencies
        byte_counts = Counter(data)
        total_bytes = len(data)
        
        # Calculate Shannon entropy
        entropy = 0.0
        for count in byte_counts.values():
            probability = count / total_bytes
            entropy -= probability * math.log2(probability)
        
        return entropy
    
    def _extract_suspicious_strings(self, data: bytes) -> List[str]:
        """Extract suspicious strings from file content"""
        try:
            # Decode as ASCII/UTF-8, ignore errors
            text = data.decode('utf-8', errors='ignore').lower()
            
            found_strings = []
            for suspicious_string in Config.SUSPICIOUS_STRINGS:
                if suspicious_string.lower() in text:
                    found_strings.append(suspicious_string)
            
            return found_strings
        except Exception as e:
            logger.error(f"String extraction failed: {e}")
            return []
    
    def _analyze_pe_file(self, file_content: bytes) -> Dict:
        """
        Analyze PE (Portable Executable) files
        Extract headers, sections, imports, and detect anomalies
        """
        if not PE_AVAILABLE:
            return {}
        
        try:
            pe = pefile.PE(data=file_content, fast_load=True)
            pe.parse_data_directories()
            
            # Extract sections
            sections = []
            high_entropy_sections = 0
            packed_sections = 0
            suspicious_section_names = False
            
            for section in pe.sections:
                section_name = section.Name.decode('utf-8', errors='ignore').strip('\x00')
                section_entropy = section.get_entropy()
                
                sections.append({
                    'name': section_name,
                    'virtual_size': section.Misc_VirtualSize,
                    'raw_size': section.SizeOfRawData,
                    'entropy': section_entropy
                })
                
                # Check for high entropy
                if section_entropy > Config.SECTION_ENTROPY_THRESHOLD:
                    high_entropy_sections += 1
                
                # Check for packed sections
                if section_entropy > 7.2:
                    packed_sections += 1
                
                # Check for suspicious section names
                if any(susp in section_name.lower() for susp in Config.SUSPICIOUS_SECTIONS):
                    suspicious_section_names = True
            
            # Extract imports
            suspicious_imports = []
            imports_count = 0
            
            if hasattr(pe, 'DIRECTORY_ENTRY_IMPORT'):
                for entry in pe.DIRECTORY_ENTRY_IMPORT:
                    dll_name = entry.dll.decode('utf-8', errors='ignore')
                    for imp in entry.imports:
                        if imp.name:
                            import_name = imp.name.decode('utf-8', errors='ignore')
                            imports_count += 1
                            
                            # Check for suspicious imports
                            suspicious_api = [
                                'CreateFile', 'WriteFile', 'CryptEncrypt',
                                'CryptDecrypt', 'CreateProcess', 'VirtualAlloc',
                                'WinExec', 'ShellExecute', 'URLDownloadToFile'
                            ]
                            if any(api in import_name for api in suspicious_api):
                                suspicious_imports.append(f"{dll_name}:{import_name}")
            
            # Calculate entry point entropy
            entry_point = pe.OPTIONAL_HEADER.AddressOfEntryPoint
            entry_data = pe.get_data(entry_point, min(1024, len(file_content)))
            entry_point_entropy = self._calculate_entropy(entry_data)
            
            pe_info = {
                'num_sections': len(sections),
                'sections': sections,
                'high_entropy_sections': high_entropy_sections,
                'packed_sections': packed_sections,
                'suspicious_section_names': suspicious_section_names,
                'imports_count': imports_count,
                'suspicious_imports': suspicious_imports,
                'suspicious_imports_count': len(suspicious_imports),
                'entry_point_entropy': entry_point_entropy,
                'timestamp': pe.FILE_HEADER.TimeDateStamp,
                'machine': pe.FILE_HEADER.Machine
            }
            
            pe.close()
            return pe_info
            
        except Exception as e:
            logger.error(f"PE analysis failed: {e}")
            return {}
    
    def _analyze_archive(self, file_content: bytes) -> Dict:
        """
        Analyze ZIP archives for suspicious content
        Detect zip bombs and nested archives
        """
        try:
            archive_info = {
                'is_zip_bomb': False,
                'file_count': 0,
                'total_uncompressed_size': 0,
                'compression_ratio': 0.0,
                'nested_archives': 0,
                'suspicious_files': []
            }
            
            with zipfile.ZipFile(io.BytesIO(file_content)) as zf:
                file_list = zf.namelist()
                archive_info['file_count'] = len(file_list)
                
                # Check for too many files
                if len(file_list) > Config.MAX_ARCHIVE_FILES:
                    archive_info['suspicious_files'].append(
                        f"Too many files: {len(file_list)}"
                    )
                
                total_compressed = 0
                total_uncompressed = 0
                
                for file_info in zf.filelist:
                    total_compressed += file_info.compress_size
                    total_uncompressed += file_info.file_size
                    
                    # Check for nested archives
                    if file_info.filename.lower().endswith(('.zip', '.rar', '.7z')):
                        archive_info['nested_archives'] += 1
                    
                    # Check for suspicious extensions
                    if file_info.filename.lower().endswith(('.exe', '.dll', '.bat', '.vbs', '.ps1')):
                        archive_info['suspicious_files'].append(file_info.filename)
                
                archive_info['total_uncompressed_size'] = total_uncompressed
                
                # Calculate compression ratio
                if total_compressed > 0:
                    compression_ratio = total_uncompressed / total_compressed
                    archive_info['compression_ratio'] = compression_ratio
                    
                    # Detect zip bomb (high compression ratio)
                    if compression_ratio > 100:
                        archive_info['is_zip_bomb'] = True
                        logger.warning(f"🚨 Potential zip bomb detected! Ratio: {compression_ratio:.2f}")
                
                # Check total uncompressed size
                if total_uncompressed > Config.MAX_UNCOMPRESSED_SIZE:
                    archive_info['is_zip_bomb'] = True
            
            return archive_info
            
        except Exception as e:
            logger.error(f"Archive analysis failed: {e}")
            return {}
    
    def _extract_features(self, file_content: bytes, entropy: float, 
                         suspicious_strings: List[str], pe_info: Dict) -> List[float]:
        """Extract feature vector for ML model"""
        features = []
        
        # Basic features
        features.append(len(file_content))  # file_size
        features.append(entropy)  # entropy
        
        # PE-specific features
        if pe_info:
            features.append(pe_info.get('high_entropy_sections', 0))
            features.append(len(suspicious_strings))
            features.append(pe_info.get('suspicious_imports_count', 0))
            features.append(pe_info.get('packed_sections', 0))
            features.append(1 if pe_info.get('suspicious_section_names') else 0)
            features.append(pe_info.get('num_sections', 0))
            features.append(pe_info.get('entry_point_entropy', 0))
            
            # Calculate code section entropy
            code_section_entropy = 0
            for section in pe_info.get('sections', []):
                if '.text' in section['name'] or 'CODE' in section['name']:
                    code_section_entropy = section['entropy']
                    break
            features.append(code_section_entropy)
        else:
            # Default values for non-PE files
            features.extend([0, len(suspicious_strings), 0, 0, 0, 0, 0, 0])
        
        return features
    
    def _rule_based_detection(self, entropy: float, suspicious_strings: List[str], 
                             pe_info: Dict) -> Dict:
        """
        Fallback rule-based detection when ML model is unavailable
        Uses heuristics to determine if file is malicious
        """
        threat_score = 0.0
        
        # High entropy check (weight: 0.3)
        if entropy > Config.HIGH_ENTROPY_THRESHOLD:
            threat_score += 0.3
        
        # Suspicious strings check (weight: 0.25)
        if len(suspicious_strings) >= 5:
            threat_score += 0.25
        elif len(suspicious_strings) >= 3:
            threat_score += 0.15
        
        # PE analysis checks (weight: 0.45)
        if pe_info:
            # High entropy sections
            if pe_info.get('high_entropy_sections', 0) >= 2:
                threat_score += 0.15
            
            # Suspicious imports
            if pe_info.get('suspicious_imports_count', 0) >= 5:
                threat_score += 0.15
            
            # Packed sections
            if pe_info.get('packed_sections', 0) >= 1:
                threat_score += 0.10
            
            # Suspicious section names
            if pe_info.get('suspicious_section_names'):
                threat_score += 0.05
        
        # Determine prediction
        prediction = 'Malicious' if threat_score >= 0.5 else 'Safe'
        
        logger.info(f"📏 Rule-based threat score: {threat_score:.2f}")
        
        return {
            'prediction': prediction,
            'confidence': threat_score
        }


# Standalone test function
if __name__ == "__main__":
    # Test the detector
    detector = RansomwareDetector()
    detector.load_model()
    
    # Test with sample data
    test_data = b"Test file content with encrypt and ransom keywords"
    result = detector.analyze_file(
        file_content=test_data,
        filename="test.exe",
        file_hash=hashlib.sha256(test_data).hexdigest()
    )
    
    print(f"\n🧪 Test Result:")
    print(f"Prediction: {result['prediction']}")
    print(f"Confidence: {result['confidence']:.2%}")
    print(f"Method: {result['method']}")