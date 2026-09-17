"""Dedicated browser-test database; never reads or deletes the development database."""

import os
import sys
import uuid
import django
from django.core.management import call_command
from pathlib import Path

repo = Path(__file__).resolve().parent.parent
test_root = (repo / ".tools" / "e2e").resolve()
if not test_root.is_relative_to(repo.resolve()):
    raise RuntimeError("Invalid test data directory")
test_root.mkdir(parents=True, exist_ok=True)
port = sys.argv[1] if len(sys.argv) > 1 else "18000"
os.environ.update(
    {
        "DJANGO_SETTINGS_MODULE": "k_dojo.settings",
        "DJANGO_DEBUG": "true",
        "USE_SQLITE": "true",
        "TELEGRAM_BOT_TOKEN": "",
        "TELEGRAM_CHAT_ID": "",
        "SQLITE_DATABASE_PATH": str(test_root / f"{uuid.uuid4().hex}.sqlite3"),
        "CSRF_TRUSTED_ORIGINS": "http://127.0.0.1:13000",
    }
)

django.setup()

call_command("safe_migrate", verbosity=0)
call_command("seed_club", verbosity=0)
call_command("runserver", f"127.0.0.1:{port}", use_reloader=False)
