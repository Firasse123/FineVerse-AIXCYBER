"""
FastAPI Security Layer Endpoints
Run with: uvicorn api.security_api:app --reload
"""

from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, Dict
import os
import sys

# Ensure repo root is on sys.path when running the API as a script/module so
# imports like `from src...` resolve correctly.
if __package__ is None:
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    if repo_root not in sys.path:
        sys.path.insert(0, repo_root)

from src.kyc import KYCVerification
from src.two_fa import TwoFactorAuth
from src.session_manager import SessionManager

# ============ INITIALIZE APP & SECURITY MODULES ============
app = FastAPI(
    title="AIxCyber - Security Layer API",
    description="Authentication & Authorization for Financial Simulator",
    version="1.0.0"
)

kyc = KYCVerification()
two_fa = TwoFactorAuth()
session_mgr = SessionManager()


# ============ REQUEST/RESPONSE MODELS ============
class KYCVerifyRequest(BaseModel):
    user_id: str


class KYCSubmitRequest(BaseModel):
    user_id: str
    documents: Dict[str, str]
    id_type: str = "PASSPORT"
    id_number: str


class TwoFAEnableRequest(BaseModel):
    user_id: str
    method: str = "SMS"


class TwoFASendRequest(BaseModel):
    user_id: str


class TwoFAVerifyRequest(BaseModel):
    user_id: str
    code: str


class LoginRequest(BaseModel):
    username: str
    ip_address: str


class LogoutRequest(BaseModel):
    session_token: str


# ============ KYC ENDPOINTS ============
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "operational",
        "service": "Security Layer API",
        "version": "1.0.0"
    }


@app.post("/kyc/verify")
async def verify_kyc(request: KYCVerifyRequest):
    """
    Verify KYC status for a user
    
    Example:
    ```
    POST /kyc/verify
    {"user_id": "user_123"}
    ```
    """
    result = kyc.verify_user(request.user_id)
    
    if result.get('kyc_status') == 'NOT_FOUND':
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "success": True,
        "data": result
    }


@app.post("/kyc/submit")
async def submit_kyc(request: KYCSubmitRequest):
    """
    Submit KYC documents for verification
    
    Example:
    ```
    POST /kyc/submit
    {
        "user_id": "user_456",
        "documents": {"passport": "passport.pdf"},
        "id_type": "PASSPORT",
        "id_number": "TN123456"
    }
    ```
    """
    result = kyc.submit_kyc_documents(
        user_id=request.user_id,
        documents=request.documents,
        id_type=request.id_type,
        id_number=request.id_number
    )
    
    return {
        "success": True,
        "data": result
    }


@app.get("/kyc/pending")
async def list_pending_kyc():
    """List all pending KYC submissions"""
    pending = kyc.list_pending_kyc()
    
    return {
        "success": True,
        "count": len(pending),
        "data": pending
    }


# ============ 2FA ENDPOINTS ============
@app.post("/2fa/enable")
async def enable_2fa(request: TwoFAEnableRequest):
    """
    Enable 2FA for user
    
    Example:
    ```
    POST /2fa/enable
    {"user_id": "user_123", "method": "SMS"}
    ```
    """
    if request.method not in ['SMS', 'AUTHENTICATOR_APP', 'EMAIL']:
        raise HTTPException(status_code=400, detail="Invalid 2FA method")
    
    result = two_fa.enable_two_fa(request.user_id, request.method)
    
    return {
        "success": result['success'],
        "data": result
    }


@app.post("/2fa/send-code")
async def send_2fa_code(request: TwoFASendRequest):
    """
    Send 2FA code to user
    
    Example:
    ```
    POST /2fa/send-code
    {"user_id": "user_123"}
    ```
    """
    result = two_fa.send_two_fa_code(request.user_id)
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['message'])
    
    return {
        "success": True,
        "data": result
    }


@app.post("/2fa/verify-code")
async def verify_2fa_code(request: TwoFAVerifyRequest):
    """
    Verify 2FA code
    
    Example:
    ```
    POST /2fa/verify-code
    {"user_id": "user_123", "code": "123456"}
    ```
    """
    result = two_fa.verify_two_fa_code(request.user_id, request.code)
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['message'])
    
    return {
        "success": True,
        "data": result
    }


@app.get("/2fa/status/{user_id}")
async def get_2fa_status(user_id: str):
    """Get 2FA status for user"""
    status = two_fa.get_two_fa_status(user_id)
    
    return {
        "success": True,
        "data": status
    }


# ============ SESSION ENDPOINTS ============
@app.post("/session/login")
async def login(request: LoginRequest):
    """
    Record login attempt and create session
    
    Example:
    ```
    POST /session/login
    {"username": "user_123", "ip_address": "192.168.1.100"}
    ```
    """
    # Record login attempt
    attempt_result = session_mgr.record_login_attempt(
        username=request.username,
        ip_address=request.ip_address,
        success=True
    )
    
    if attempt_result['blocked']:
        raise HTTPException(
            status_code=429,
            detail="Too many failed attempts. IP blocked."
        )
    
    # Create session
    session_result = session_mgr.create_session(request.username, request.ip_address)
    
    if not session_result['success']:
        raise HTTPException(status_code=400, detail=session_result['message'])
    
    return {
        "success": True,
        "data": session_result
    }


@app.post("/session/validate")
async def validate_session(session_token: str):
    """
    Validate a session token
    
    Example:
    ```
    POST /session/validate?session_token=SESSION_...
    ```
    """
    result = session_mgr.validate_session(session_token)
    
    if not result['valid']:
        raise HTTPException(status_code=401, detail=result['message'])
    
    return {
        "success": True,
        "data": result
    }


@app.post("/session/logout")
async def logout(request: LogoutRequest):
    """
    Logout and terminate session
    
    Example:
    ```
    POST /session/logout
    {"session_token": "SESSION_..."}
    ```
    """
    result = session_mgr.logout_session(request.session_token)
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['message'])
    
    return {
        "success": True,
        "data": result
    }


@app.get("/session/active/{user_id}")
async def get_active_sessions(user_id: str):
    """Get all active sessions for user"""
    sessions = session_mgr.get_active_sessions(user_id)
    
    return {
        "success": True,
        "count": len(sessions),
        "data": sessions
    }


@app.get("/session/stats")
async def get_session_stats():
    """Get session statistics"""
    stats = session_mgr.get_session_stats()
    
    return {
        "success": True,
        "data": stats
    }


# ============ COMBINED SECURITY CHECK ============
@app.post("/security/full-check")
async def full_security_check(request: LoginRequest):
    """
    Perform complete security check:
    1. KYC verification
    2. Session creation
    3. 2FA enablement check
    """
    user_id = request.username
    ip_address = request.ip_address
    
    # 1. Check KYC
    kyc_result = kyc.verify_user(user_id)
    if not kyc_result['verified']:
        raise HTTPException(status_code=403, detail="KYC verification required")
    
    # 2. Create session
    session_result = session_mgr.create_session(user_id, ip_address)
    if not session_result['success']:
        raise HTTPException(status_code=400, detail="Session creation failed")
    
    # 3. Check 2FA status
    two_fa_status = two_fa.get_two_fa_status(user_id)
    
    return {
        "success": True,
        "kyc": kyc_result,
        "session": session_result,
        "2fa": two_fa_status
    }


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )