from django.db.models import Q
from django.utils import timezone
from rest_framework import serializers, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.views import exception_handler as drf_exception_handler
from . import models as m


def exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    if response is not None:
        response.data = {"errors": response.data}
    return response


def public(model):
    qs = model.objects.all()
    fields = {f.name for f in model._meta.fields}
    if "is_demo" in fields:
        qs = qs.filter(is_demo=False)
    if "is_active" in fields:
        qs = qs.filter(is_active=True)
    if "is_published" in fields:
        qs = qs.filter(is_published=True)
    if "valid_from" in fields:
        today = timezone.localdate()
        qs = qs.filter(
            Q(valid_from__isnull=True) | Q(valid_from__lte=today),
            Q(valid_until__isnull=True) | Q(valid_until__gte=today),
        )
    return qs


def serializer(model, fields):
    return type(
        model.__name__ + "Serializer",
        (serializers.ModelSerializer,),
        {"Meta": type("Meta", (), {"model": model, "fields": fields})},
    )


ProgramSerializer = serializer(
    m.Program,
    [
        "id",
        "name",
        "slug",
        "short_description",
        "description",
        "audience",
        "minimum_age",
        "maximum_age",
        "training_steps",
        "first_training",
        "equipment",
        "image",
        "accent",
    ],
)
CertificateSerializer = serializer(m.Certificate, ["id", "title", "image"])


class CoachSerializer(serializers.ModelSerializer):
    programs = serializers.SlugRelatedField(many=True, read_only=True, slug_field="slug")
    certificates = serializers.SerializerMethodField()

    def get_certificates(self, obj):
        return CertificateSerializer(
            obj.certificates.filter(is_demo=False), many=True, context=self.context
        ).data

    class Meta:
        model = m.Coach
        fields = [
            "id",
            "full_name",
            "slug",
            "photo",
            "short_description",
            "biography",
            "qualifications",
            "achievements",
            "experience",
            "programs",
            "certificates",
        ]


LocationSerializer = serializer(
    m.Location,
    [
        "id",
        "name",
        "slug",
        "address",
        "latitude",
        "longitude",
        "entrance",
        "phone",
        "route_url",
        "programs",
        "photo",
    ],
)
GroupSerializer = serializer(
    m.TrainingGroup, ["id", "name", "program", "minimum_age", "maximum_age", "audience"]
)


class ScheduleSerializer(serializers.ModelSerializer):
    program = ProgramSerializer(read_only=True)
    coaches = CoachSerializer(many=True, read_only=True)
    location = LocationSerializer(read_only=True)
    training_group = GroupSerializer(read_only=True)

    class Meta:
        model = m.ScheduleEntry
        fields = [
            "id",
            "program",
            "training_group",
            "location",
            "coaches",
            "weekday",
            "start_time",
            "end_time",
            "minimum_age",
            "maximum_age",
            "audience",
            "notes",
        ]


PricingSerializer = serializer(
    m.PricingPlan,
    [
        "id",
        "name",
        "slug",
        "price",
        "billing_period",
        "sessions_per_week",
        "unlimited",
        "description",
        "eligibility",
        "programs",
        "training_groups",
        "category",
    ],
)
DiscountSerializer = serializer(
    m.DiscountProgram,
    [
        "id",
        "name",
        "slug",
        "discount_type",
        "discount_value",
        "description",
        "eligibility_text",
        "applicable_programs",
    ],
)
ImageSerializer = serializer(m.GalleryImage, ["id", "image", "image_webp", "image_avif", "caption"])


class GallerySerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()

    def get_images(self, obj):
        return ImageSerializer(obj.images.filter(is_demo=False), many=True, context=self.context).data

    class Meta:
        model = m.GalleryAlbum
        fields = ["id", "title", "slug", "category", "cover", "images"]


class EventSerializer(serializers.ModelSerializer):
    program = serializers.SlugRelatedField(read_only=True, slug_field="slug")
    gallery = GallerySerializer(read_only=True)

    class Meta:
        model = m.Event
        fields = [
            "id",
            "title",
            "slug",
            "program",
            "event_type",
            "start_date",
            "end_date",
            "location",
            "age_text",
            "description",
            "content",
            "cover_image",
            "gallery",
            "price",
            "registration_available",
        ]


AthleteSerializer = serializer(m.Athlete, ["id", "full_name", "photo", "program", "biography"])
CompetitionSerializer = serializer(
    m.Competition,
    ["id", "title", "slug", "date", "end_date", "location", "description", "program", "cover_image"],
)


