CMS (Wagtail Headless)
======================

Quickstart (Windows PowerShell):

1) Start infra
	- cd apps/cms
	- docker compose up -d

2) Run Django
	- Ensure .env exists (see .env in this folder)
	- Use uv or venv, e.g.:
	  uv run python manage.py migrate
	  uv run python manage.py createsuperuser
	  uv run python manage.py runserver 0.0.0.0:8000

3) Open http://localhost:8000/cms to access Wagtail admin.

