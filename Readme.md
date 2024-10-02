# K-Dojo

[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg?style=for-the-badge)](https://github.com/psf/black)

## Настройка окружения

Для работы системы на рабочей машие необходимо установить следующие инструменты:

- `git`
- `make`
- `docker` с плагином `docker-compose`

### Настройка на Ubuntu _(WSL)_

Для настройки окружения в `Ubuntu` выполните следующие команды в `bash`:

```bash
make install-ubuntu-tools
```

Эта комманда установит все необходимые инструменты.

```bash
make start-db
```

Эта комманда запустит `docker`-контейнер с [СУБД](https://ru.wikipedia.org/wiki/%D0%A1%D0%B8%D1%81%D1%82%D0%B5%D0%BC%D0%B0_%D1%83%D0%BF%D1%80%D0%B0%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D1%8F_%D0%B1%D0%B0%D0%B7%D0%B0%D0%BC%D0%B8_%D0%B4%D0%B0%D0%BD%D0%BD%D1%8B%D1%85) **PostgreSQL**, а также графический инструмент его администрирования **PGAdmin**.

**PGAdmin** будет доступен по адресу <http://localhost:5050> на локальной машине (хосте), если хостом является WSL-система, то по адресу <http://127.0.0.1:5050>
