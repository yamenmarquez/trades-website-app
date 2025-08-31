from django.core.management.base import BaseCommand
from wagtail.models import Site as WagtailSite
from website.models import Service, ServiceArea, Testimonial, Project, SiteSettings


class Command(BaseCommand):
    help = 'Load initial seed data'

    def handle(self, *args, **options):
        # Services
        s1, _ = Service.objects.get_or_create(name='Shower Doors', defaults={'description': '<p>Frameless & framed</p>'})
        s2, _ = Service.objects.get_or_create(name='Glass Railings', defaults={'description': '<p>Residential & Commercial</p>'})

        # Areas
        a1, _ = ServiceArea.objects.get_or_create(name='Houston, TX', defaults={'city': 'Houston', 'state': 'TX'})
        a2, _ = ServiceArea.objects.get_or_create(name='Katy, TX', defaults={'city': 'Katy', 'state': 'TX'})

        # Testimonials
        Testimonial.objects.get_or_create(name='Jane D.', rating=5, quote='Excellent work!')

        # Projects (without images initially)
        p1, _ = Project.objects.get_or_create(title='Luxury Shower Remodel', defaults={'city': 'Houston'})
        p1.services.add(s1)

        # Theme defaults
        site = WagtailSite.objects.first()
        if site:
            settings = SiteSettings.for_site(site)
            settings.primary = '#0ea5e9'
            settings.accent = '#22c55e'
            settings.neutral = '#0f172a'
            settings.radius = '16px'
            settings.font_body = 'Inter, ui-sans-serif, system-ui'
            settings.font_heading = 'Poppins, ui-sans-serif, system-ui'
            settings.layout_variant = 'modern-pro'
            settings.phone = '+1 713-000-0000'
            settings.save()

        self.stdout.write(self.style.SUCCESS('Seed loaded'))
