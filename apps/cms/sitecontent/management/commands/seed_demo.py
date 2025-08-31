from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.files.base import ContentFile
from io import BytesIO
from PIL import Image as PILImage, ImageDraw, ImageFont
from wagtail.models import Site
from wagtail.images import get_image_model
from sitecontent.models import Theme, Service, ProjectIndexPage, ProjectPage

class Command(BaseCommand):
    help = "Seed demo content for CMS"

    def handle(self, *args, **options):
        # Ensure a root page exists
        root = ProjectIndexPage.objects.first()
        if not root:
            from wagtail.models import Page
            root = ProjectIndexPage(title="Portfolio", slug="portfolio")
            Page.get_first_root_node().add_child(instance=root)
            root.save_revision().publish()
            self.stdout.write(self.style.SUCCESS("Created Portfolio index page"))

        theme, _ = Theme.objects.get_or_create(
            name="Default Theme",
            defaults=dict(
                brand_color="#0ea5e9",
                accent="#22c55e",
                neutral="#0f172a",
                font_heading="Inter",
                font_body="Inter",
                radius="0.75rem",
                layout_variant="bold-build",
            ),
        )
        self.stdout.write(self.style.SUCCESS(f"Theme ready: {theme.name}"))

        for name, slug in [
            ("Kitchen Remodel", "kitchen-remodel"),
            ("Bathroom Renovation", "bathroom-renovation"),
            ("Flooring", "flooring"),
        ]:
            Service.objects.get_or_create(name=name, slug=slug)
        self.stdout.write(self.style.SUCCESS("Services ready"))

        ImageModel = get_image_model()

        def make_demo_image(name: str, color: str, size=(1200, 800)):
            buf = BytesIO()
            img = PILImage.new("RGB", size, color)
            draw = ImageDraw.Draw(img)
            text = name
            # Basic text placement
            try:
                font = ImageFont.load_default()
            except Exception:
                font = None
            bbox = draw.textbbox((0, 0), text, font=font) if hasattr(draw, "textbbox") else (0, 0, 400, 50)
            tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
            draw.text(((size[0] - tw) / 2, (size[1] - th) / 2), text, fill=(255, 255, 255), font=font)
            img.save(buf, format="JPEG", quality=85)
            return ContentFile(buf.getvalue(), name=f"{name.replace(' ', '_').lower()}.jpg")

        def add_images_to_project(page: ProjectPage, label: str):
            files = [
                make_demo_image(f"{label} 1", "#2563eb"),
                make_demo_image(f"{label} 2", "#16a34a"),
            ]
            blocks = []
            for f in files:
                im = ImageModel(title=f"{label}", file=f)
                im.save()
                blocks.append(("image", im))
            page.gallery = blocks
            page.save_revision().publish()

        created = 0
        if not ProjectPage.objects.filter(slug="modern-kitchen").exists():
            proj = ProjectPage(title="Modern Kitchen", slug="modern-kitchen", city="Austin", date=timezone.now().date())
            root.add_child(instance=proj)
            proj.save_revision().publish()
            add_images_to_project(proj, "Modern Kitchen")
            created += 1
        if not ProjectPage.objects.filter(slug="cozy-bathroom").exists():
            proj = ProjectPage(title="Cozy Bathroom", slug="cozy-bathroom", city="Seattle", date=timezone.now().date())
            root.add_child(instance=proj)
            proj.save_revision().publish()
            add_images_to_project(proj, "Cozy Bathroom")
            created += 1
        if not ProjectPage.objects.filter(slug="outdoor-deck").exists():
            proj = ProjectPage(title="Outdoor Deck", slug="outdoor-deck", city="Denver", date=timezone.now().date())
            root.add_child(instance=proj)
            proj.save_revision().publish()
            add_images_to_project(proj, "Outdoor Deck")
            created += 1
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created {created} project(s) with images"))

        # Ensure a default site exists pointing to root
        site = Site.objects.filter(is_default_site=True).first()
        if not site:
            Site.objects.create(
                hostname="localhost",
                site_name="Trades CMS",
                port=8000,
                root_page=root,
                is_default_site=True,
            )
            self.stdout.write(self.style.SUCCESS("Default site configured"))

        self.stdout.write(self.style.SUCCESS("Demo content seeded"))
