FROM python:3.14-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt requirements.lock ./
RUN pip install --no-cache-dir -r requirements.lock
COPY . .
RUN DJANGO_DEBUG=true USE_SQLITE=true python manage.py collectstatic --noinput \
    && useradd --create-home app && mkdir -p /app/media && chown -R app:app /app
USER app
EXPOSE 8000
CMD ["gunicorn", "k_dojo.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2", "--timeout", "30", "--graceful-timeout", "30", "--access-logfile", "-"]
