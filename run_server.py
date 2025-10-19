#!/usr/bin/env python3
"""
Launch the Security API Server with Hedera Integration
Run: python run_server.py
"""

import uvicorn
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Import and setup audit logger with Hedera
try:
    from dotenv import load_dotenv
    load_dotenv()
    
    from src.blockchain_audit_logger import get_audit_logger
    from src.hedera_client import get_hedera_client
    
    print("\n" + "="*70)
    print("🚀 STARTING AIxCyber SECURITY API WITH HEDERA INTEGRATION")
    print("="*70)
    
    # Initialize Hedera
    print("\n📍 Initializing Hedera client...")
    hedera_client = get_hedera_client()
    
    # Initialize audit logger
    print("📍 Initializing blockchain audit logger...")
    audit_logger = get_audit_logger()
    audit_logger.setup_topic()
    
    print("\n" + "="*70)
    print("✅ ALL SYSTEMS READY")
    print("="*70)
    
except Exception as e:
    print(f"\n❌ Initialization error: {e}")
    print("Continuing with limited Hedera functionality...")

if __name__ == "__main__":
    print("\n📍 API Configuration:")
    print(f"   Host: 0.0.0.0")
    print(f"   Port: 8000")
    print(f"   URL: http://localhost:8000")
    print(f"   Docs: http://localhost:8000/docs")
    
    print("\n" + "="*70)
    print("🔐 AIxCyber Security Layer API - Running")
    print("="*70 + "\n")
    
    uvicorn.run(
        "api.security_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )