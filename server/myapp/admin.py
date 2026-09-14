from django.contrib import admin
from .models import Product, Request


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "price"]
    search_fields = ["name"]


@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "phone", "program", "status", "is_read", "created_at"]
    list_filter = ["status", "is_read", "program", "created_at"]
    search_fields = ["name", "phone"]
    date_hierarchy = "created_at"
    ordering = ["-created_at"]
    readonly_fields = ["created_at", "updated_at", "consent_at", "consent_text"]
    autocomplete_fields = ["program", "location", "training_group"]
    fieldsets = [
        ("Контакт", {"fields": ["name", "phone", "age", "message"]}),
        ("Занятия", {"fields": ["program", "training_group", "location"]}),
        ("Работа с заявкой", {"fields": ["status", "is_read", "admin_comment"]}),
        (
            "Источник и согласие",
            {
                "fields": [
                    "source_page",
                    "utm_source",
                    "utm_medium",
                    "utm_campaign",
                    "consent_at",
                    "consent_text",
                    "created_at",
                    "updated_at",
                ],
                "classes": ["collapse"],
            },
        ),
    ]

    def has_delete_permission(self, request, obj=None):
        return False
