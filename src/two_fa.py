"""
Two-Factor Authentication (2FA) Module
Task 1.2: Generate, send, and verify 2FA codes
"""

import random
from datetime import datetime, timedelta
from typing import Dict, Optional


class TwoFactorAuth:
    def __init__(self):
        """Initialize 2FA system"""
        self.user_sessions = {
            'user_123': {
                'phone': '+216-12345678',
                'email': 'alex@example.com',
                'two_fa_enabled': True,
                'method': 'SMS',  # SMS or AUTHENTICATOR_APP
                'last_code_sent': None,
            },
            'user_456': {
                'phone': '+216-87654321',
                'email': 'sam@example.com',
                'two_fa_enabled': False,
            },
        }

        # Store active codes with expiry
        self.active_codes = {}
        
        # Config
        self.MAX_2FA_ATTEMPTS = 3
        self.CODE_EXPIRY_SECONDS = 5 * 60  # 5 minutes
        self.CODE_LENGTH = 6

    def send_two_fa_code(self, user_id: str) -> Dict:
        """
        Generate and send 2FA code to user.
        
        Args:
            user_id: User identifier
            
        Returns:
            Dict with status and delivery info
        """
        print(f"\n📱 2FA CODE GENERATION for {user_id}")
        print('=' * 60)

        if user_id not in self.user_sessions:
            print('❌ User not found')
            return {'success': False, 'message': 'User not found'}

        user = self.user_sessions[user_id]

        if not user.get('two_fa_enabled'):
            print('⚠️ 2FA not enabled for this user')
            return {'success': False, 'message': '2FA not enabled'}

        # Generate random code
        code = ''.join([str(random.randint(0, 9)) for _ in range(self.CODE_LENGTH)])

        # Store code with expiry metadata
        self.active_codes[user_id] = {
            'code': code,
            'created_at': datetime.now(),
            'expires_at': datetime.now() + timedelta(seconds=self.CODE_EXPIRY_SECONDS),
            'attempts': 0,
            'method': user.get('method'),
        }

        # Determine delivery destination
        destination = user.get('phone') if user.get('method') == 'SMS' else user.get('email')
        method = user.get('method', 'SMS')

        print(f"✅ Code generated: {code}")  # Dev only
        print(f"📧 Sending via: {method}")
        print(f"📍 Destination: {destination}")
        print(f"⏰ Valid for: {self.CODE_EXPIRY_SECONDS // 60} minutes")
        print('=' * 60 + '\n')

        # In production: would call SMS/Email service
        return {
            'success': True,
            'message': f'Code sent via {method}',
            'code_sent': True,
            'destination': destination[-4:] + '*' * (len(destination) - 4),  # Mask
        }

    def verify_two_fa_code(self, user_id: str, user_code: str) -> Dict:
        """
        Verify 2FA code entered by user.
        
        Args:
            user_id: User identifier
            user_code: Code entered by user
            
        Returns:
            Dict with verification result
        """
        print(f"\n🔐 2FA CODE VERIFICATION for {user_id}")
        print('=' * 60)

        if user_id not in self.active_codes:
            print('❌ No active code for this user')
            return {'success': False, 'message': 'No code sent'}

        code_data = self.active_codes[user_id]

        # Check expiry
        if datetime.now() > code_data['expires_at']:
            print('❌ Code expired')
            del self.active_codes[user_id]
            return {'success': False, 'message': 'Code expired'}

        # Check attempts
        if code_data['attempts'] >= self.MAX_2FA_ATTEMPTS:
            print(f'🚫 Too many failed attempts - code blocked')
            del self.active_codes[user_id]
            return {'success': False, 'message': 'Code blocked - too many attempts'}

        # Verify code
        if code_data['code'] != user_code:
            code_data['attempts'] += 1
            remaining = self.MAX_2FA_ATTEMPTS - code_data['attempts']
            print(f"❌ Wrong code (attempt {code_data['attempts']}/{self.MAX_2FA_ATTEMPTS})")
            print(f"⚠️ Remaining attempts: {remaining}")

            if remaining == 0:
                print('🚫 Code locked - too many attempts')
                del self.active_codes[user_id]

            return {
                'success': False,
                'message': 'Invalid code',
                'remaining_attempts': remaining,
            }

        # ✅ Code verified
        print('✅ Code verified!')
        print('✅ 2FA authentication successful')
        del self.active_codes[user_id]
        print('=' * 60 + '\n')

        return {'success': True, 'authenticated': True}

    def enable_two_fa(self, user_id: str, method: str = 'SMS') -> Dict:
        """
        Enable 2FA for a user.
        
        Args:
            user_id: User identifier
            method: 2FA method (SMS or AUTHENTICATOR_APP)
            
        Returns:
            Dict with status
        """
        print(f"\n🔧 ENABLING 2FA for {user_id} via {method}")

        if method not in ['SMS', 'AUTHENTICATOR_APP', 'EMAIL']:
            return {'success': False, 'message': 'Invalid 2FA method'}

        if user_id not in self.user_sessions:
            self.user_sessions[user_id] = {}

        self.user_sessions[user_id]['two_fa_enabled'] = True
        self.user_sessions[user_id]['method'] = method
        self.user_sessions[user_id]['enabled_date'] = datetime.now().isoformat()

        print(f'✅ 2FA enabled via {method}\n')

        return {
            'success': True,
            'two_fa_enabled': True,
            'method': method,
        }

    def disable_two_fa(self, user_id: str) -> Dict:
        """Disable 2FA for a user"""
        if user_id not in self.user_sessions:
            return {'success': False, 'message': 'User not found'}

        self.user_sessions[user_id]['two_fa_enabled'] = False
        print(f"\n🔓 2FA disabled for {user_id}\n")

        return {'success': True, 'two_fa_enabled': False}

    def get_two_fa_status(self, user_id: str) -> Dict:
        """Get 2FA status for a user"""
        if user_id not in self.user_sessions:
            return {'status': 'NOT_FOUND'}

        user = self.user_sessions[user_id]
        return {
            'two_fa_enabled': user.get('two_fa_enabled', False),
            'method': user.get('method', 'NONE'),
            'phone': user.get('phone', 'N/A'),
            'email': user.get('email', 'N/A'),
        }