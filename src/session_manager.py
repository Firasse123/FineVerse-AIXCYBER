"""
Session Management & Rate Limiting Module
Task 1.3: Track sessions, prevent brute force, enforce timeouts
"""

import time
import secrets
from typing import Optional, Dict, List
from collections import defaultdict
from datetime import datetime, timedelta

# No external config import required here; SessionManager uses internal defaults.


class SessionManager:
    def __init__(self):
        """Initialize session management system"""
        self.active_sessions = {}
        self.login_attempts = {}
        self.blocked_ips = {}  # IP -> block expiry time

        # Configuration
        self.MAX_LOGIN_ATTEMPTS = 5
        self.LOGIN_ATTEMPT_WINDOW = 15 * 60  # 15 minutes in seconds
        self.SESSION_TIMEOUT = 30 * 60  # 30 minutes in seconds
        self.BLOCK_DURATION = 60 * 60  # 1 hour in seconds
        self.MAX_CONCURRENT_SESSIONS = 3

    def create_session(self, user_id: str, ip_address: str) -> Dict:
        """
        Create a new user session.
        
        Args:
            user_id: User identifier
            ip_address: Client IP address
            
        Returns:
            Dict with session token or error
        """
        print(f"\n📝 CREATING SESSION for {user_id}")
        print('=' * 60)

        # Check if IP is blocked
        if self._is_ip_blocked(ip_address):
            print(f'🚫 IP {ip_address} is BLOCKED')
            print('=' * 60 + '\n')
            return {'success': False, 'message': 'IP address blocked'}

        # Check concurrent sessions limit
        user_sessions = [s for s in self.active_sessions.values() 
                        if s['user_id'] == user_id and s['is_active']]
        
        if len(user_sessions) >= self.MAX_CONCURRENT_SESSIONS:
            print(f'⚠️ User has {len(user_sessions)} active sessions')
            print('=' * 60 + '\n')
            return {
                'success': False,
                'message': f'Max {self.MAX_CONCURRENT_SESSIONS} concurrent sessions exceeded'
            }

        # Generate session token
        session_token = self._generate_session_token()

        self.active_sessions[session_token] = {
            'user_id': user_id,
            'ip_address': ip_address,
            'created_at': datetime.now(),
            'last_activity': datetime.now(),
            'is_active': True,
        }

        expiry_time = datetime.now() + timedelta(seconds=self.SESSION_TIMEOUT)

        print(f"✅ Session created for {user_id}")
        print(f"🔑 Token: {session_token[:30]}...")
        print(f"📍 IP: {ip_address}")
        print(f"⏰ Expires: {expiry_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print('=' * 60 + '\n')

        return {
            'success': True,
            'session_token': session_token,
            'expires_at': expiry_time.isoformat(),
        }

    def validate_session(self, session_token: str) -> Dict:
        """
        Validate an active session.
        
        Args:
            session_token: Session token to validate
            
        Returns:
            Dict with validation result
        """
        if session_token not in self.active_sessions:
            return {'valid': False, 'message': 'Invalid session'}

        session = self.active_sessions[session_token]

        # Check expiry
        elapsed = (datetime.now() - session['last_activity']).total_seconds()
        if elapsed > self.SESSION_TIMEOUT:
            print(f"⏰ Session expired (inactive for {elapsed:.0f}s)")
            session['is_active'] = False
            return {'valid': False, 'message': 'Session expired'}

        # Update last activity
        session['last_activity'] = datetime.now()

        return {
            'valid': True,
            'user_id': session['user_id'],
            'session_token': session_token,
            'ip_address': session['ip_address'],
        }

    def record_login_attempt(
        self,
        username: str,
        ip_address: str,
        success: bool
    ) -> Dict:
        """
        Track login attempts to prevent brute force.
        
        Args:
            username: Username/email
            ip_address: Client IP address
            success: Whether login was successful
            
        Returns:
            Dict with attempt status
        """
        print(f"\n🔑 LOGIN ATTEMPT - {username} from {ip_address}")

        if username not in self.login_attempts:
            self.login_attempts[username] = []

        # Clean old attempts (outside window)
        cutoff_time = datetime.now() - timedelta(seconds=self.LOGIN_ATTEMPT_WINDOW)
        self.login_attempts[username] = [
            attempt for attempt in self.login_attempts[username]
            if attempt['timestamp'] > cutoff_time
        ]

        if success:
            print('✅ Login successful - attempts reset')
            self.login_attempts[username] = []
            print('=' * 60 + '\n')
            return {'blocked': False, 'message': 'Login successful'}

        # Failed attempt
        self.login_attempts[username].append({
            'timestamp': datetime.now(),
            'ip_address': ip_address,
        })

        attempt_count = len(self.login_attempts[username])
        print(f"❌ Failed login ({attempt_count}/{self.MAX_LOGIN_ATTEMPTS})")

        if attempt_count >= self.MAX_LOGIN_ATTEMPTS:
            print(f"🚫 BLOCKED after {self.MAX_LOGIN_ATTEMPTS} failed attempts")
            self._block_ip(ip_address)
            print('=' * 60 + '\n')

            return {
                'blocked': True,
                'message': f'Too many failed attempts - IP blocked for {self.BLOCK_DURATION // 60} min',
                'attempts': attempt_count,
            }

        remaining = self.MAX_LOGIN_ATTEMPTS - attempt_count
        print(f"⚠️ Remaining attempts: {remaining}")
        print('=' * 60 + '\n')

        return {
            'blocked': False,
            'remaining_attempts': remaining,
            'attempts': attempt_count,
        }

    def logout_session(self, session_token: str) -> Dict:
        """
        Logout/terminate a session.
        
        Args:
            session_token: Session token to logout
            
        Returns:
            Dict with logout status
        """
        print(f"\n👋 LOGOUT")

        if session_token not in self.active_sessions:
            print('❌ Session not found')
            return {'success': False, 'message': 'Session not found'}

        session = self.active_sessions[session_token]
        session['is_active'] = False

        print(f"✅ Session terminated for {session['user_id']}")
        print('=' * 60 + '\n')

        return {'success': True, 'message': 'Logged out successfully'}

    def get_active_sessions(self, user_id: str) -> List[Dict]:
        """Get all active sessions for a user"""
        sessions = []
        for token, session in self.active_sessions.items():
            if session['user_id'] == user_id and session['is_active']:
                sessions.append({
                    'token': token[:20] + '...',
                    'ip_address': session['ip_address'],
                    'created_at': session['created_at'].isoformat(),
                    'last_activity': session['last_activity'].isoformat(),
                })
        return sessions

    def _is_ip_blocked(self, ip_address: str) -> bool:
        """Check if IP is currently blocked"""
        if ip_address not in self.blocked_ips:
            return False

        # Check if block has expired
        if datetime.now() > self.blocked_ips[ip_address]:
            del self.blocked_ips[ip_address]
            return False

        return True

    def _block_ip(self, ip_address: str):
        """Block an IP address for BLOCK_DURATION"""
        self.blocked_ips[ip_address] = datetime.now() + timedelta(seconds=self.BLOCK_DURATION)

    def _generate_session_token(self) -> str:
        """Generate a cryptographically secure session token"""
        return 'SESSION_' + secrets.token_hex(32)

    def get_session_stats(self) -> Dict:
        """Get statistics about current sessions"""
        active = sum(1 for s in self.active_sessions.values() if s['is_active'])
        expired = sum(1 for s in self.active_sessions.values() if not s['is_active'])
        blocked = len(self.blocked_ips)

        return {
            'active_sessions': active,
            'expired_sessions': expired,
            'blocked_ips': blocked,
            'total_users': len(set(s['user_id'] for s in self.active_sessions.values())),
        }