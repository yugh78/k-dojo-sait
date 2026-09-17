from datetime import date, timedelta
from django.core.cache import cache
from django.core.management import call_command
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from club import models as m
from myapp.models import Request


@override_settings(
    DEBUG=True, CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
)
class PublicAPITests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_club", verbosity=0)

    def setUp(self):
        cache.clear()
        self.client = APIClient(enforce_csrf_checks=True)

    def token(self):
        return self.client.get("/api/csrf/").json()["csrfToken"]

    def application(self, **changes):
        data = {"name": "Тест", "phone": "+7 (999) 123-45-67", "age": 6, "consent": True}
        data.update(changes)
        return self.client.post("/api/applications/", data, format="json", HTTP_X_CSRFTOKEN=self.token())

    def test_application_saved_and_normalized(self):
        response = self.application()
        self.assertEqual(response.status_code, 201, response.content)
        item = Request.objects.get()
        self.assertEqual(item.phone, "+79991234567")
        self.assertIsNotNone(item.consent_at)
        self.assertNotIn("admin_comment", response.json())

    def test_missing_csrf(self):
        self.assertEqual(self.client.post("/api/applications/", {}, format="json").status_code, 403)

    def test_bad_fields_and_consent(self):
        for changes in [{"phone": "bad"}, {"consent": False}, {"age": -1}, {"website": "spam"}, {"name": ""}]:
            self.assertEqual(self.application(**changes).status_code, 400)
        self.assertEqual(Request.objects.count(), 0)

    def test_rate_limit(self):
        for _ in range(5):
            self.assertEqual(self.application().status_code, 201)
        self.assertEqual(self.application().status_code, 429)

    def test_schedule_filters_and_joint_coaches(self):
        rows = self.client.get("/api/schedule/?program=bjj").json()
        self.assertEqual(len(rows), 3)
        self.assertTrue(all(r["program"]["slug"] == "bjj" for r in rows))
        joint = self.client.get("/api/schedule/?program=kyokushin&weekday=1").json()
        self.assertEqual(len(joint[0]["coaches"]), 2)
        self.assertEqual(self.client.get("/api/schedule/?age=invalid").status_code, 400)

    def test_pricing_and_expiration(self):
        self.assertEqual(len(self.client.get("/api/pricing/").json()), 5)
        plan = m.PricingPlan.objects.get(slug="twice")
        plan.valid_until = date.today() - timedelta(days=1)
        plan.save()
        self.assertEqual(len(self.client.get("/api/pricing/").json()), 4)

    def test_drafts_demo_and_private_athletes_hidden(self):
        p = m.Program.objects.get(slug="bjj")
        event = m.Event.objects.create(
            title="Draft", slug="draft", start_date=date.today(), event_type="club"
        )
        self.assertEqual(self.client.get("/api/events/draft/").status_code, 404)
        event.is_published = True
        event.save()
        self.assertEqual(self.client.get("/api/events/draft/").status_code, 200)
        event.is_demo = True
        event.save()
        self.assertEqual(self.client.get("/api/events/draft/").status_code, 404)
        athlete = m.Athlete.objects.create(full_name="Private", program=p)
        competition = m.Competition.objects.create(
            title="Cup", slug="cup", date=date.today(), program=p, is_published=True
        )
        m.CompetitionResult.objects.create(athlete=athlete, competition=competition, category="Test", place=1)
        self.assertEqual(self.client.get("/api/results/").json(), [])

    def test_no_public_application_list_or_admin(self):
        self.assertEqual(self.client.get("/api/applications/").status_code, 405)
        self.assertEqual(self.client.get("/admin/myapp/request/").status_code, 302)

    def test_nonstandard_age_is_accepted(self):
        self.assertEqual(
            self.application(program=m.Program.objects.get(slug="mowgli").pk, age=8).status_code, 201
        )

    def test_seed_preserves_edits(self):
        p = m.PricingPlan.objects.get(slug="twice")
        p.price = 123
        p.save()
        call_command("seed_club", verbosity=0)
        p.refresh_from_db()
        self.assertEqual(p.price, 123)
        self.assertEqual(m.ScheduleEntry.objects.count(), 24)

    def test_draft_nested_gallery_hidden_and_media_urls_relative(self):
        album = m.GalleryAlbum.objects.create(title="Draft", slug="private", category="club")
        m.Event.objects.create(
            title="Public",
            slug="public",
            start_date=date.today(),
            event_type="club",
            is_published=True,
            gallery=album,
        )
        self.assertIsNone(self.client.get("/api/events/public/").json()["gallery"])
        program = m.Program.objects.get(slug="bjj")
        program.image = "programs/test.webp"
        program.save()
        self.assertEqual(self.client.get("/api/programs/bjj/").json()["image"], "/media/programs/test.webp")

    def test_notification_failure_preserves_application(self):
        from unittest.mock import patch

        with override_settings(TELEGRAM_BOT_TOKEN="test-token", TELEGRAM_CHAT_ID="test-chat"):
            with patch("myapp.notifications.TelegramProvider.send", side_effect=RuntimeError("unavailable")):
                with self.captureOnCommitCallbacks(execute=True):
                    self.assertEqual(self.application().status_code, 201)
        self.assertEqual(Request.objects.count(), 1)

    def test_production_legal_configuration(self):
        with override_settings(DEBUG=False):
            self.assertEqual(self.application().status_code, 503)
            site = m.SiteSettings.objects.get()
            site.legal_ready = True
            site.privacy_text = "Test policy"
            site.consent_text = "Test consent"
            site.save()
            self.assertEqual(self.application().status_code, 201)


@override_settings(DEBUG=True)
class AdminAccessTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        from django.contrib.auth import get_user_model

        cls.owner = get_user_model().objects.create_superuser(
            username="test-owner", email="owner@example.invalid", password="test-only-password"
        )
        cls.staff = get_user_model().objects.create_user(
            username="test-staff", password="test-only-password", is_staff=True
        )
        call_command("seed_club", verbosity=0)
        cls.application = Request.objects.create(name="Admin test", phone="+79990000000", message="Keep")

    def test_owner_can_open_content_forms_but_cannot_delete_requests(self):
        from django.contrib import admin
        from django.urls import reverse

        self.client.force_login(self.owner)
        for model in admin.site._registry:
            meta = model._meta
            if meta.app_label not in {"club", "myapp"}:
                continue
            route = f"admin:{meta.app_label}_{meta.model_name}"
            with self.subTest(model=meta.label):
                self.assertEqual(self.client.get(reverse(route + "_changelist")).status_code, 200)
                obj = model.objects.first()
                form = reverse(route + "_change", args=[obj.pk]) if obj else reverse(route + "_add")
                self.assertEqual(self.client.get(form).status_code, 200)
        deletion = reverse("admin:myapp_request_delete", args=[self.application.pk])
        self.assertEqual(self.client.post(deletion, {"post": "yes"}).status_code, 403)
        self.assertTrue(Request.objects.filter(pk=self.application.pk).exists())

    def test_staff_requires_model_permissions(self):
        self.client.force_login(self.staff)
        self.assertEqual(self.client.get("/admin/club/program/").status_code, 403)
        self.assertEqual(self.client.get("/admin/myapp/request/").status_code, 403)
