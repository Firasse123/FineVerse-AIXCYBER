"""
KYC (Know Your Customer) Verification Module
Task 1.1: Verify user identity and manage verification status
"""

from datetime import datetime, timedelta
import json
from typing import Optional, Dict, List


class KYCVerification:
    def __init__(self):
        """Initialize KYC verification system with mock database"""
        self.verified_users = {
            'user_123': {
                'name': 'Alex Johnson',
                'email': 'alex@example.com',
                'phone': '+216-12345678',
                'id_type': 'PASSPORT',
                'id_number': 'TN123456',
                'id_verified': True,
                'email_verified': True,
                'phone_verified': True,
                'kyc_status': 'VERIFIED',
                'kyc_date': '2024-01-15',
                'country': 'TN',
            },
            'user_456': {
                'name': 'Sam Smith',
                'email': 'sam@example.com',
                'kyc_status': 'PENDING',
                'country': 'FR',
            },
        }
        self.pending_documents = {}  # Store pending document submissions

    def verify_user(self, user_id: str) -> Dict:
        """
        Check if user is KYC verified.
        
        Args:
            user_id: User identifier
            
        Returns:
            Dict with verification status and details
        """
        print(f"\n🆔 KYC CHECK for {user_id}")
        print('=' * 60)

        if user_id not in self.verified_users:
            print('❌ User not found in KYC database')
            return {
                'user_id': user_id,
                'kyc_status': 'NOT_FOUND',
                'verified': False,
                'can_trade': False,
            }

        user = self.verified_users[user_id]

        print(f"✅ Name: {user.get('name', 'N/A')}")
        print(f"✅ Email verified: {'YES' if user.get('email_verified') else 'NO'}")
        print(f"✅ Phone verified: {'YES' if user.get('phone_verified') else 'NO'}")
        print(f"✅ ID verified: {'YES' if user.get('id_verified') else 'NO'}")
        print(f"📊 Status: {user.get('kyc_status')}")
        print('=' * 60 + '\n')

        return {
            'user_id': user_id,
            'name': user.get('name'),
            'kyc_status': user.get('kyc_status'),
            'verified': user.get('kyc_status') == 'VERIFIED',
            'can_trade': user.get('kyc_status') == 'VERIFIED',
            'verification_date': user.get('kyc_date'),
            'country': user.get('country'),
        }

    def submit_kyc_documents(
        self,
        user_id: str,
        documents: Dict[str, str],
        id_type: str = 'PASSPORT',
        id_number: str = None
    ) -> Dict:
        """
        Submit KYC documents for verification.
        
        Args:
            user_id: User identifier
            documents: Dict with document types and file paths
            id_type: Type of ID (PASSPORT, NATIONAL_ID, etc.)
            id_number: ID number
            
        Returns:
            Dict with submission status
        """
        print(f"\n📤 KYC SUBMISSION for {user_id}")
        print(f"📋 Documents: {list(documents.keys())}")
        print('=' * 60)

        if user_id not in self.verified_users:
            self.verified_users[user_id] = {}

        self.verified_users[user_id].update({
            'kyc_status': 'PENDING',
            'id_type': id_type,
            'id_number': id_number,
            'submission_date': datetime.now().isoformat(),
        })

        self.pending_documents[user_id] = {
            'documents': documents,
            'submitted_at': datetime.now().isoformat(),
            'status': 'UNDER_REVIEW',
        }

        print('✅ Documents submitted for review')
        print(f'⏳ Estimated review time: 24-48 hours')
        print('=' * 60 + '\n')

        return {
            'status': 'PENDING',
            'message': 'Documents submitted. Under manual review.',
            'submission_id': f"SUB_{user_id}_{datetime.now().timestamp()}",
        }

    def approve_kyc(self, user_id: str, reviewer_id: str = 'ADMIN') -> Dict:
        """
        Approve KYC for a user (admin only).
        
        Args:
            user_id: User identifier
            reviewer_id: Admin reviewer identifier
            
        Returns:
            Dict with approval status
        """
        print(f"\n✅ APPROVING KYC for {user_id} (reviewed by {reviewer_id})")

        if user_id not in self.verified_users:
            return {'success': False, 'message': 'User not found'}

        self.verified_users[user_id]['kyc_status'] = 'VERIFIED'
        self.verified_users[user_id]['kyc_date'] = datetime.now().isoformat()
        self.verified_users[user_id]['id_verified'] = True
        self.verified_users[user_id]['email_verified'] = True

        if user_id in self.pending_documents:
            del self.pending_documents[user_id]

        print('✅ KYC approved - user can now trade\n')

        return {
            'success': True,
            'message': 'KYC approved',
            'kyc_status': 'VERIFIED',
        }

    def reject_kyc(self, user_id: str, reason: str = '') -> Dict:
        """
        Reject KYC for a user.
        
        Args:
            user_id: User identifier
            reason: Reason for rejection
            
        Returns:
            Dict with rejection status
        """
        print(f"\n❌ REJECTING KYC for {user_id}")
        print(f"📝 Reason: {reason}\n")

        if user_id not in self.verified_users:
            return {'success': False, 'message': 'User not found'}

        self.verified_users[user_id]['kyc_status'] = 'REJECTED'
        self.verified_users[user_id]['rejection_reason'] = reason
        self.verified_users[user_id]['rejected_date'] = datetime.now().isoformat()

        return {
            'success': True,
            'message': 'KYC rejected',
            'kyc_status': 'REJECTED',
            'reason': reason,
        }

    def get_kyc_status(self, user_id: str) -> Dict:
        """Get current KYC status for a user"""
        if user_id in self.verified_users:
            return self.verified_users[user_id]
        return {'status': 'NOT_FOUND'}

    def list_pending_kyc(self) -> List[Dict]:
        """List all pending KYC submissions"""
        pending = []
        for user_id, user_data in self.verified_users.items():
            if user_data.get('kyc_status') == 'PENDING':
                pending.append({
                    'user_id': user_id,
                    'name': user_data.get('name'),
                    'submitted_date': user_data.get('submission_date'),
                })
        return pending