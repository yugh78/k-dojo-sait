"""Verify a NEW PostgreSQL cluster, migrations and backup/restore; never use an existing DB."""

import argparse
import json
import os
from pathlib import Path
import secrets
import socket
import subprocess
import sys
import tempfile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bin", required=True, type=Path, help="Directory containing initdb/pg_ctl")
    parser.add_argument("--port", type=int, default=15432)
    args = parser.parse_args()
    binaries = args.bin.resolve()
    repo = Path(__file__).resolve().parent.parent
    suffix = ".exe" if os.name == "nt" else ""
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", args.port))
    for name in ["initdb", "pg_ctl", "createdb", "pg_dump", "pg_restore"]:
        if not (binaries / (name + suffix)).is_file():
            parser.error(f"Missing PostgreSQL binary: {name}")
    checks = repo / ".tools" / "postgres-checks"
    checks.mkdir(parents=True, exist_ok=True)
    work = Path(tempfile.mkdtemp(prefix="run-", dir=checks))
    data = work / "data"
    password = secrets.token_urlsafe(32)
    password_file = work / "password.txt"
    password_file.write_text(password, encoding="ascii")
    password_file.chmod(0o600)
    env = {
        **os.environ,
        "DJANGO_DEBUG": "true",
        "DJANGO_SECRET_KEY": secrets.token_urlsafe(64),
        "DJANGO_ALLOWED_HOSTS": "localhost,127.0.0.1,testserver",
        "USE_SQLITE": "false",
        "POSTGRES_DB": "kdojo_check",
        "POSTGRES_USER": "kdojo_check",
        "POSTGRES_PASSWORD": password,
        "DATABASE_HOST": "127.0.0.1",
        "DATABASE_PORT": str(args.port),
        "PGHOST": "127.0.0.1",
        "PGPORT": str(args.port),
        "PGUSER": "kdojo_check",
        "PGPASSWORD": password,
        "TELEGRAM_BOT_TOKEN": "",
        "TELEGRAM_CHAT_ID": "",
        "PYTHONUTF8": "1",
    }

    def run(command):
        subprocess.run([str(part) for part in command], cwd=repo, env=env, check=True)

    def pg(name, *arguments):
        run([binaries / (name + suffix), *arguments])

    def django(*arguments):
        run([sys.executable, "server/manage.py", *arguments])

    try:
        pg(
            "initdb",
            "-D",
            data,
            "-U",
            "kdojo_check",
            "--pwfile",
            password_file,
            "--auth=scram-sha-256",
            "--encoding=UTF8",
            "--locale=C",
        )
        pg(
            "pg_ctl",
            "-D",
            data,
            "-l",
            work / "postgres.log",
            "-o",
            f"-h 127.0.0.1 -p {args.port}",
            "-w",
            "start",
        )
        pg("createdb", "kdojo_check")
        django("safe_migrate")
        django("seed_club")
        django("check")
        django("test", "club", "myapp", "--noinput")
        django(
            "shell",
            "-c",
            """
from django.test import Client
from myapp.models import Request
client = Client(enforce_csrf_checks=True)
assert client.get('/api/health/').status_code == 200
csrf = client.get('/api/csrf/').json()['csrfToken']
response = client.post('/api/applications/', {'name': 'PostgreSQL verification', 'phone': '+79990000000', 'age': 20, 'consent': True}, content_type='application/json', HTTP_X_CSRFTOKEN=csrf)
assert response.status_code == 201, response.content
assert Request.objects.count() == 1
print('Application saved through the CSRF-protected API in isolated PostgreSQL.')
""",
        )
        django("dumpdata", "club", "myapp", "--output", str(work / "before.json"))
        pg("pg_dump", "-Fc", "-f", work / "verification.dump", "kdojo_check")
        pg("createdb", "kdojo_restored")
        pg("pg_restore", "--exit-on-error", "-d", "kdojo_restored", work / "verification.dump")
        env["POSTGRES_DB"] = "kdojo_restored"
        django("safe_migrate")
        django("dumpdata", "club", "myapp", "--output", str(work / "after.json"))
        before = json.loads((work / "before.json").read_text(encoding="utf-8"))
        after = json.loads((work / "after.json").read_text(encoding="utf-8"))
        if before != after:
            raise RuntimeError("Restored club/application records differ from the original")
        print(f"PASS: {len(before)} records including relationships and application fields preserved.")
        print(f"Synthetic database and backup retained at {work}")
    finally:
        # Only this newly created cluster can be stopped; no existing data is removed.
        if (data / "postmaster.pid").exists():
            pg("pg_ctl", "-D", data, "-m", "fast", "-w", "stop")
        password_file.write_text("", encoding="ascii")


if __name__ == "__main__":
    main()
