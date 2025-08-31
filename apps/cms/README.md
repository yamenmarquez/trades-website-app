# CMS (Wagtail Headless)

Quickstart (Windows PowerShell):

1. Start infra
   - cd apps/cms
   - docker compose up -d

2. Run Django
   - Ensure .env exists (see .env in this folder)
   - Use uv or venv, e.g.:
     uv run python manage.py migrate
     uv run python manage.py createsuperuser
     uv run python manage.py runserver 0.0.0.0:8000

3. Open http://localhost:8000/cms to access Wagtail admin.

## Migrating Services/Projects snippets to Pages

We now use Wagtail Pages for Services and Projects. If you already have snippet data, run:

```
cd apps/cms
python manage.py makemigrations website
python manage.py migrate
python manage.py migrate_snippets_to_pages
```
