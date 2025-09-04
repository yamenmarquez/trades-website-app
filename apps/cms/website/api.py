from rest_framework import viewsets, serializers
from rest_framework.response import Response
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from wagtail.models import Site as WagtailSite

from .serializers import ConfigSerializer
from .views import (
    ServiceViewSet,
    ProjectViewSet,
    TestimonialViewSet,
    ServiceAreaViewSet,
    LeadViewSet,
)

# Optional local SEO viewsets
try:  # pragma: no cover
    from .views import GeoAreaViewSet, ServiceCoverageViewSet
    HAS_LOCAL = True
except Exception:  # pragma: no cover
    GeoAreaViewSet = None  # type: ignore
    ServiceCoverageViewSet = None  # type: ignore
    HAS_LOCAL = False


class ThemeAliasSerializer(serializers.Serializer):
    primary = serializers.CharField()
    accent = serializers.CharField()
    neutral = serializers.CharField()
    radius = serializers.CharField()
    font_body = serializers.CharField()
    font_heading = serializers.CharField()
    layout_variant = serializers.CharField()
    phone = serializers.CharField(allow_blank=True)
    whatsapp = serializers.CharField(allow_blank=True)
    email = serializers.CharField(allow_blank=True)
    address = serializers.CharField(allow_blank=True)
    local_seo_enabled = serializers.BooleanField()
    primary_city_slug = serializers.CharField(allow_blank=True)
    gbp_url = serializers.CharField(allow_blank=True)
    service_radius_km = serializers.IntegerField()
    default_utm_source = serializers.CharField(allow_blank=True)
    default_utm_campaign = serializers.CharField(allow_blank=True)


class ThemeAliasViewSet(viewsets.ViewSet):
    """
    /api/themes/ → list with a single object exposing SiteSettings tokens
    for compatibility and API root visibility.
    """

    def list(self, request):  # type: ignore[override]
        site = WagtailSite.find_for_request(request) or WagtailSite.objects.first()
        cfg = ConfigSerializer.from_site(site)  # maps SiteSettings to config/theme tokens
        data = ThemeAliasSerializer(cfg).data
        return Response([data])


router = DefaultRouter()
router.register(r"services", ServiceViewSet, basename="services")
router.register(r"projects", ProjectViewSet, basename="projects")
router.register(r"testimonials", TestimonialViewSet, basename="testimonials")
router.register(r"areas", ServiceAreaViewSet, basename="areas")
router.register(r"leads", LeadViewSet, basename="leads")
if HAS_LOCAL and GeoAreaViewSet is not None:
    router.register(r"geoareas", GeoAreaViewSet, basename="geoareas")
if HAS_LOCAL and ServiceCoverageViewSet is not None:
    router.register(r"coverage", ServiceCoverageViewSet, basename="coverage")
router.register(r"themes", ThemeAliasViewSet, basename="themes")


urlpatterns = [
    path("", include(router.urls)),
]
