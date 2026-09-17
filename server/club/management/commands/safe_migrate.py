"""Refuse the historical destructive migration when legacy requests exist."""

from django.core.management import BaseCommand, CommandError, call_command
from django.db import connection


class Command(BaseCommand):
    help = "Migrate new/current databases; refuse nonempty pre-0003 legacy databases"

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            tables = connection.introspection.table_names(cursor)
            if "myapp_request" in tables:
                columns = {
                    column.name
                    for column in connection.introspection.get_table_description(cursor, "myapp_request")
                }
                if "description" in columns:
                    cursor.execute("SELECT COUNT(*) FROM myapp_request")
                    if cursor.fetchone()[0]:
                        raise CommandError(
                            "Legacy pre-0003 requests found. STOP: make and verify pg_dump, export legacy columns, rehearse conversion on a restored copy. See docs/v2-migration-plan.md. No migrations applied."
                        )
        call_command("migrate", interactive=False)
        call_command("createcachetable")
