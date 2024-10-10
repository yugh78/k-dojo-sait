from django.db import models

# Create your models here.

class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name

class Request(models.Model):
    STATUSES = [
        ('NEW', 'Новая'),
        ('IN_PROGRESS', 'В работе'),
        ('DONE', 'Завершена'),
    ]

    name = models.CharField(max_length=100, verbose_name='Имя клиента')
    email = models.EmailField(verbose_name='Email клиента')
    phone = models.CharField(max_length=20, blank= True, verbose_name='Телефон клиента')
    subject = models.CharField(max_length=200, verbose_name="Тема заявки")
    description = models.TextField(verbose_name='Описание')
    status = models.CharField(max_length=20, choices=STATUSES,default='NEW',verbose_name='Статус')
    created_at = models.DateTimeField(auto_now_add = True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')

    def __str__(self):
        return f"{self.subject} - {self.name}"
    