#!/usr/bin/env python3
"""
Quick test - Verify Hedera connection
Run: python test_hedera_quick.py
"""

import sys
import os

print("\n" + "="*70)
print("🔐 HEDERA TESTNET CONNECTION TEST")
print("="*70)

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Import dotenv
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("❌ python-dotenv not installed")
    print("Run: pip install python-dotenv")
    sys.exit(1)

# Check .env values
operator_id = os.getenv('OPERATOR_ID')
operator_key = os.getenv('OPERATOR_KEY')

print("\n📍 Checking .env file...")
print("-" * 70)

if not operator_id:
    print("❌ OPERATOR_ID not found in .env")
    print("\nFix:")
    print("  1. Create .env file in project root")
    print("  2. Add: OPERATOR_ID=0.0.xxxxx")
    sys.exit(1)
else:
    print(f"✅ OPERATOR_ID: {operator_id}")

if not operator_key:
    print("❌ OPERATOR_KEY not found in .env")
    print("\nFix:")
    print("  1. Add to .env: OPERATOR_KEY=302e020100...")
    sys.exit(1)
else:
    # Show only first 30 chars for security
    key_preview = operator_key[:30] + "..." if len(operator_key) > 30 else operator_key
    print(f"✅ OPERATOR_KEY: {key_preview}")
    print(f"   Length: {len(operator_key)} characters")

print("\n📍 Attempting Hedera connection...")
print("-" * 70)

try:
    from src.hedera_client import get_hedera_client
    
    print("\n⏳ Initializing client...")
    # Initialize client
    client = get_hedera_client()
    
    print("\n✅ SUCCESS! Connected to Hedera Testnet")
    print("="*70)
    print("\n🎉 Your Hedera setup is working correctly!")
    print("\nNext steps:")
    print("  1. Run: python run_server.py")
    print("  2. Test endpoints in another PowerShell")
    print("  3. Check audit logs at: http://localhost:8000/docs")
    
except ValueError as e:
    print(f"\n❌ Configuration Error: {e}")
    print("\nFix:")
    print("  1. Make sure .env file exists in project root")
    print("  2. Check OPERATOR_ID format: 0.0.xxxxxx")
    print("  3. Check OPERATOR_KEY is HEX encoded (starts with 302e0201...)")
    sys.exit(1)
    
except ImportError as e:
    print(f"\n⚠️ SDK Import Error: {e}")
    print("\nInstall missing dependencies:")
    print("  pip install -r requirements_hedera.txt")
    sys.exit(1)
    
except Exception as e:
    print(f"\n❌ Connection Error: {e}")
    print(f"\nError type: {type(e).__name__}")
    print("\nPossible causes:")
    print("  1. Invalid private key format")
    print("  2. Network connectivity issue")
    print("  3. Wrong credentials")
    print("  4. Hedera SDK not installed properly")
    sys.exit(1)

print("\n" + "="*70 + "\n")