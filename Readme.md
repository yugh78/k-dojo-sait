# K-Dojo

Сайт спортивного клуба K-Dojo на Nuxt 4, Vue 3 и TypeScript. Весь код сайта находится в `frontend/`, контент хранится в локальном JSON. Запись на тренировку доступна по телефону и через Telegram.

## Быстрый старт

Нужны Node.js 24 и pnpm 10.32.1 (версия закреплена в `frontend/package.json`).

Из корня репозитория:

```sh
cd frontend
pnpm install --frozen-lockfile
pnpm dev
```

Сайт доступен по адресу http://localhost:3000. Для локального запуска переменные окружения не нужны.

В PowerShell, если запуск `pnpm.ps1` запрещён политикой выполнения, используйте `pnpm.cmd` вместо `pnpm`.

## Структура сайта

| Путь | Назначение |
| --- | --- |
| `frontend/app/app.vue` | Общая оболочка сайта |
| `frontend/app/pages/` | Страницы и маршруты |
| `frontend/app/components/` | Компоненты интерфейса |
| `frontend/app/assets/main.css` | Общие стили |
| `frontend/app/data/club.json` | Направления, тренеры, расписание, цены, FAQ и контакты |
| `frontend/app/composables/useClubContent.ts` | Чтение и фильтрация локального контента |
| `frontend/public/` | Изображения и другие статические файлы |
| `frontend/server/routes/` | Генерация `robots.txt` и `sitemap.xml` |
| `frontend/tests/` | Модульные и браузерные тесты |

Контент редактируется в `club.json`. Файл из `frontend/public/` доступен по пути от корня сайта: например, `public/brand/k-dojo.svg` — по адресу `/brand/k-dojo.svg`. После изменения контента или кода опубликованный сайт нужно пересобрать.

## Команды

Все команды ниже выполняются из папки `frontend`.

| Команда | Действие |
| --- | --- |
| `pnpm dev` | Запустить сайт для разработки |
| `pnpm check` | Проверить ESLint, форматирование, TypeScript и модульные тесты |
| `pnpm format` | Отформатировать файлы |
| `pnpm test` | Запустить модульные тесты |
| `pnpm build` | Собрать production-версию в `.output/` |
| `pnpm preview` | Локально посмотреть готовую сборку |
| `pnpm test:e2e` | Проверить готовую сборку в браузере |

Перед первым запуском браузерных тестов установите Chromium:

```sh
pnpm exec playwright install chromium
pnpm build
pnpm test:e2e
```

Playwright сам запускает собранный сайт. В GitHub Actions при push и pull request выполняются основные проверки, сборка и браузерные тесты.

## Публикация

Сайт использует серверный рендеринг Nuxt. Для текущей сборки нужен хостинг с Node.js 24.

1. Установите зависимости и выполните `pnpm build` в `frontend/`.
2. Задайте `NUXT_PUBLIC_SITE_URL` — полный публичный адрес сайта, например `https://example.com`, без завершающего `/`. Он используется для SEO-ссылок, `robots.txt` и `sitemap.xml`.
3. Из `frontend/` запустите:

```sh
node .output/server/index.mjs
```

При необходимости задайте `PORT` и `HOST` в окружении процесса. Для переноса готовой сборки используйте весь каталог `.output/`.

## Локальный архив

`backups/legacy-server/` содержит сохранённую старую базу. Этот каталог исключён из Git и не нужен для работы сайта. Старые локальные `.env` и `.tools/` также не требуются для стандартного запуска с установленными Node.js и pnpm.
