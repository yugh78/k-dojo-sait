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
