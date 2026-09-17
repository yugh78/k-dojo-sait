.PHONY: help backend-check frontend-check db-start migrate
help:
	@echo "Read Readme.md. v2 uses docker-compose.v2.yml; legacy volumes are retained."
backend-check:
	python -m ruff check server
	python server/manage.py check
	python server/manage.py test club myapp
frontend-check:
	pnpm --dir frontend lint
	pnpm --dir frontend typecheck
	pnpm --dir frontend test
	pnpm --dir frontend build
db-start:
	docker compose -f docker-compose.v2.yml up -d db
migrate:
	docker compose -f docker-compose.v2.yml run --rm backend python manage.py safe_migrate
