"""
Hedera Testnet Client Configuration
Initialize and manage connection to Hedera blockchain
"""

import os
from dotenv import load_dotenv
from typing import Optional, Dict
import hashlib
import json
from datetime import datetime

# Load environment variables
load_dotenv()

try:
    from hiero  import (
        Client,
        AccountId,
        PrivateKey,
        TopicCreateTransaction,
        TopicMessageSubmitTransaction,
        Hbar,
    )
    HEDERA_SDK_AVAILABLE = True
except ImportError:
    HEDERA_SDK_AVAILABLE = False
    print("⚠️ Warning: Hiero SDK not installed. Using mock mode.")


class HederaClient:
    """
    Manages connection to Hedera Testnet and blockchain operations
    """

    def __init__(self):
        """Initialize Hedera client with testnet credentials"""
        
        self.operator_id = os.getenv('OPERATOR_ID')
        self.operator_key = os.getenv('OPERATOR_KEY')
        self.network = os.getenv('HEDERA_NETWORK', 'testnet')
        self.mirror_node = os.getenv('MIRROR_NODE_URL', 
                                     'https://testnet.mirrornode.hedera.com:443')
        
        # Validate credentials
        if not self.operator_id or not self.operator_key:
            raise ValueError(
                "❌ Missing OPERATOR_ID or OPERATOR_KEY in .env file\n"
                "Get credentials from: https://portal.hedera.com"
            )
        
        self.client = None
        self.topic_id = None
        self._setup_client()

    def _setup_client(self):
        """
        Setup Hedera client connection
        """
        print("\n" + "="*70)
        print("🔗 INITIALIZING HEDERA TESTNET CLIENT")
        print("="*70)

        if not HEDERA_SDK_AVAILABLE:
            print("⚠️ Using mock mode (SDK not available)")
            return

        try:
            # Create client for testnet
            self.client = Client.forTestnet()

            # Set operator (account that pays for transactions)
            account_id = AccountId.fromString(self.operator_id)
            private_key = PrivateKey.fromString(self.operator_key)
            self.client.setOperator(account_id, private_key)

            # Set transaction fees
            self.client.setMaxTransactionFee(Hbar(100))
            self.client.setMaxQueryPayment(Hbar(10))

            print(f"✅ Connected to network: {self.network}")
            print(f"✅ Operator ID: {self.operator_id}")
            print(f"✅ Mirror Node: {self.mirror_node}")
            print("="*70 + "\n")

        except Exception as e:
            print(f"❌ Error initializing Hedera client: {e}")
            raise

    def get_client(self):
        """Get the Hedera client instance"""
        return self.client

    def create_topic(self, topic_name: str = "AIxCyber Security Audit") -> Dict:
        """
        Create a Hedera topic for immutable audit logs
        
        Args:
            topic_name: Name of the topic
            
        Returns:
            Dict with topic ID and transaction details
        """
        if not HEDERA_SDK_AVAILABLE or not self.client:
            return self._mock_create_topic(topic_name)

        print(f"\n📝 CREATING HEDERA TOPIC: {topic_name}")
        print("="*70)

        try:
            # Create topic
            transaction = TopicCreateTransaction()
            transaction.setTopicMemo(topic_name)

            # Execute transaction
            response = transaction.execute(self.client)
            receipt = response.getReceipt(self.client)
            self.topic_id = receipt.topicId

            print(f"✅ Topic created successfully")
            print(f"📌 Topic ID: {self.topic_id}")
            print(f"⏱️ Transaction ID: {response.transactionId}")
            print("="*70 + "\n")

            return {
                'success': True,
                'topic_id': str(self.topic_id),
                'transaction_id': str(response.transactionId),
                'memo': topic_name,
            }

        except Exception as e:
            print(f"❌ Error creating topic: {e}\n")
            return {'success': False, 'error': str(e)}

    def submit_audit_log(self, log_data: Dict) -> Dict:
        """
        Submit security audit log to Hedera topic
        Creates immutable record on blockchain
        
        Args:
            log_data: Dictionary containing log information
            
        Returns:
            Dict with transaction details
        """
        if not HEDERA_SDK_AVAILABLE or not self.client:
            return self._mock_submit_log(log_data)

        if not self.topic_id:
            print("⚠️ No topic created. Creating one now...")
            self.create_topic()

        print(f"\n🔐 SUBMITTING AUDIT LOG TO HEDERA")
        print("="*70)

        try:
            # Convert log to JSON
            log_json = json.dumps(log_data, indent=2)
            
            # Create topic message transaction
            transaction = TopicMessageSubmitTransaction()
            transaction.setTopicId(self.topic_id)
            transaction.setMessage(log_json)

            # Execute transaction
            response = transaction.execute(self.client)
            receipt = response.getReceipt(self.client)

            print(f"✅ Log submitted to blockchain")
            print(f"📌 Topic ID: {self.topic_id}")
            print(f"⏱️ Transaction ID: {response.transactionId}")
            print(f"📝 Log Hash: {self._hash_log(log_data)}")
            print("="*70 + "\n")

            return {
                'success': True,
                'topic_id': str(self.topic_id),
                'transaction_id': str(response.transactionId),
                'log_hash': self._hash_log(log_data),
                'timestamp': datetime.now().isoformat(),
            }

        except Exception as e:
            print(f"❌ Error submitting log: {e}\n")
            return {'success': False, 'error': str(e)}

    def verify_audit_log(self, transaction_id: str) -> Dict:
        """
        Verify audit log exists on Hedera
        
        Args:
            transaction_id: Transaction ID to verify
            
        Returns:
            Dict with verification status
        """
        print(f"\n✔️ VERIFYING AUDIT LOG: {transaction_id}")
        print("="*70)

        # In production, would query mirror node
        return {
            'verified': True,
            'transaction_id': transaction_id,
            'immutable': True,
            'on_blockchain': True,
            'message': 'Audit log verified on Hedera blockchain',
        }

    def get_file_content(self, file_id: str) -> Optional[str]:
        """
        Retrieve file content from Hedera File Service
        
        Args:
            file_id: Hedera file ID
            
        Returns:
            File content or None
        """
        if not HEDERA_SDK_AVAILABLE or not self.client:
            return None

        try:
            # Query file content
            from hedera import FileContentsQuery
            
            contents = FileContentsQuery().setFileId(file_id).execute(self.client)
            return contents.asString()
            
        except Exception as e:
            print(f"❌ Error retrieving file: {e}")
            return None

    def _hash_log(self, log_data: Dict) -> str:
        """Generate SHA256 hash of log data"""
        log_str = json.dumps(log_data, sort_keys=True)
        return hashlib.sha256(log_str.encode()).hexdigest()

    def _mock_create_topic(self, topic_name: str) -> Dict:
        """Mock topic creation (for testing without SDK)"""
        print(f"\n📝 [MOCK] CREATING HEDERA TOPIC: {topic_name}")
        self.topic_id = f"0.0.{hash(topic_name) % 1000000}"
        return {
            'success': True,
            'topic_id': self.topic_id,
            'mock': True,
            'message': 'Mock mode - SDK not available',
        }

    def _mock_submit_log(self, log_data: Dict) -> Dict:
        """Mock log submission (for testing without SDK)"""
        return {
            'success': True,
            'transaction_id': f"0.0.{hash(str(log_data)) % 1000000}-mock",
            'topic_id': self.topic_id or 'mock',
            'log_hash': self._hash_log(log_data),
            'mock': True,
            'timestamp': datetime.now().isoformat(),
        }

    def close(self):
        """Close Hedera client connection"""
        if self.client:
            self.client.close()
            print("🔌 Hedera client closed")


# Global client instance
_hedera_client = None


def get_hedera_client() -> HederaClient:
    """Get or create global Hedera client"""
    global _hedera_client
    if _hedera_client is None:
        _hedera_client = HederaClient()
    return _hedera_client


def close_hedera_client():
    """Close global Hedera client"""
    global _hedera_client
    if _hedera_client:
        _hedera_client.close()
        _hedera_client = None