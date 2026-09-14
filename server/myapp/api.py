import re
from django.conf import settings
from django.db import transaction
from django.middleware.csrf import get_token
from django.utils import timezone
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from django.http import JsonResponse
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle
from club.api import public
from club.models import Program, Location, TrainingGroup, SiteSettings
from .models import Request
from .notifications import notify_application


class ApplicationThrottle(SimpleRateThrottle):
    scope = "applications"

    def get_cache_key(self, request, view):
        # Reverse proxy must replace X-Real-IP, never append client-supplied values.
        ident = request.META.get("HTTP_X_REAL_IP") or request.META.get("REMOTE_ADDR", "")
        return self.cache_format % {"scope": self.scope, "ident": ident}


class ApplicationSerializer(serializers.ModelSerializer):
    consent = serializers.BooleanField()
    website = serializers.CharField(required=False, allow_blank=True, write_only=True)
    phone = serializers.CharField(max_length=30)
    age = serializers.IntegerField(min_value=1, max_value=120, required=False, allow_null=True)
    program = serializers.PrimaryKeyRelatedField(queryset=public(Program), allow_null=True, required=False)
    location = serializers.PrimaryKeyRelatedField(queryset=public(Location), allow_null=True, required=False)
    training_group = serializers.PrimaryKeyRelatedField(
        queryset=public(TrainingGroup), allow_null=True, required=False
    )
    message = serializers.CharField(max_length=2000, allow_blank=True, required=False)

    class Meta:
        model = Request
        fields = [
            "name",
            "phone",
            "age",
            "program",
            "location",
            "training_group",
            "message",
            "source_page",
            "utm_source",
            "utm_medium",
            "utm_campaign",
            "consent",
            "website",
        ]

    def validate_phone(self, value):
        digits = re.sub(r"[\s()+-]", "", value)
        if not digits.isdigit() or not 10 <= len(digits) <= 15:
            raise serializers.ValidationError("Укажите телефон: от 10 до 15 цифр.")
        if len(digits) == 11 and digits.startswith("8"):
            digits = "7" + digits[1:]
        return "+" + digits

    def validate(self, attrs):
        if not attrs.pop("consent"):
            raise serializers.ValidationError({"consent": "Необходимо согласие."})
        if attrs.pop("website", ""):
            raise serializers.ValidationError({"website": "Не удалось отправить форму."})
        program, group, location = attrs.get("program"), attrs.get("training_group"), attrs.get("location")
        if group and (not program or group.program_id != program.pk):
            raise serializers.ValidationError({"training_group": "Группа не соответствует направлению."})
        if location and program and not location.programs.filter(pk=program.pk).exists():
            raise serializers.ValidationError({"location": "Зал не соответствует направлению."})
        return attrs


@ensure_csrf_cookie
def csrf(request):
    return JsonResponse({"csrfToken": get_token(request)})


# Enforce CSRF inside the DRF wrapper, including anonymous requests.
@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([ApplicationThrottle])
@csrf_protect
def create_application(request):
    site = SiteSettings.objects.first()
    if not settings.DEBUG and (
        not site or not site.legal_ready or not site.consent_text or not site.privacy_text
    ):
        return Response(
            {"errors": {"form": "Онлайн-запись временно недоступна. Позвоните в клуб."}}, status=503
        )
    serializer = ApplicationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        application = serializer.save(
            consent_at=timezone.now(), consent_text=site.consent_text if site else "Development consent"
        )
        transaction.on_commit(lambda: notify_application(application.pk))
    return Response(
        {"id": application.pk, "message": "Спасибо! Заявка сохранена. Мы свяжемся с вами."}, status=201
    )
