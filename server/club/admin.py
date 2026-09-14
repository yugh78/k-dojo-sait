from django.contrib import admin
from . import models as m


class CertificateInline(admin.TabularInline):
    model = m.Certificate
    extra = 0


class ImageInline(admin.TabularInline):
    model = m.GalleryImage
    extra = 0


class ResultInline(admin.TabularInline):
    model = m.CompetitionResult
    autocomplete_fields = ["athlete"]
    extra = 0


@admin.register(m.Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ["name", "is_active", "is_demo", "sort_order"]
    list_filter = ["is_active", "is_demo"]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ["name"]}


@admin.register(m.Coach)
class CoachAdmin(admin.ModelAdmin):
    list_display = ["full_name", "is_active", "sort_order"]
    list_filter = ["programs", "is_active", "is_demo"]
    search_fields = ["full_name"]
    prepopulated_fields = {"slug": ["full_name"]}
    filter_horizontal = ["programs"]
    inlines = [CertificateInline]


@admin.register(m.Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ["name", "address", "is_active"]
    search_fields = ["name", "address"]
    filter_horizontal = ["programs"]


@admin.register(m.TrainingGroup)
class GroupAdmin(admin.ModelAdmin):
    list_display = ["name", "program", "minimum_age", "maximum_age", "is_active"]
    search_fields = ["name"]
    list_filter = ["program", "is_active"]


@admin.register(m.ScheduleEntry)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ["training_group", "weekday", "start_time", "end_time", "location", "is_active"]
    list_filter = ["program", "weekday", "coaches", "location", "is_active"]
    autocomplete_fields = ["program", "training_group", "location", "coaches"]
    search_fields = ["training_group__name"]
    fieldsets = [
        ("Занятие", {"fields": ["program", "training_group", "coaches", "location"]}),
        ("Время", {"fields": ["weekday", "start_time", "end_time", "valid_from", "valid_until"]}),
        (
            "Условия",
            {
                "fields": [
                    "minimum_age",
                    "maximum_age",
                    "audience",
                    "notes",
                    "is_active",
                    "is_demo",
                    "sort_order",
                ]
            },
        ),
    ]


@admin.register(m.PricingPlan)
class PricingAdmin(admin.ModelAdmin):
    list_display = ["name", "price", "category", "is_active", "valid_from", "valid_until"]
    list_filter = ["programs", "category", "is_active"]
    search_fields = ["name"]
    filter_horizontal = ["programs", "training_groups"]


@admin.register(m.DiscountProgram)
class DiscountAdmin(admin.ModelAdmin):
    list_display = ["name", "discount_value", "is_active"]
    search_fields = ["name"]
    filter_horizontal = ["applicable_programs"]


@admin.register(m.Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ["title", "event_type", "start_date", "is_published", "is_demo"]
    list_filter = ["event_type", "program", "is_published", "is_demo"]
    search_fields = ["title"]
    date_hierarchy = "start_date"
    prepopulated_fields = {"slug": ["title"]}
    autocomplete_fields = ["program", "gallery"]


@admin.register(m.GalleryAlbum)
class GalleryAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "is_published", "is_demo"]
    list_filter = ["category", "is_published"]
    search_fields = ["title"]
    inlines = [ImageInline]


@admin.register(m.Athlete)
class AthleteAdmin(admin.ModelAdmin):
    list_display = ["full_name", "program", "is_public", "is_active"]
    list_filter = ["program", "is_public"]
    search_fields = ["full_name"]


@admin.register(m.Competition)
class CompetitionAdmin(admin.ModelAdmin):
    list_display = ["title", "date", "program", "is_published"]
    search_fields = ["title"]
    date_hierarchy = "date"
    list_filter = ["program", "is_published"]
    inlines = [ResultInline]


@admin.register(m.CompetitionResult)
class ResultAdmin(admin.ModelAdmin):
    list_display = ["athlete", "competition", "category", "place"]
    list_filter = ["competition"]
    search_fields = ["athlete__full_name"]
    autocomplete_fields = ["athlete", "competition"]


@admin.register(m.FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ["question", "program", "is_active"]
    search_fields = ["question", "answer"]
    list_filter = ["program", "is_active"]


@admin.register(m.SiteSettings)
class SettingsAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return not m.SiteSettings.objects.exists() and super().has_add_permission(request)

    def has_delete_permission(self, request, obj=None):
        return False


admin.site.site_header = "K-Dojo — управление клубом"
admin.site.site_title = "K-Dojo Admin"
