import pytest

from src.two_fa import generate_totp_secret, get_totp_token, verify_totp


def test_totp_flow():
    secret = generate_totp_secret()
    token = get_totp_token(secret)
    assert verify_totp(secret, token) is True


def test_verify_wrong_token():
    secret = generate_totp_secret()
    assert not verify_totp(secret, "000000")
