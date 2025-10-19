"""
Security Configuration Constants
"""

# ============ SESSION CONFIG ============
MAX_LOGIN_ATTEMPTS = 5
LOGIN_ATTEMPT_WINDOW = 15 * 60  # 15 minutes in seconds
SESSION_TIMEOUT = 30 * 60  # 30 minutes in seconds
BLOCK_DURATION = 60 * 60  # 1 hour in seconds

# ============ KYC CONFIG ============
KYC_VERIFICATION_REQUIRED = True
ALLOWED_ID_TYPES = ["PASSPORT", "NATIONAL_ID", "DRIVER_LICENSE"]

# ============ 2FA CONFIG ============
TWO_FA_METHODS = ["SMS", "AUTHENTICATOR_APP", "EMAIL"]
TWO_FA_CODE_LENGTH = 6
TWO_FA_EXPIRY = 5 * 60  # 5 minutes in seconds
MAX_2FA_ATTEMPTS = 3

# ============ PASSWORD CONFIG ============
MIN_PASSWORD_LENGTH = 12
REQUIRE_SPECIAL_CHARS = True
REQUIRE_NUMBERS = True
REQUIRE_UPPERCASE = True

# ============ THREAT DETECTION ============
ANOMALY_THRESHOLD = 0.7  # 70% confidence to flag as anomaly
SUSPICIOUS_LOGIN_LOCATIONS = ["CN", "RU", "KP"]  # Country codes
MAX_CONCURRENT_SESSIONS = 3

# ============ AUDIT LOGGING ============
AUDIT_LOG_FILE = "logs/audit.log"
ENABLE_BLOCKCHAIN_LOGGING = True  # For immutable records

# ============ ENCRYPTION ============
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
SECRET_KEY = "your-secret-key-change-in-production"  # ⚠️ CHANGE THIS

# ============ RATE LIMITING ============
API_RATE_LIMIT = 100  # requests per minute
TRANSACTION_RATE_LIMIT = 10  # transactions per minute