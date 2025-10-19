from src.session_manager import SessionManager


def test_session_create_validate():
    sm = SessionManager()
    token = sm.create_session("user1")
    assert sm.validate_session(token) == "user1"
    sm.destroy_session(token)
    assert sm.validate_session(token) is None


def test_rate_limit():
    sm = SessionManager()
    key = "ip:1"
    # allow many requests under default limit
    allowed = [sm.check_rate_limit(key) for _ in range(5)]
    assert all(allowed)
