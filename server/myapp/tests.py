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

    def test_guard_refuses_nonempty_pre_0003_database(self):
        from django.core.management import call_command, CommandError

        executor = MigrationExecutor(connection)
        latest = executor.loader.graph.leaf_nodes()
        old = [("myapp", "0002_request")]
        executor.migrate(old)
        apps = executor.loader.project_state(old).apps
        legacy = apps.get_model("myapp", "Request").objects.create(
            name="Legacy",
            phone="123",
            email="test@example.invalid",
            subject="Keep subject",
            description="Keep description",
        )
        try:
            with self.assertRaises(CommandError):
                call_command("safe_migrate")
            with connection.cursor() as cursor:
                cursor.execute("SELECT description FROM myapp_request WHERE id = %s", [legacy.pk])
                self.assertEqual(cursor.fetchone()[0], "Keep description")
        finally:
            MigrationExecutor(connection).migrate(latest)
