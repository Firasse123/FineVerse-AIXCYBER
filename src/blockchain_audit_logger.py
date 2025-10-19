"""
Blockchain Audit Logger
Log all security events immutably to Hedera blockchain
"""

import json
from datetime import datetime
from typing import Dict, Optional, List
from enum import Enum
import hashlib

from src.hedera_client import get_hedera_client


class AuditEventType(str, Enum):
    """Types of audit events"""
    KYC_VERIFIED = "KYC_VERIFIED"
    KYC_REJECTED = "KYC_REJECTED"
    LOGIN_SUCCESS = "LOGIN_SUCCESS"
    LOGIN_FAILED = "LOGIN_FAILED"
    MFA_ENABLED = "2FA_ENABLED"
    MFA_CODE_SENT = "2FA_CODE_SENT"
    MFA_VERIFIED = "2FA_VERIFIED"
    SESSION_CREATED = "SESSION_CREATED"
    SESSION_EXPIRED = "SESSION_EXPIRED"
    SESSION_LOGOUT = "SESSION_LOGOUT"
    IP_BLOCKED = "IP_BLOCKED"
    THREAT_DETECTED = "THREAT_DETECTED"
    TRANSACTION_APPROVED = "TRANSACTION_APPROVED"
    TRANSACTION_BLOCKED = "TRANSACTION_BLOCKED"


