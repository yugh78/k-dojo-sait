from django.contrib import admin
from .models import Product, Request
# Register your models here.

admin.site.register(Product)


@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone','is_read', 'created_at') # Поля, которые будут отображаться
    list_filter = ('is_read',)# Фильтры для удобного поиска заявок
    search_fields = ('name','phone','message')# Поля для поиска заявок 
    