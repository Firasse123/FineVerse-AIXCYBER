from src.kyc import verify_identity


def test_verify_identity_valid():
    doc = {"first_name": "Alice", "last_name": "Smith", "dob": "1990-01-01", "document_type": "passport", "document_number": "A12345"}
    assert verify_identity(doc) is True


def test_verify_identity_missing():
    doc = {"first_name": "A"}
    assert verify_identity(doc) is False
