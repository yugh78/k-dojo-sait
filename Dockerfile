# Шаг 1. Указываем базовый образ Python
FROM python:3.11.9

# Шаг 2. Устанавливаем рабочую директорию в контейнере
WORKDIR /myapp

# Шаг 3. Копируем файл зависимостей requirements.txt в рабочую директорию контейнера
COPY requirements.txt /app/

# Шаг 4. Устанавливаем зависимости из requirements.txt
RUN pip install -r requirements.txt

# Шаг 5. Копируем весь проект Django в контейнер
COPY . /app

# Шаг 6. Открываем порт 8000 для доступа к серверу разработки Django
EXPOSE 8000

# Шаг 7. Определяем команду по умолчанию для запуска сервера Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
