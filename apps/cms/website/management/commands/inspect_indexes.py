from django.core.management.base import BaseCommand
from wagtail.models import Page


class Command(BaseCommand):
    help = "List index-like pages for Services/Portfolio across titles and content types."

    def handle(self, *args, **opts):
        targets = [
            ("portfolio", "portfolioindexpage"),
            ("services", "servicesindexpage"),
        ]
        for title_key, model_key in targets:
            self.stdout.write(self.style.MIGRATE_HEADING(f"\n== {title_key.upper()} =="))
            qs = Page.objects.filter(title__iexact=title_key).order_by("path")
            for p in qs.specific():
                ct = p.content_type
                self.stdout.write(
                    f"[by title] id={p.id} type={ct.app_label}.{ct.model} path={p.path} live={p.live}"
                )

            qs2 = Page.objects.filter(content_type__model=model_key).order_by("path")
            for p in qs2.specific():
                ct = p.content_type
                self.stdout.write(
                    f"[by model]  id={p.id} type={ct.app_label}.{ct.model} title={p.title} path={p.path} live={p.live}"
                )
