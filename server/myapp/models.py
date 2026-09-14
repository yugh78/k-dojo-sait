"""Legacy table names and IDs intentionally preserved."""

from django.db import models


class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name


class Request(models.Model):
    name = models.CharField(max_length=100, verbose_name="Имя клиента")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Телефон клиента")
    message = models.TextField(verbose_name="сообщение", default="Сообщение не указано")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    age = models.PositiveSmallIntegerField(null=True, blank=True)
    program = models.ForeignKey("club.Program", on_delete=models.SET_NULL, null=True, blank=True)
    training_group = models.ForeignKey("club.TrainingGroup", on_delete=models.SET_NULL, null=True, blank=True)
    location = models.ForeignKey("club.Location", on_delete=models.SET_NULL, null=True, blank=True)
    source_page = models.CharField(max_length=250, blank=True)
    utm_source = models.CharField(max_length=150, blank=True)
    utm_medium = models.CharField(max_length=150, blank=True)
    utm_campaign = models.CharField(max_length=150, blank=True)
    status = models.CharField(
        max_length=30,
        default="new",
        choices=[
            ("new", "Новая"),
            ("contacted", "Связались"),
            ("trial_scheduled", "Пробная назначена"),
            ("trial_completed", "Пробная состоялась"),
            ("joined", "Занимается"),
            ("declined", "Отказ"),
        ],
    )
    updated_at = models.DateTimeField(null=True, blank=True, auto_now=True)
    admin_comment = models.TextField(blank=True)
    consent_at = models.DateTimeField(null=True, blank=True)
    consent_text = models.TextField(blank=True, help_text="Текст согласия на момент отправки")

    def __str__(self):
        return self.name
