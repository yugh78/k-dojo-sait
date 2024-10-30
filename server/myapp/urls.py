from django.urls import path
from . import views


urlpatterns = [
    path("request/create", views.create_request, name="create_request"),
    path("request/success", views.request_success, name="request_success"),
]
