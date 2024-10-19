from django.db import models

# Create your models here.

class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name

class Request(models.Model):

    name = models.CharField(max_length=100, verbose_name='Имя клиента')
    phone = models.CharField(max_length=20, blank= True, verbose_name='Телефон клиента')
    message = models.TextField(verbose_name='сообщение', default ="Сообщение не указано")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add = True, verbose_name='Дата создания')

    def __str__(self):
        return self.name
    