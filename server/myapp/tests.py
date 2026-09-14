from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TransactionTestCase


class LegacyMigrationTests(TransactionTestCase):
    def test_existing_request_survives_additive_migration(self):
        executor = MigrationExecutor(connection)
        latest = executor.loader.graph.leaf_nodes()
        old = [("myapp", "0003_remove_request_description_remove_request_email_and_more")]
        executor.migrate(old)
        apps = executor.loader.project_state(old).apps
        request = apps.get_model("myapp", "Request").objects.create(
            name="Legacy", phone="123", message="Keep"
        )
        original = (request.pk, request.created_at)
        try:
            executor = MigrationExecutor(connection)
            executor.migrate(latest)
            apps = executor.loader.project_state(latest).apps
            saved = apps.get_model("myapp", "Request").objects.get(pk=original[0])
            self.assertEqual(saved.message, "Keep")
            self.assertEqual(saved.phone, "123")
            self.assertEqual(saved.created_at, original[1])
            self.assertEqual(saved.status, "new")
        finally:
            MigrationExecutor(connection).migrate(latest)
