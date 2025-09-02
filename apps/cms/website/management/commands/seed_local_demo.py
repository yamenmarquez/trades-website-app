from django.core.management.base import BaseCommand
from wagtail.models import Page
from website.models_pages import ServicesIndexPage, ServicePage
from website.models import Testimonial
from website.models_local import GeoArea, ServiceCoverage


LOREM = ("We provide local expertise and fast response. " * 120).strip()


class Command(BaseCommand):
    help = "Create demo GeoArea + Coverage ready for one service"

    def handle(self, *args, **opts):
        # Ensure a city exists
        city, _ = GeoArea.objects.get_or_create(
            type='city', slug='miami', defaults={'name': 'Miami'}
        )

        # Ensure a service exists under ServicesIndexPage
        sidx = ServicesIndexPage.objects.first()
        if not sidx:
            root = Page.get_first_root_node()
            sidx = ServicesIndexPage(title='Services')
            root.add_child(instance=sidx)
            sidx.save_revision().publish()

        service = ServicePage.objects.first()
        if not service:
            service = ServicePage(title='Glass Installation', slug='glass-installation')
            sidx.add_child(instance=service)
            service.save_revision().publish()

        # Create coverage
        cov, created = ServiceCoverage.objects.get_or_create(
            service=service,
            geoarea=city,
            defaults={
                'status': 'ready',
                'unique_intro': LOREM,
                'starting_price_local': '$199',
            },
        )
        if not created:
            cov.status = 'ready'
            cov.unique_intro = LOREM
            cov.starting_price_local = '$199'
        # Ensure we have at least 6 modules with image tags in text
        cov.process_steps_local = [
            {
                'type': 'step',
                'value': {
                    'title': f'Step {i+1}',
                    'text': f"<p>Detailed local process step {i+1} for service in {city.name}.</p><img src='https://example.com/img{i}.jpg' alt='img{i}' />",
                },
            }
            for i in range(6)
        ]
        cov.pain_points_local = [
            {
                'type': 'point',
                'value': {
                    'title': f'Pain point {i+1}',
                    'text': f"<p>Local pain point {i+1} addressed thoroughly with actionable guidance in {city.name}.</p>",
                },
            }
            for i in range(3)
        ]
        cov.permits_local = [
            {
                'type': 'permit',
                'value': {
                    'title': f'Permit {i+1}',
                    'text': f"<p>Permit requirement {i+1} for {city.name} including links and timelines.</p>",
                },
            }
            for i in range(3)
        ]
        cov.save()

        # Ensure at least one local testimonial exists for quality gate
        Testimonial.objects.get_or_create(
            name='Local Customer',
            rating=5,
            quote='Amazing service and fast response in the area!',
            defaults={'geoarea': city},
            geoarea=city,
        )

        self.stdout.write(self.style.SUCCESS('Local demo seed complete'))
