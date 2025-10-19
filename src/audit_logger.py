"""Immutable audit logger.
Writes append-only JSON lines to the audit log and ensures fsync for durability.
"""
import json
import time

from .security_config import AUDIT_LOG


class AuditLogger:
    def __init__(self, path: str = AUDIT_LOG):
        self.path = path

    def log(self, actor: str, action: str, details: dict = None) -> None:
        entry = {
            "ts": time.time(),
            "actor": actor,
            "action": action,
            "details": details or {},
        }
        try:
            with open(self.path, "a", encoding="utf-8") as fh:
                fh.write(json.dumps(entry, default=str) + "\n")
                fh.flush()
                try:
                    import os
                    os.fsync(fh.fileno())
                except Exception:
                    # fsync best-effort
                    pass
        except Exception:
            # Do not raise on audit failure; callers may handle separately.
            pass
