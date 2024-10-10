#from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from .forms import RequestForm
# Create your views here.


def create_request(request):
    if request.method == 'POST':
        form = RequestForm(request.POST)
        if form.is_valid():
            form.save()
            return JsonResponse({'status':'success', 'request_id':request.id})
    else:
        form = RequestForm()
    return JsonResponse({'status':'failed', 'errors':form.errors})

def request_success(request):
    return HttpResponse("Ваша заявка принята.")