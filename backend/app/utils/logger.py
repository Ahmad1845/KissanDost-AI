import json
import logging
from datetime import datetime
from typing import Any


class StructuredLogger:
    """Production JSON structured logger for AI pipeline observability."""

    def __init__(self, service_name: str = "kissandost-fastapi") -> None:
        self.service_name = service_name
        self._logger = logging.getLogger(service_name)
        if not self._logger.handlers:
            handler = logging.StreamHandler()
            self._logger.addHandler(handler)
            self._logger.setLevel(logging.INFO)

    def info(self, event: str, **kwargs: Any) -> None:
        payload = {
            "level": "INFO",
            "timestamp": datetime.utcnow().isoformat(),
            "service": self.service_name,
            "event": event,
            **kwargs,
        }
        self._logger.info(json.dumps(payload))

    def warning(self, event: str, **kwargs: Any) -> None:
        payload = {
            "level": "WARN",
            "timestamp": datetime.utcnow().isoformat(),
            "service": self.service_name,
            "event": event,
            **kwargs,
        }
        self._logger.warning(json.dumps(payload))

    def error(self, event: str, **kwargs: Any) -> None:
        payload = {
            "level": "ERROR",
            "timestamp": datetime.utcnow().isoformat(),
            "service": self.service_name,
            "event": event,
            **kwargs,
        }
        self._logger.error(json.dumps(payload))


logger = StructuredLogger()
