"""
Integration Test - Test all security modules together
Run with: python -m pytest tests/test_integration.py -v
"""

import sys
import os

# When run as a script (python tests/test_integration.py) the package root isn't
# automatically on sys.path. Ensure the repo root is on sys.path so `from src...`
# imports work both when running as a script and when running under pytest.
if __package__ is None:
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    if repo_root not in sys.path:
        sys.path.insert(0, repo_root)

from src.kyc import KYCVerification
from src.two_fa import TwoFactorAuth
from src.session_manager import SessionManager


def test_complete_user_journey():
    """Test a complete user onboarding and login flow"""
    
    print("\n" + "="*70)
    print("🔐 SECURITY LAYER - COMPLETE USER JOURNEY TEST")
    print("="*70)
    
    # Initialize security modules
    kyc = KYCVerification()
    two_fa = TwoFactorAuth()
    session_mgr = SessionManager()
    
    user_id = 'user_123'
    ip_address = '192.168.1.100'
    
    # ============ STEP 1: KYC VERIFICATION ============
    print("\n\n📍 STEP 1: KYC VERIFICATION")
    print("-" * 70)
    kyc_result = kyc.verify_user(user_id)
    assert kyc_result['verified'] == True, "KYC verification failed"
    print(f"✅ KYC Status: {kyc_result['kyc_status']}")
    
    # ============ STEP 2: LOGIN ATTEMPT ============
    print("\n\n📍 STEP 2: RECORD LOGIN ATTEMPT")
    print("-" * 70)
    login_result = session_mgr.record_login_attempt(
        username=user_id,
        ip_address=ip_address,
        success=True
    )
    assert login_result['blocked'] == False, "Login blocked unexpectedly"
    print(f"✅ Login recorded: {login_result['message']}")
    
    # ============ STEP 3: CREATE SESSION ============
    print("\n\n📍 STEP 3: CREATE SESSION")
    print("-" * 70)
    session_result = session_mgr.create_session(user_id, ip_address)
    assert session_result['success'] == True, "Session creation failed"
    session_token = session_result['session_token']
    print(f"✅ Session created: {session_token[:30]}...")
    
    # ============ STEP 4: ENABLE 2FA ============
    print("\n\n📍 STEP 4: ENABLE 2FA")
    print("-" * 70)
    two_fa_enable = two_fa.enable_two_fa(user_id, method='SMS')
    assert two_fa_enable['success'] == True, "2FA enablement failed"
    print(f"✅ 2FA Enabled: {two_fa_enable['method']}")
    
    # ============ STEP 5: SEND 2FA CODE ============
    print("\n\n📍 STEP 5: SEND 2FA CODE")
    print("-" * 70)
    code_result = two_fa.send_two_fa_code(user_id)
    assert code_result['success'] == True, "2FA code sending failed"
    print(f"✅ 2FA Code sent to: {code_result['destination']}")
    
    # ============ STEP 6: VERIFY 2FA CODE ============
    print("\n\n📍 STEP 6: VERIFY 2FA CODE")
    print("-" * 70)
    # Get the actual code (in production, user would receive via SMS)
    actual_code = two_fa.active_codes[user_id]['code']
    verify_result = two_fa.verify_two_fa_code(user_id, actual_code)
    assert verify_result['success'] == True, "2FA verification failed"
    print(f"✅ 2FA verified: {verify_result['authenticated']}")
    
    # ============ STEP 7: VALIDATE SESSION ============
    print("\n\n📍 STEP 7: VALIDATE SESSION")
    print("-" * 70)
    validate_result = session_mgr.validate_session(session_token)
    assert validate_result['valid'] == True, "Session validation failed"
    print(f"✅ Session valid for user: {validate_result['user_id']}")
    
    # ============ STEP 8: GET SESSION STATS ============
    print("\n\n📍 STEP 8: SESSION STATISTICS")
    print("-" * 70)
    stats = session_mgr.get_session_stats()
    print(f"✅ Active sessions: {stats['active_sessions']}")
    print(f"✅ Blocked IPs: {stats['blocked_ips']}")
    print(f"✅ Total users: {stats['total_users']}")
    
    # ============ STEP 9: LOGOUT ============
    print("\n\n📍 STEP 9: LOGOUT")
    print("-" * 70)
    logout_result = session_mgr.logout_session(session_token)
    assert logout_result['success'] == True, "Logout failed"
    print(f"✅ Logout: {logout_result['message']}")
    
    print("\n\n" + "="*70)
    print("✅ ALL TESTS PASSED - USER JOURNEY COMPLETE")
    print("="*70 + "\n")


