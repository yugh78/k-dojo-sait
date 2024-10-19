from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from .forms import RequestForm
from .models import Request
from django.core.paginator import Paginator

#Создание заявки
def create_request(request):
    if request.method == "POST":
        name = request.POST.get('name')
        phone = request.POST.get('phone')
        message = request.POST.get('message')
        Request.objects.create(name=name,phone=phone,message=message)
        return render(request, 'my_app/create_application.html',{'succes':True}) #остаемся на этой же странице и благодарим пользователя за заявку
    
    return render(request, 'my_app/create_application.html')



def list_applications(request):
    # 1. Получаем все записи модели Application
    applications = Application.objects.all()

    # 2. Создаем объект пагинатора, который будет делить записи по страницам
    paginator = Paginator(applications, 10)  # Пагинация: 10 заявок на страницу

    # 3. Извлекаем номер текущей страницы из GET-параметра URL (например, ?page=2)
    page_number = request.GET.get('page')

    # 4. Получаем объект текущей страницы
    page_obj = paginator.get_page(page_number)

    # 5. Рендерим HTML-шаблон, передавая туда объект страницы
    return render(request, 'list_requests.html', {'page_obj': page_obj})


# Получение заявки по ID (Get by Id)
def get_application(request, application_id):
    application = get_object_or_404(Application, id=application_id)
    return render(request, 'application_detail.html', {'application': application})


# Получение всех непрочитанных заявок (Get all unread)
def list_unread_requests(request):
    unread_requests = Request.objects.filter(is_read=False)
    paginator = Paginator(unread_requests, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    return render(request, 'list_unread_applications.html', {'page_obj':page_obj})


# Обновление заявки (Update)
def update_request(request, application_id):
    application = get_object_or_404(Request, id=application_id)
    if request.method == "POST":
        application.name = request.POST.get('name')
        application.phone = request.POST.get('phone')
        application.message = request.POST.get('message')
        application.save()
        return redirect('get_application', application_id = application.id)
    return render(request, 'update_application.html',{'application':application})


# Удаление заявки (Delete)
def delete_request(request, application_id):
    application = get_object_or_404(Request, id = application_id)
    if request.method == "POST":
        application.delete()
        return redirect('list_application')
    return render(request,'delete_application.html', {'application':application})


# Пометка заявки как прочитанной (Mark as Read)
def mark_as_read(request, application_id):
    application = get_object_or_404(Request, id=application_id)
    application.is_read = True
    application.save()
    return redirect('get_application', application_id = application.id)






def thank_you(request):
    return render(request, 'thank_you.html')

def request_success(request):
    return HttpResponse("Ваша заявка принята.")
