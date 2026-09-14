"""Optional provider; notification failure must never roll back an application."""

import json
import logging
from urllib.request import Request, urlopen
from django.conf import settings

logger = logging.getLogger(__name__)


class TelegramProvider:
    def send(self, application_id):
        payload = json.dumps(
            {
                "chat_id": settings.TELEGRAM_CHAT_ID,
                "text": f"Новая заявка K-Dojo #{application_id}. Откройте Django Admin.",
            }
        ).encode()
        req = Request(
            f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage",
            data=payload,
            headers={"Content-Type": "application/json"},
        )
        with urlopen(req, timeout=3) as response:
            if response.status != 200:
                raise RuntimeError("Notification failed")


def notify_application(application_id):
    if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_CHAT_ID:
        return
    try:
        TelegramProvider().send(application_id)
    except Exception:
        # Do not log request URL: it contains the bot token.
        logger.warning("Application %s saved; notification unavailable", application_id)
