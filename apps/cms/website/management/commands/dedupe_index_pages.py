from django.core.management.base import BaseCommand
from website.models_pages import PortfolioIndexPage, ServicesIndexPage


class Command(BaseCommand):
    help = (
        "Ensure a single Services/Portfolio index exists. Move children from duplicates and delete extras."
    )

    def handle(self, *args, **opts):
        total_ops = 0
        for Model, label in [
            (ServicesIndexPage, "ServicesIndexPage"),
            (PortfolioIndexPage, "PortfolioIndexPage"),
        ]:
            pages = list(Model.objects.order_by("id").specific())
            if len(pages) <= 1:
                self.stdout.write(
                    self.style.SUCCESS(f"[{label}] OK: {len(pages)} instance")
                )
                continue

            keep = pages[0]
            if not keep.live:
                keep.save_revision().publish()
            self.stdout.write(
                self.style.WARNING(
                    f"[{label}] Found {len(pages)}. Keeping id={keep.id} ‘{keep.title}’"
                )
            )

            for extra in pages[1:]:
                self.stdout.write(
                    f"  - Moving children of id={extra.id} ‘{extra.title}’ -> keep id={keep.id}"
                )
                for child in extra.get_children().specific():
                    # Move child under keep, as last
                    child.move(keep, pos="last-child")
                    total_ops += 1
                # Delete the duplicate index page
                extra.delete()
                total_ops += 1

        self.stdout.write(self.style.SUCCESS(f"Done. Operations: {total_ops}"))
