from django.core.management.base import BaseCommand
from wagtail.models import Page

from website.models import Service as ServiceSnippet, Project as ProjectSnippet
from website.models_pages import (
    ServicesIndexPage,
    ServicePage,
    PortfolioIndexPage,
    ProjectPage,
)


class Command(BaseCommand):
    help = "Migrate Service and Project snippets into Wagtail Page models"

    def handle(self, *args, **opts):
        root = Page.get_first_root_node()

        # Ensure index pages exist
        services_index = ServicesIndexPage.objects.first()
        if not services_index:
            services_index = ServicesIndexPage(title="Services")
            root.add_child(instance=services_index)
            services_index.save_revision().publish()
            self.stdout.write(self.style.SUCCESS("Created Services index page"))

        portfolio_index = PortfolioIndexPage.objects.first()
        if not portfolio_index:
            portfolio_index = PortfolioIndexPage(title="Portfolio")
            root.add_child(instance=portfolio_index)
            portfolio_index.save_revision().publish()
            self.stdout.write(self.style.SUCCESS("Created Portfolio index page"))

        # Services -> ServicePage
        created_services = 0
        for s in ServiceSnippet.objects.all():
            if ServicePage.objects.filter(slug=s.slug).exists():
                continue
            page = ServicePage(title=s.name, slug=s.slug, intro=s.description, hero_id=s.hero_id)
            services_index.add_child(instance=page)
            page.save_revision().publish()
            created_services += 1

        # Projects -> ProjectPage
        created_projects = 0
        for p in ProjectSnippet.objects.all():
            if ProjectPage.objects.filter(slug=p.slug).exists():
                continue
            page = ProjectPage(
                title=p.title,
                slug=p.slug,
                city=p.city,
                before_image_id=p.before_image_id,
                after_image_id=p.after_image_id,
            )
            portfolio_index.add_child(instance=page)
            # Copy tags/services names to TaggableManager
            try:
                for tag in p.tags.names():
                    page.services.add(tag)
            except Exception:
                pass
            page.save_revision().publish()
            created_projects += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Migration complete. Services created: {created_services}, Projects created: {created_projects}"
            )
        )
