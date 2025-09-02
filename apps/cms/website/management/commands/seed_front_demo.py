from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.db import transaction
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

from wagtail.models import Page, Site
from wagtail.images import get_image_model
from website.models_pages import (
    ServicesIndexPage,
    ServicePage,
    PortfolioIndexPage,
    ProjectPage,
)
from website.models_local import GeoArea, ServiceCoverage
from website.models import Testimonial
from website.models_settings import LocalSEOSettings


# Util: create in-memory PNG image
def make_png(w: int = 1600, h: int = 1066, text: str = "Demo", bg=(220, 230, 240)) -> ContentFile:
    img = Image.new("RGB", (w, h), bg)
    d = ImageDraw.Draw(img)
    try:
        font = ImageFont.load_default()
    except Exception:
        font = None
    label = f"{text} {w}x{h}"
    try:
        # Pillow <10 compatible API
        tw, th = d.textsize(label, font=font)
    except Exception:
        # Fallback if textsize not available
        tw = len(label) * 6
        th = 12
    d.text(((w - tw) / 2, (h - th) / 2), label, fill=(30, 30, 30), font=font)
    buf = BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return ContentFile(buf.getvalue(), name=f"{text.lower().replace(' ','-')}-{w}x{h}.png")


def ensure_index(model_cls, title: str):
    root = Page.get_first_root_node()
    idx = model_cls.objects.first()
    if not idx:
        idx = model_cls(title=title)
        root.add_child(instance=idx)
        idx.save_revision().publish()
    elif not idx.live:
        idx.save_revision().publish()
    return idx


class Command(BaseCommand):
    help = (
        "Seed demo: GeoArea city, 3 services, ready coverage, local testimonials, and 6+ projects "
        "with generated images."
    )

    @transaction.atomic
    def handle(self, *args, **opts):
        # 1) Ensure a Site exists and toggle Local SEO settings ON
        root = Page.get_first_root_node()
        site = Site.objects.first()
        if not site:
            site, _ = Site.objects.get_or_create(
                hostname="localhost",
                defaults={
                    "site_name": "Localhost",
                    "port": 8000,
                    "root_page": root,
                    "is_default_site": True,
                },
            )
        try:
            settings = LocalSEOSettings.for_site(site)
        except Exception:
            settings = LocalSEOSettings(site=site)
        settings.local_seo_enabled = True
        settings.primary_city_slug = "miami"
        settings.gbp_url = "https://google.com/maps/?q=your+business"
        settings.service_radius_km = 25
        settings.save()

        # 2) Ensure index pages exist and are live
        sidx = ensure_index(ServicesIndexPage, "Services")
        pidx = ensure_index(PortfolioIndexPage, "Portfolio")

        # 3) City
        city, _ = GeoArea.objects.get_or_create(
            type="city", slug="miami", defaults={"name": "Miami"}
        )

        # 4) Services (3)
        service_defs = [
            ("glass-installation", "Glass Installation"),
            ("shower-enclosures", "Shower Enclosures"),
            ("window-repair", "Window Repair"),
        ]
        services = []
        for slug, title in service_defs:
            svc = ServicePage.objects.filter(slug=slug).first()
            if not svc:
                svc = ServicePage(title=title, slug=slug)
                sidx.add_child(instance=svc)
                svc.save_revision().publish()
            elif not svc.live:
                svc.save_revision().publish()
            services.append(svc)

        # 5) Generate images in Wagtail
        ImageModel = get_image_model()
        image_objs = []
        for i in range(1, 7 + 1):
            cf = make_png(text=f"Project {i}")
            img = ImageModel(title=f"Project {i}", file=cf)
            img.save()
            image_objs.append(img)

        # 6) Projects (6), one main image each; tag with service and geoarea
        projects = []
        for i in range(1, 7 + 1):
            title = f"Miami Project {i}"
            slug = f"miami-project-{i}"
            if not ProjectPage.objects.filter(slug=slug).exists():
                p = ProjectPage(title=title, slug=slug, city="Miami")
                pidx.add_child(instance=p)
                # try gallery assignment first (StreamField with ImageChooserBlock)
                if hasattr(p, "gallery"):
                    try:
                        gallery_items = [
                            {"type": "image", "value": image_objs[(i - 1) % len(image_objs)].id}
                        ]
                        p.gallery = gallery_items
                    except Exception:
                        pass
                # also set before/after when possible
                try:
                    p.before_image = image_objs[(i - 1) % len(image_objs)]
                    p.after_image = image_objs[(i) % len(image_objs)]
                except Exception:
                    pass
                p.save_revision().publish()
                # optional M2M geoareas
                if hasattr(p, "geoareas"):
                    p.geoareas.add(city)
                # tag services (both slug and title for flexible filtering)
                try:
                    svc = services[(i - 1) % len(services)]
                    p.services.add(svc.slug, svc.title)
                except Exception:
                    pass
                p.save()  # persist tag relations
                projects.append(p)

        # 7) Ready coverage for first service with enough content to pass quality gate
        svc0 = services[0]
        cov, created = ServiceCoverage.objects.get_or_create(
            service=svc0,
            geoarea=city,
            defaults={
                "status": "ready",
                # lots of words to meet 700+ threshold
                "unique_intro": ("We provide local expertise and fast response in Miami. " * 120).strip(),
                "starting_price_local": "$199",
            },
        )
        cov.status = "ready"
        cov.unique_intro = ("We provide local expertise and fast response in Miami. " * 120).strip()
        cov.starting_price_local = "$199"
        # attach hero image
        try:
            cov.hero_media = image_objs[0]
        except Exception:
            pass
        # process steps with <img> to count as images
        cov.process_steps_local = [
            {
                "type": "step",
                "value": {
                    "title": f"Step {j}",
                    "text": (
                        f"<p>Detailed local process step {j} for service in {city.name}.</p>"
                        f"<img src='https://example.com/img{j}.jpg' alt='img{j}' />"
                    ),
                },
            }
            for j in range(1, 6 + 1)
        ]
        cov.pain_points_local = [
            {
                "type": "point",
                "value": {
                    "title": f"Pain point {j}",
                    "text": f"<p>Local pain point {j} with guidance tailored to {city.name}.</p>",
                },
            }
            for j in range(1, 3 + 1)
        ]
        cov.permits_local = [
            {
                "type": "permit",
                "value": {
                    "title": f"Permit {j}",
                    "text": f"<p>Permit requirement {j} in {city.name} including links and timelines.</p>",
                },
            }
            for j in range(1, 3 + 1)
        ]
        cov.save()

        # 8) Local testimonials (≥3, anchored to geoarea)
        Testimonial.objects.get_or_create(
            name="Juan Pérez",
            defaults={
                "rating": 5,
                "source": "Google",
                "quote": "Excelente trabajo en Miami.",
                "geoarea": city,
            },
            geoarea=city,
        )
        Testimonial.objects.get_or_create(
            name="María López",
            defaults={
                "rating": 5,
                "source": "Yelp",
                "quote": "Rápidos y profesionales.",
                "geoarea": city,
            },
            geoarea=city,
        )
        Testimonial.objects.get_or_create(
            name="Carlos Díaz",
            defaults={
                "rating": 4,
                "source": "Facebook",
                "quote": "Buena calidad y precio justo.",
                "geoarea": city,
            },
            geoarea=city,
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Demo seeded: city=miami, services=3, projects>=6, testimonials=3, local SEO ON"
            )
        )
