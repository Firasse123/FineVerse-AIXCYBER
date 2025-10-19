"""Basic anomaly / threat detector.
This module provides a simple rule-based detector that assigns a score to incoming events.
"""
from typing import Dict
import json
import math

from .security_config import SECURITY_EVENTS_LOG, ANOMALY_SCORE_THRESHOLD


class ThreatDetector:
    def __init__(self):
        # in-memory state for rate/geo baselines; extend as needed
        self.user_ips = {}

    def analyze_event(self, event: Dict) -> Dict:
        """Analyze an event and return a dict with score and flags.

        Event shape: {"user_id": str, "ip": str, "action": str, "timestamp": float}
        """
        score = 0.0
        reasons = []

        # Example heuristic: new IP for user -> small score
        user = event.get("user_id")
        ip = event.get("ip")
        if user and ip:
            prev = self.user_ips.get(user)
            if prev and prev != ip:
                score += 0.4
                reasons.append("new_ip")
            else:
                # set baseline
                self.user_ips[user] = ip

        # Suspicious actions
        action = event.get("action", "")
        if action in ("failed_login", "password_reset_requested"):
            score += 0.3
            reasons.append(action)

        # Rapid repeated events heuristic
        if event.get("repeat_count", 0) >= 5:
            score += 0.5
            reasons.append("rapid_events")

        # Normalize score to 0..1
        score = max(0.0, min(1.0, score))

        out = {"score": score, "reasons": reasons, "flagged": score >= ANOMALY_SCORE_THRESHOLD}

        # append to security events log
        try:
            with open(SECURITY_EVENTS_LOG, "a", encoding="utf-8") as fh:
                fh.write(json.dumps({**event, **out}) + "\n")
                fh.flush()
        except Exception:
            # best-effort logging; don't raise in detector
            pass

        return out
