# K-Dojo v2

Спортивный клуб в Королёве: Киокусинкай, BJJ / грэпплинг и «Маугли».

## Быстрый запуск через консоль Windows

Нужны установленный Docker Desktop с Linux-контейнерами и PowerShell (подойдёт терминал в VS Code). Для Docker-запуска устанавливать Python, Node.js и pnpm на компьютер не требуется.

**На этой машине `.env` уже настроен.** Откройте PowerShell и выполните команды по порядку:

```powershell
cd A:\projects\k-dojo-sait
docker desktop start
docker version
powershell -ExecutionPolicy Bypass -File .\scripts\docker-up.ps1
```

В выводе `docker version` должны быть разделы `Client` и `Server` без ошибок. Дождитесь завершения скрипта: он соберёт образы, запустит PostgreSQL, применит миграции, добавит начальные данные клуба и запустит сайт. Первая сборка требует интернета и может занять несколько минут. Контейнеры работают в фоне — терминал можно закрыть.

Откройте **[сайт](https://localhost)** или **[админку](https://localhost/admin/)**. Для localhost используется локальный сертификат Caddy, поэтому браузер может показать предупреждение о доверии.

Во всех командах проекта используется **`-f docker-compose.v2.yml`**. Файл `docker-compose.yml` относится к старой базе и для запуска текущего сайта не используется.

## Повседневные команды

Выполняйте из папки проекта. Docker Desktop должен быть запущен.

**Запустить уже собранный сайт**, например после перезагрузки компьютера:

```powershell
docker desktop start
docker compose -f docker-compose.v2.yml up -d --wait
```

**Пересобрать после изменения кода** и применить новые миграции:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\docker-up.ps1
```

**Остановить сайт**, сохранив базу и загруженные фотографии:

```powershell
docker compose -f docker-compose.v2.yml stop
```

**Посмотреть состояние контейнеров:**

```powershell
docker compose -f docker-compose.v2.yml ps
```

Ожидаются четыре сервиса: `db`, `backend`, `frontend`, `proxy`. У первых трёх после запуска должен появиться статус `healthy`, у `proxy` — `Up`.

**Посмотреть логи в реальном времени:**

```powershell
docker compose -f docker-compose.v2.yml logs -f --tail 100
```

`Ctrl+C` завершает просмотр логов; сайт продолжает работать. Для логов только Django добавьте `backend` в конец команды.

**Создать администратора** после первого запуска:

```powershell
docker compose -f docker-compose.v2.yml exec backend python manage.py createsuperuser
```

Введите имя, email и пароль по подсказкам. Символы пароля в терминале не отображаются — это нормально. Затем войдите на https://localhost/admin/.

Данные хранятся в Docker volumes и сохраняются при остановке и пересборке. Не используйте `down -v`: эта команда удаляет volumes проекта вместе с данными.

## Первый запуск на новом компьютере

Откройте PowerShell в папке скачанного проекта. Если `.env` ещё нет, создайте его из шаблона:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

Для локального запуска заполните следующие поля, остальные оставьте как в шаблоне:

```dotenv
DJANGO_SECRET_KEY=вставьте_первый_сгенерированный_секрет
POSTGRES_PASSWORD=вставьте_второй_сгенерированный_секрет
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
SITE_DOMAIN=localhost
NUXT_PUBLIC_SITE_URL=https://localhost
CSRF_TRUSTED_ORIGINS=https://localhost
```

Для каждого из двух секретов отдельно выполните в PowerShell и скопируйте полученную строку в соответствующее поле `.env`:

```powershell
$bytes = New-Object byte[] 48
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
$rng.Dispose()
```

Сохраните `.env`, закройте редактор и выполните команды из раздела «Быстрый запуск» начиная с `docker desktop start`. `.env` не попадает в Git. После создания базы не меняйте `POSTGRES_PASSWORD` только в этом файле: пароль существующей базы автоматически не обновится.

## Если запуск не получается

| Что видите | Что сделать |
|---|---|
| `docker` не найден | Установите Docker Desktop и заново откройте терминал. |
| `docker desktop start` не поддерживается | Откройте Docker Desktop через меню «Пуск», дождитесь запуска Engine и повторите `docker version`. |
| В `docker version` нет работающего `Server` | Дождитесь запуска Docker Desktop; если ошибка остаётся, проверьте сообщение в его окне. |
| Ошибка про `.env`, `POSTGRES_PASSWORD` или `SITE_DOMAIN` | Заполните `.env` по разделу первого запуска. |
| Порт 80 или 443 занят | Остановите другую программу, использующую этот порт, и повторите запуск. |
| Контейнер `unhealthy` или сайт не открывается | Выполните команды `ps` и `logs -f --tail 100` выше: логи покажут причину. |

## Архитектура

- `frontend/`: сайт на Nuxt 4 SSR, Vue 3 и TypeScript; зависимости устанавливаются через pnpm.
- `server/club/`: контент клуба, Django Admin и публичный REST API.
- `server/myapp/`: таблицы Product и Request, заявки и поля mini-CRM.
- PostgreSQL хранит данные в Docker; `server/dev-v2.sqlite3` — отдельная база для разработки без Docker.
- `deploy/`: Caddy, HTTPS и маршрутизация запросов к Nuxt и Django.
- `scripts/`: запуск и проверки; `.tools/` используется для локальной разработки без Docker.
- `docs/`: [описание API](docs/api.md), [примеры запросов](docs/api.http), миграция и результаты проверок.

Инструкции ниже нужны для разработки без Docker, публикации на сервере и обслуживания данных.

## Локальный запуск без Docker

Локальные Node/Python/pnpm установлены в игнорируемом `.tools/`. Запустите:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/dev.ps1
```

Сайт: http://localhost:3000. Django Admin: http://127.0.0.1:8000/admin/.
Скрипт применяет миграции только к отдельной локальной SQLite, добавляет факты ТЗ без перезаписи правок и запускает оба сервера. При завершении останавливает только созданный им backend-процесс.

Создание администратора в отдельном PowerShell:

```powershell
$env:DJANGO_DEBUG='true'
$env:USE_SQLITE='true'
.\.tools\python\python.exe server/manage.py createsuperuser
```

Пароль администратора задайте интерактивно. Он не хранится в Git.

## Установка инструментов для разработки без Docker

Требования: Python 3.14, Node.js 24 LTS, pnpm 10.32.1; Docker Compose для production. Версии пакетов зафиксированы в `server/requirements.lock` и `frontend/pnpm-lock.yaml`.

```sh
python -m venv .venv
# Linux/macOS:
. .venv/bin/activate
# Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r server/requirements.lock
pnpm --dir frontend install --frozen-lockfile
```

В development установите `DJANGO_DEBUG=true` и `USE_SQLITE=true`, затем:

```sh
python server/manage.py safe_migrate
python server/manage.py seed_club
python server/manage.py createsuperuser
python server/manage.py runserver 127.0.0.1:8000
# В другом терминале:
pnpm --dir frontend dev
```

Локальная форма работает с CSRF через same-origin Nuxt proxy. Для дополнительного origin задайте его явно в CSRF_TRUSTED_ORIGINS. CORS не требуется.

## Переменные окружения

Скопируйте `.env.example` в `.env`. Обычный Django не читает этот файл автоматически: экспортируйте переменные в shell либо используйте Compose env_file.

| Переменная | Назначение |
|---|---|
| DJANGO_SECRET_KEY | Обязательный уникальный production-секрет |
| DJANGO_DEBUG | false в production |
| DJANGO_ALLOWED_HOSTS | Домены через запятую; localhost нужен healthcheck |
| CSRF_TRUSTED_ORIGINS | HTTPS origins через запятую |
| POSTGRES_DB / USER / PASSWORD | Данные новой БД |
| DATABASE_HOST / PORT | Адрес PostgreSQL |
| SITE_DOMAIN | Домен Caddy, DNS должен указывать на сервер |
| NUXT_PUBLIC_SITE_URL | Публичный URL для canonical/sitemap |
| NUXT_API_BASE | Внутренний API для Nuxt, по умолчанию localhost:8000 |
| TELEGRAM_BOT_TOKEN / CHAT_ID | Необязательные уведомления |
| MEDIA_STORAGE_BACKEND | Django Storage backend, по умолчанию filesystem |
| USE_SQLITE | true только для локальной разработки |

Для генерации секрета используйте `python -c "import secrets; print(secrets.token_urlsafe(64))"` и сохраните результат только в защищённом окружении.

## Production / Docker

Перед запуском прочтите [план миграции](docs/v2-migration-plan.md).
Новая конфигурация использует отдельный Compose project `kdojo-v2` и новые volumes. Она не подключает `dsf-data`.

```sh
docker compose -f docker-compose.v2.yml config --quiet
docker compose -f docker-compose.v2.yml build
docker compose -f docker-compose.v2.yml up -d db
docker compose -f docker-compose.v2.yml run --rm backend python manage.py safe_migrate
docker compose -f docker-compose.v2.yml run --rm backend python manage.py seed_club
docker compose -f docker-compose.v2.yml run --rm backend python manage.py createsuperuser
docker compose -f docker-compose.v2.yml run --rm backend python manage.py check --deploy
docker compose -f docker-compose.v2.yml up -d
```

Миграции выполняются отдельно, не при старте каждого worker. Backend и frontend работают без root. Наружу открыты только 80/443; backend/БД остаются во внутренней сети. Адрес backend нельзя публиковать напрямую: доверие proxy-заголовкам рассчитано на Caddy.

Healthchecks: PostgreSQL pg_isready; Django /api/health/ проверяет SQL-соединение; Nuxt проверяет HTTP-ответ. При остановке Gunicorn получает время на завершение запросов.

**Проверка Docker (25.09.2026):** Docker Engine запущен, образы backend/frontend собраны, все четыре сервиса работают. PostgreSQL, Django и Nuxt проходят healthcheck. Через Caddy по HTTPS проверены главная, расписание, цены, API, вход в админку, статика и sitemap: HTTP 200. В контейнере пройдены 17 backend-тестов на отдельной тестовой PostgreSQL-БД. Реальные старые БД и публичный HTTPS на домене по-прежнему требуют отдельной проверки.

## Безопасная миграция старых данных

Не запускайте обычный migrate на старой БД без инвентаризации. Историческая миграция 0003 удаляет email, subject, description, status и updated_at. `safe_migrate` останавливается, если обнаруживает непустую старую схему с description.

1. На исходном сервере определите контейнер, volume, версию PostgreSQL и записи django_migrations. Не печатайте заявки в публичные логи.
2. Сделайте логический pg_dump и резервную копию media.
3. Восстановите dump в **новую отдельную БД** и проверьте восстановление.
4. Если база до 0003, отдельно экспортируйте все прежние поля. Подготовьте преобразование description→message, статусов и архивирование остальных полей на восстановленной копии. Эта ветка не предполагает неизвестную структуру реальных данных.
5. Для базы на 0003 новая миграция 0004 только добавляет поля. Сравните число заявок, ID, телефоны, сообщения и created_at до и после.
6. Проверьте Admin, расписание, цены, форму и сохранение новой заявки. Только затем переключайте трафик.
7. Для отката используйте прежнее приложение и нетронутую исходную БД. Новые заявки после переключения нужно отдельно сохранить перед откатом.

Не удаляйте прежние заявки, volumes и исходную БД. Не используйте down -v, volume prune или старый db-clear. Определение необходимости старых заявок остаётся за владельцем.

## Резервное копирование

Пример для новой production-БД; имена заменяйте своими:

```sh
docker compose -f docker-compose.v2.yml exec db pg_dump -U kdojo -d kdojo_v2 -Fc -f /tmp/kdojo-v2.dump
docker compose -f docker-compose.v2.yml cp db:/tmp/kdojo-v2.dump ./backups/kdojo-v2.dump
```

Сначала создайте защищённую папку backups. Для каждого запуска используйте уникальное имя. Храните копии отдельно от сервера с ограниченным доступом. Проверяйте `pg_restore --list` и реальное восстановление в отдельную пустую БД; не используйте --clean против production.

Media хранится в отдельном persistent volume. Снимайте его копию согласованно с dump, сохраняйте исходные файлы и права. Storage использует Django API, поэтому переход на S3/R2 не требует менять бизнес-логику; потребуется backend-пакет и его настройки.

## Управление контентом

В /admin/ доступны направления, тренеры и сертификаты, залы, группы, расписание, тарифы, скидки, FAQ, события, альбомы и изображения, соревнования, спортсмены, результаты и SiteSettings.

- `seed_club` добавляет только факты из ТЗ и не перезаписывает изменения администратора. Повторный запуск безопасен для существующих записей.
- `is_demo=True` исключает контент из публичного API даже в development.
- События/альбомы/соревнования требуют `is_published=True`.
- Спортсмены требуют `is_public=True`; непубличные спортсмены и их результаты скрыты.
- У расписания и тарифов учитываются is_active и интервал действия.
- Занятия могут иметь нескольких тренеров. Внесены все 24 занятия недели из ТЗ.
- Заявки: поиск по имени/телефону, фильтры по статусу/направлению/дате, внутренний комментарий, отметка прочтения. Удаление из админки отключено.
- Telegram отправляет только номер заявки. Ошибка уведомления не отменяет сохранение.
- Для включения production-формы заполните и утвердите privacy_text и consent_text, затем включите legal_ready. В текущем наборе юридические данные отсутствуют.

## Что владельцу клуба нужно заменить / заполнить

TODO:

- реальные фотографии для hero, направлений, тренеров, залов и галереи;
- подтверждённые регалии, биографии, стаж и достижения тренеров;
- фотография сертификата «Маугли»;
- адреса и входы всех постоянных групп, кроме известного зала BJJ;
- история клуба и дата основания, если нужна;
- подтверждённые результаты, события, фотографии и разрешения на публикацию спортсменов;
- реальные отзывы, если их планируется публиковать;
- правила одежды и экипировки для каждого направления;
- реквизиты оператора, утверждённые политика и согласие, сроки хранения и порядок отзыва;
- email при необходимости;
- год начала действия цен «с 1 апреля», применимость общих тарифов к конкретным группам и правила сочетания льгот.

Неизвестные даты, адреса, регалии и результаты не придуманы. Геокоординаты не подставлены приблизительно. Ссылки на карту есть для известного адреса. Заглушки фотографий явно обозначены; они не изображают реальных людей клуба.

Команда `python server/manage.py content_check` выводит обнаружимые TODO без персональных данных.

## Проверки

```sh
python -m ruff check server
python -m ruff format --check server
python server/manage.py check
python server/manage.py makemigrations --check --dry-run
python server/manage.py test club myapp
pnpm --dir frontend lint
pnpm --dir frontend typecheck
pnpm --dir frontend test
pnpm --dir frontend build
pnpm --dir frontend exec playwright install chromium
pnpm --dir frontend test:e2e
```

Windows: `scripts/check.ps1` настраивает локальные инструменты и запускает проверки по порядку. E2E самостоятельно создаёт отдельную базу с уникальным именем в .tools/e2e/, применяет миграции и seed_club. Тестовые серверы используют порты 13000 и 18000. Обычная development-БД и её заявки не затрагиваются; повторный запуск получает новую базу.

Playwright запускает реальный Django и production-сборку Nuxt. Проверяются основные страницы, фильтрация, меню, валидация, сохранение формы, 404, SSR metadata, robots/sitemap и отсутствие overflow на 320/360/375/390/430/768/1024/1280/1440 px. Скриншоты сохраняются в frontend/test-results/. CI дополнительно выполняет backend-тесты на PostgreSQL 17.

Проверка локальной production-сборки 17.09.2026 через Caddy со сжатием: **Lighthouse Performance 97, Accessibility 100, Best Practices 100, SEO 100**. Mobile simulation: FCP 2,0 с, LCP 2,0 с, TBT 90 мс, CLS 0. Подробности и границы проверки: [отчёт](docs/v2-verification.md).

Запуск: `node frontend/scripts/measure.mjs` (Node/Python и Caddy должны быть доступны; локальная копия `.tools/caddy/caddy.exe` определяется автоматически). Можно задать `PYTHON_BINARY` и `CADDY_BINARY`. Скрипт использует отдельную тестовую SQLite, проверяет свободные порты 14000/14001/19000/9223, включает сжатие и останавливает свои процессы. HTML/JSON-отчёты сохраняются в `frontend/reports/`.

Lighthouse 90+ остаётся целевым показателем для заполненного сайта на production-хосте. Оценки нельзя переносить с медиазаглушек на будущие реальные фотографии. Загружайте оптимизированные WebP/AVIF; hero — отдельно оптимизированный файл, остальные изображения используют lazy loading.

Отдельная проверка PostgreSQL без Docker (требуется каталог бинарных файлов PostgreSQL 17):

```sh
python scripts/check_postgres.py --bin /path/to/postgresql/bin
```

Скрипт создаёт новый кластер в `.tools/postgres-checks/`, слушает только 127.0.0.1:15432, применяет миграции, выполняет backend-тесты и сохраняет синтетическую заявку через API с CSRF. Затем делает pg_dump, восстанавливает его в другую новую БД и сравнивает данные клуба и заявки, включая связи. Кластер останавливается в конце; данные и backup сохраняются для проверки. Существующие БД не подключаются. Архив Windows доступен на [официальной странице EDB](https://www.enterprisedb.com/download-postgresql-binaries).

## Источники выбора стека

- [Nuxt 4 installation](https://nuxt.com/docs/4.x/getting-started/installation)
- [Django supported versions](https://www.djangoproject.com/download/)

Django 5.2 выбран как поддерживаемая LTS-ветка. Финальный lock фиксирует установленные совместимые версии.

Django check --deploy сообщает только W021: включение в browser HSTS preload list не запрошено. HTTPS redirect, secure cookies, HSTS и защита content-type включены. Включение preload для реального домена требует проверки всех его поддоменов.