class BlockchainAuditLogger:
    """
    Immutable audit logging using Hedera blockchain
    """

    def __init__(self):
        """Initialize blockchain audit logger"""
        self.hedera_client = get_hedera_client()
        self.audit_logs: List[Dict] = []
        self.topic_id = None

        print("\n" + "="*70)
        print("📋 BLOCKCHAIN AUDIT LOGGER INITIALIZED")
        print("="*70 + "\n")

    def setup_topic(self) -> bool:
        """
        Create Hedera topic for audit logs
        
        Returns:
            True if successful
        """
        result = self.hedera_client.create_topic("AIxCyber Security Audit Trail")
        
        if result.get('success'):
            self.topic_id = result.get('topic_id')
            return True
        return False

    def log_event(
        self,
        event_type: AuditEventType,
        user_id: str,
        description: str,
        metadata: Optional[Dict] = None,
        on_blockchain: bool = True
    ) -> Dict:
        """
        Log security event (locally and to blockchain)
        
        Args:
            event_type: Type of event
            user_id: User involved
            description: Event description
            metadata: Additional data
            on_blockchain: Whether to log to Hedera
            
        Returns:
            Dict with log details and transaction info
        """
        log_entry = {
            'id': self._generate_log_id(),
            'timestamp': datetime.now().isoformat(),
            'event_type': event_type.value,
            'user_id': user_id,
            'description': description,
            'metadata': metadata or {},
            'hash': None,
        }

        # Generate hash
        log_entry['hash'] = self._hash_log(log_entry)

        # Store locally
        self.audit_logs.append(log_entry)

        # Log to blockchain
        blockchain_result = None
        if on_blockchain and self.topic_id:
            blockchain_result = self.hedera_client.submit_audit_log(log_entry)

        return {
            'success': True,
            'log_entry': log_entry,
            'blockchain': blockchain_result or {'mock': True},
            'stored_locally': len(self.audit_logs),
        }

    def log_kyc_event(self, user_id: str, status: str, details: Dict = None) -> Dict:
        """Log KYC verification event"""
        event_type = AuditEventType.KYC_VERIFIED if status == "VERIFIED" else AuditEventType.KYC_REJECTED
        return self.log_event(
            event_type=event_type,
            user_id=user_id,
            description=f"KYC verification: {status}",
            metadata=details or {}
        )

    def log_login_event(self, user_id: str, success: bool, ip_address: str) -> Dict:
        """Log login event"""
        event_type = AuditEventType.LOGIN_SUCCESS if success else AuditEventType.LOGIN_FAILED
        return self.log_event(
            event_type=event_type,
            user_id=user_id,
            description=f"Login attempt from {ip_address}",
            metadata={'ip_address': ip_address, 'success': success}
        )

    def log_2fa_event(self, user_id: str, action: str, method: str) -> Dict:
        """Log 2FA event"""
        if action == "enabled":
            event_type = AuditEventType.MFA_ENABLED
        elif action == "sent":
            event_type = AuditEventType.MFA_CODE_SENT
        else:
            event_type = AuditEventType.MFA_VERIFIED

        return self.log_event(
            event_type=event_type,
            user_id=user_id,
            description=f"2FA {action} via {method}",
            metadata={'action': action, 'method': method}
        )

    def log_session_event(self, user_id: str, action: str, ip_address: str) -> Dict:
        """Log session event"""
        event_map = {
            'created': AuditEventType.SESSION_CREATED,
            'expired': AuditEventType.SESSION_EXPIRED,
            'logout': AuditEventType.SESSION_LOGOUT,
        }
        event_type = event_map.get(action, AuditEventType.SESSION_CREATED)

        return self.log_event(
            event_type=event_type,
            user_id=user_id,
            description=f"Session {action}",
            metadata={'action': action, 'ip_address': ip_address}
        )

    def log_threat_event(self, threat_type: str, description: str, severity: str) -> Dict:
        """Log security threat event"""
        return self.log_event(
            event_type=AuditEventType.THREAT_DETECTED,
            user_id="SYSTEM",
            description=description,
            metadata={'threat_type': threat_type, 'severity': severity}
        )

    def log_transaction_event(
        self,
        user_id: str,
        approved: bool,
        transaction_id: str,
        amount: float,
        asset: str
    ) -> Dict:
        """Log transaction approval/blocking"""
        event_type = (
            AuditEventType.TRANSACTION_APPROVED 
            if approved 
            else AuditEventType.TRANSACTION_BLOCKED
        )
        return self.log_event(
            event_type=event_type,
            user_id=user_id,
            description=f"Transaction {transaction_id}: {amount} {asset}",
            metadata={
                'transaction_id': transaction_id,
                'amount': amount,
                'asset': asset,
                'approved': approved,
            }
        )

    def get_audit_trail(self, user_id: str = None) -> List[Dict]:
        """
        Get audit trail for user or all events
        
        Args:
            user_id: Optional - filter by user
            
        Returns:
            List of audit logs
        """
        if user_id:
            return [log for log in self.audit_logs if log['user_id'] == user_id]
        return self.audit_logs

    def verify_audit_integrity(self) -> Dict:
        """
        Verify audit logs haven't been tampered with
        
        Returns:
            Dict with integrity check results
        """
        print("\n🔍 VERIFYING AUDIT LOG INTEGRITY")
        print("="*70)

        issues = []
        for log in self.audit_logs:
            stored_hash = log.get('hash')
            recalc_hash = self._hash_log({
                k: v for k, v in log.items() if k != 'hash'
            })

            if stored_hash != recalc_hash:
                issues.append({
                    'log_id': log['id'],
                    'issue': 'Hash mismatch - log may be tampered',
                })

        print(f"✅ Audited {len(self.audit_logs)} logs")
        print(f"⚠️ Issues found: {len(issues)}")

        if issues:
            print(f"🚨 INTEGRITY COMPROMISED - {len(issues)} logs detected as modified!")
        else:
            print("✅ All logs verified - integrity maintained")

        print("="*70 + "\n")

        return {
            'total_logs': len(self.audit_logs),
            'issues_found': len(issues),
            'integrity_ok': len(issues) == 0,
            'issues': issues,
        }

    def export_audit_trail(self, filename: str = "audit_trail.json") -> Dict:
        """
        Export audit trail to JSON file
        
        Args:
            filename: Output filename
            
        Returns:
            Dict with export details
        """
        print(f"\n📥 EXPORTING AUDIT TRAIL: {filename}")
        print("="*70)

        try:
            with open(filename, 'w') as f:
                json.dump(self.audit_logs, f, indent=2)

            print(f"✅ Exported {len(self.audit_logs)} audit logs")
            print(f"📄 File: {filename}")
            print("="*70 + "\n")

            return {
                'success': True,
                'filename': filename,
                'logs_exported': len(self.audit_logs),
            }

        except Exception as e:
            print(f"❌ Export error: {e}\n")
            return {'success': False, 'error': str(e)}

    def get_statistics(self) -> Dict:
        """Get audit log statistics"""
        event_counts = {}
        for log in self.audit_logs:
            event_type = log['event_type']
            event_counts[event_type] = event_counts.get(event_type, 0) + 1

        unique_users = len(set(log['user_id'] for log in self.audit_logs))

        return {
            'total_events': len(self.audit_logs),
            'unique_users': unique_users,
            'event_types': event_counts,
            'timestamp': datetime.now().isoformat(),
        }

    def _hash_log(self, log_data: Dict) -> str:
        """Generate SHA256 hash of log"""
        log_str = json.dumps(log_data, sort_keys=True)
        return hashlib.sha256(log_str.encode()).hexdigest()

    def _generate_log_id(self) -> str:
        """Generate unique log ID"""
        timestamp = datetime.now().isoformat()
        return hashlib.md5(timestamp.encode()).hexdigest()[:16]


# Global audit logger instance
_audit_logger = None


def get_audit_logger() -> BlockchainAuditLogger:
    """Get or create global audit logger"""
    global _audit_logger
    if _audit_logger is None:
        _audit_logger = BlockchainAuditLogger()
    return _audit_logger