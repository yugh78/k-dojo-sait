from django.contrib import admin
from .models import Product, Request
# Register your models here.

admin.site.register(Product)


@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = ('name', 'subject', 'status', 'created_at', 'updated_at')
    search_fields = ('name', 'subject', 'email')
    list_filter = ('status', 'created_at')
    