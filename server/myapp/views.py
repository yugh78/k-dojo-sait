"""Legacy endpoint uses the same protected application API."""

from django.http import JsonResponse


def request_success(request):
    return JsonResponse({"message": "Ваша заявка принята."})
