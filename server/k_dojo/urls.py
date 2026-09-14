from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.db import connection
from django.http import JsonResponse
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from club import api
from myapp.api import csrf, create_application


def health(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception:
        return JsonResponse({"status": "unavailable"}, status=503)
    return JsonResponse({"status": "ok"})


router = DefaultRouter()
for prefix, view in [
    ("programs", api.ProgramViewSet),
    ("coaches", api.CoachViewSet),
    ("locations", api.LocationViewSet),
    ("schedule", api.ScheduleViewSet),
    ("pricing", api.PricingViewSet),
    ("discounts", api.DiscountViewSet),
    ("events", api.EventViewSet),
    ("competitions", api.CompetitionViewSet),
    ("results", api.ResultViewSet),
    ("gallery", api.GalleryViewSet),
    ("faq", api.FAQViewSet),
    ("settings", api.SettingsViewSet),
]:
    router.register(prefix, view, basename=prefix)
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/csrf/", csrf),
    path("api/applications/", create_application),
    path("applications/create/", create_application),
    path("api/health/", health),
    path("api/", include(router.urls)),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