def test_brute_force_protection():
    """Test brute force attack prevention"""
    
    print("\n" + "="*70)
    print("🔐 BRUTE FORCE ATTACK PREVENTION TEST")
    print("="*70)
    
    session_mgr = SessionManager()
    username = 'attacker'
    ip_address = '10.0.0.1'
    
    print("\n\n📍 SIMULATING 6 FAILED LOGIN ATTEMPTS")
    print("-" * 70)
    
    for attempt in range(6):
        result = session_mgr.record_login_attempt(
            username=username,
            ip_address=ip_address,
            success=False
        )
        
        if attempt < 4:
            assert result['blocked'] == False, f"Blocked too early at attempt {attempt + 1}"
            print(f"Attempt {attempt + 1}: Remaining attempts: {result.get('remaining_attempts')}")
        else:
            assert result['blocked'] == True, f"Not blocked after {attempt + 1} attempts"
            print(f"Attempt {attempt + 1}: ✅ IP BLOCKED")
            break
    
    # Try to create session from blocked IP
    print("\n\n📍 TRYING TO CREATE SESSION FROM BLOCKED IP")
    print("-" * 70)
    session_result = session_mgr.create_session('attacker_user', ip_address)
    assert session_result['success'] == False, "Blocked IP was allowed!"
    print(f"✅ Blocked IP rejected: {session_result['message']}")
    
    print("\n\n" + "="*70)
    print("✅ BRUTE FORCE PROTECTION WORKING")
    print("="*70 + "\n")


def test_kyc_workflow():
    """Test complete KYC workflow"""
    
    print("\n" + "="*70)
    print("🔐 KYC WORKFLOW TEST")
    print("="*70)
    
    kyc = KYCVerification()
    new_user = 'new_user_789'
    
    print("\n\n📍 STEP 1: NEW USER - NOT VERIFIED")
    print("-" * 70)
    result = kyc.verify_user(new_user)
    assert result['verified'] == False, "New user shouldn't be verified"
    assert result['can_trade'] == False, "New user shouldn't be able to trade"
    print(f"✅ New user status: {result['kyc_status']}")
    
    print("\n\n📍 STEP 2: SUBMIT KYC DOCUMENTS")
    print("-" * 70)
    submit_result = kyc.submit_kyc_documents(
        user_id=new_user,
        documents={'passport': 'file.pdf', 'proof_address': 'file2.pdf'},
        id_type='PASSPORT',
        id_number='TN987654'
    )
    assert submit_result['status'] == 'PENDING', "Submission failed"
    print(f"✅ Submission status: {submit_result['status']}")
    
    print("\n\n📍 STEP 3: ADMIN APPROVES KYC")
    print("-" * 70)
    approve_result = kyc.approve_kyc(new_user, reviewer_id='ADMIN_001')
    assert approve_result['success'] == True, "Approval failed"
    print(f"✅ KYC approved: {approve_result['kyc_status']}")
    
    print("\n\n📍 STEP 4: VERIFY APPROVED USER CAN TRADE")
    print("-" * 70)
    verify_result = kyc.verify_user(new_user)
    assert verify_result['verified'] == True, "Approved user not verified"
    assert verify_result['can_trade'] == True, "Approved user can't trade"
    print(f"✅ User can now trade: {verify_result['can_trade']}")
    
    print("\n\n" + "="*70)
    print("✅ KYC WORKFLOW COMPLETE")
    print("="*70 + "\n")


if __name__ == '__main__':
    try:
        test_complete_user_journey()
        test_brute_force_protection()
        test_kyc_workflow()
        
        print("\n\n" + "🎉 "*20)
        print("ALL INTEGRATION TESTS PASSED!")
        print("🎉 "*20 + "\n")
        
    except AssertionError as e:
        print(f"\n\n❌ TEST FAILED: {e}\n")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ ERROR: {e}\n")
        sys.exit(1)