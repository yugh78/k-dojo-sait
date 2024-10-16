from django.contrib import admin
from .models import Product, Request
# Register your models here.

admin.site.register(Product)


@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = ('name','is_read', 'created_at', 'phone')
    search_fields = ('name',)
    list_filter = ('is_read',)
    