class ResultSerializer(serializers.ModelSerializer):
    athlete = AthleteSerializer(read_only=True)
    competition = CompetitionSerializer(read_only=True)

    class Meta:
        model = m.CompetitionResult
        fields = ["id", "competition", "athlete", "category", "place", "result_text"]


FAQSerializer = serializer(m.FAQ, ["id", "question", "answer", "program"])
SettingsSerializer = serializer(
    m.SiteSettings,
    [
        "name",
        "phone",
        "telegram",
        "email",
        "city",
        "hero_text",
        "hero_image",
        "cta_text",
        "about_text",
        "seo_description",
        "privacy_text",
        "consent_text",
        "legal_ready",
    ],
)


class PublicViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    authentication_classes = []
    pagination_class = None
    model = None

    def get_queryset(self):
        return public(self.model)


def view(model, ser, slug=False):
    attrs = {"model": model, "serializer_class": ser}
    if slug:
        attrs["lookup_field"] = "slug"
    return type(model.__name__ + "ViewSet", (PublicViewSet,), attrs)


ProgramViewSet = view(m.Program, ProgramSerializer, True)
CoachViewSet = view(m.Coach, CoachSerializer, True)
LocationViewSet = view(m.Location, LocationSerializer)
PricingViewSet = view(m.PricingPlan, PricingSerializer)
DiscountViewSet = view(m.DiscountProgram, DiscountSerializer)
GalleryViewSet = view(m.GalleryAlbum, GallerySerializer, True)
FAQViewSet = view(m.FAQ, FAQSerializer)
SettingsViewSet = view(m.SiteSettings, SettingsSerializer)


class ScheduleViewSet(PublicViewSet):
    model = m.ScheduleEntry
    serializer_class = ScheduleSerializer

    def get_queryset(self):
        qs = (
            super()
            .get_queryset()
            .filter(
                program__is_active=True,
                program__is_demo=False,
                training_group__is_active=True,
                training_group__is_demo=False,
            )
            .exclude(coaches__is_demo=True)
            .exclude(coaches__is_active=False)
            .filter(Q(location__isnull=True) | Q(location__is_active=True, location__is_demo=False))
        )
        params = self.request.query_params
        if params.get("program"):
            qs = qs.filter(program__slug=params["program"])
        for key, field in [("coach", "coaches__id"), ("location", "location_id"), ("weekday", "weekday")]:
            if params.get(key):
                try:
                    value = int(params[key])
                except ValueError:
                    raise ValidationError({key: "Укажите целое число."})
                qs = qs.filter(**{field: value})
        if params.get("age"):
            try:
                age = int(params["age"])
            except ValueError:
                raise ValidationError({"age": "Укажите целое число."})
            if not 0 <= age <= 120:
                raise ValidationError({"age": "Возраст от 0 до 120."})
            qs = qs.filter(
                Q(minimum_age__isnull=True) | Q(minimum_age__lte=age),
                Q(maximum_age__isnull=True) | Q(maximum_age__gte=age),
            )
        return (
            qs.select_related("program", "training_group", "location")
            .prefetch_related("coaches__programs", "coaches__certificates")
            .distinct()
        )


class EventViewSet(PublicViewSet):
    model = m.Event
    serializer_class = EventSerializer
    lookup_field = "slug"

    def get_queryset(self):
        qs = (
            super()
            .get_queryset()
            .filter(Q(program__isnull=True) | Q(program__is_demo=False, program__is_active=True))
        )
        today = timezone.localdate()
        future = Q(end_date__gte=today) | Q(end_date__isnull=True, start_date__gte=today)
        period = self.request.query_params.get("period")
        if period == "upcoming":
            qs = qs.filter(future)
        if period == "past":
            qs = qs.exclude(future)
        return qs.order_by("-start_date")


class CompetitionViewSet(PublicViewSet):
    model = m.Competition
    serializer_class = CompetitionSerializer

    def get_queryset(self):
        return (
            super().get_queryset().filter(program__is_active=True, program__is_demo=False).order_by("-date")
        )


class ResultViewSet(PublicViewSet):
    model = m.CompetitionResult
    serializer_class = ResultSerializer

    def get_queryset(self):
        qs = (
            super()
            .get_queryset()
            .filter(
                athlete__is_public=True,
                athlete__is_active=True,
                athlete__is_demo=False,
                competition__is_published=True,
                competition__is_demo=False,
                competition__program__is_active=True,
                competition__program__is_demo=False,
            )
        )
        year = self.request.query_params.get("year")
        if year:
            try:
                qs = qs.filter(competition__date__year=int(year))
            except ValueError:
                raise ValidationError({"year": "Укажите год."})
        return qs.select_related("athlete", "competition").order_by("-competition__date", "place")
