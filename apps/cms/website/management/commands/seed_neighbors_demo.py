from django.core.management.base import BaseCommand
from website.models_local import GeoArea


class Command(BaseCommand):
    help = "Create neighbor areas for demo: miami-beach, hialeah; link to miami."

    def handle(self, *args, **opts):
        miami, _ = GeoArea.objects.get_or_create(type='city', slug='miami', defaults={'name': 'Miami'})
        mb, _ = GeoArea.objects.get_or_create(type='city', slug='miami-beach', defaults={'name': 'Miami Beach'})
        hil, _ = GeoArea.objects.get_or_create(type='city', slug='hialeah', defaults={'name': 'Hialeah'})
        miami.neighbors.add(mb, hil)
        self.stdout.write(self.style.SUCCESS("Neighbors linked: miami <-> {miami-beach, hialeah}"))
